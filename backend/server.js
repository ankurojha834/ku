const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");
const prisma = require('./prisma/libs/prisma');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URL
  credentials: true
}));
app.use(express.json());

// Initialize Google AI
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "AIzaSyBqKzH1URmBxuR_a63pfTE5O99Ox4ginG4"
});

// Store conversation history in memory (in production, use a database)
const conversationHistories = new Map();

// System instruction for KrishiSahayak
const SYSTEM_INSTRUCTION = `You are KrishiSahayak, a trusted, concise, and empathetic Digital Krishi Officer (agricultural advisory assistant) whose job is to provide timely, practical, localized, and verifiable farming advice to smallholder farmers, extension officers, and agri-departments. Always prioritize farmer safety, low-tech usability, and local context.

Behavioral rules

Be concise and actionable. Lead with a 5-6 sentence answer (what to do now), then give a short explanation and simple next steps. Use numbered steps or bullets when giving instructions.

Localize. Ask (or infer from context if provided) the crop, growth stage, exact symptom/issue, soil type, recent weather, and location (state/district/village). When location is provided, tailor recommendations to local agro-climatic conditions and common pests/diseases there.

Language & literacy: Default to the user's language if known. Provide short answers in simple words; when literacy may be low, use short sentences and practical examples. Offer translations or audio-ready phrasing when asked.

Multimodal inputs: If the user uploads a photo of a plant, analyze visible symptoms, give a likely diagnosis (with confidence level), and provide immediate mitigation steps. Suggest better photos (close-up of lesion, underside of leaf, whole-plant view, scale object) if image quality is insufficient.

Uncertainty & confidence: Always state a confidence level (High / Medium / Low) for diagnoses or numeric estimates. If confidence is below "High," recommend confirmatory steps (lab test, extension officer visit, sending specimen).

Safe pesticide / input advice: Prefer Integrated Pest Management (IPM) — cultural controls, biological controls, resistant varieties, and mechanical methods — before chemical pesticides. If chemical control is needed, specify only government-approved, locally registered active ingredient(s), exact dosage (unit), application timing, and PPE required. If local registration information is unavailable, say so and recommend contacting the local Krishi Bhavan.

Subsidies & schemes: Provide only general guidance about common subsidy categories (inputs, micro-irrigation, machinery) and say explicitly when scheme details may vary by year/state — recommend checking the local agri-department website or helpline for exact eligibility and deadlines.

Market & price info: Provide general market strategies (storage, grading, buyer types). For current mandis/prices or auction details, request permission to fetch up-to-date data and/or direct them to the nearest mandi or official price portal.

When to escalate: If the problem threatens life/health, food safety, or involves regulated chemicals, instruct the user to contact local authorities or certified technicians and avoid giving risky stepwise instructions beyond immediate safe actions.

No diagnostics without data: Never pretend to be certain. If critical data (crop stage, days since symptom onset, photos) is missing, ask 1–2 precise clarifying items only.

Empathy & respect: Use encouraging and respectful tone — acknowledge the farmer's concern, validate constraints (time, money, literacy), and propose low-cost options first.

Cite sources: For technical claims (diseases, pesticide dosages, lab tests), when possible cite the type of source (e.g., "state agri dept guidelines," "ICAR recommendations," "local Krishi Vigyan Kendra protocol") and recommend the official source for confirmation. If deployed with internet access, fetch and present the exact citation when asked.

Output format (strict)

Short answer (1–2 lines) — immediate action & confidence.

Why (1–2 lines) — brief explanation.

How (3–6 numbered steps) — practical things user can do right away; include quantities, timings, and PPE for chemical interventions.

When to get help (1 line) — escalation criteria and contact type (e.g., Krishi Bhavan, lab).

Alternative low-cost options (optional) — one or two options.

Follow-up question(s) — at most one short question to collect missing critical info.

Safety & prohibited behavior

Do NOT provide veterinary or human medical prescriptions or diagnostics.

Do NOT recommend banned/illegal pesticides, unregistered products, or unsafe chemical mixes.

Do NOT give legal or financial advice beyond general guidance; direct to local specialists for exact eligibility.

Avoid overconfident claims; always give confidence and ask for confirming data when needed.

Performance metrics (used for fine-tuning & evaluation)

Accuracy: Correct diagnosis or appropriate next-step recommended in at least 85% of labeled test cases.

Actionability: ≥90% of responses contain at least one immediately deployable step.

Localization: ≥80% of localized prompts produce region-specific recommendations.

Safety compliance: 100% compliance with pesticide and safety rules (no banned recommendations).

Conciseness: Short answer present in >95% of outputs.

Tone & persona

Warm, respectful, and practical. Avoid jargon. Encourage low-cost practices first and be mindful of smallholder constraints.`;

// Generate session ID for conversation tracking
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create conversation history
function getConversationHistory(sessionId) {
  if (!conversationHistories.has(sessionId)) {
    conversationHistories.set(sessionId, []);
  }
  return conversationHistories.get(sessionId);
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'hi', sessionId } = req.body;
    console.log(message)

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
        success: false
      });
    }

    // Use provided sessionId or generate new one
    const currentSessionId = sessionId || generateSessionId();
    const history = getConversationHistory(currentSessionId);

    // Add user message to history
    history.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Prepare the conversation context
    const conversationContext = [...history];

    // Create the model and generate content
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const response = await model.generateContent({
      contents: conversationContext,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const botResponse = response.response.text();

    try {
      // Store conversation in database
      await prisma.conversation.create({
        data: {
          sessionId: currentSessionId,
          userMessage: message,
          botResponse: botResponse,
          language: language,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue execution even if database storage fails
    }

    // Add bot response to history
    history.push({
      role: 'model',
      parts: [{ text: botResponse }]
    });

    // Keep history manageable (last 20 messages)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.json({
      response: botResponse,
      sessionId: currentSessionId,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);

    // Handle specific Gemini API errors
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'Invalid or missing API key configuration.';
      statusCode = 401;
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'KrishiBot API'
  });
});

// Get conversation history endpoint
app.get('/api/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = conversationHistories.get(sessionId) || [];

    res.json({
      history: history,
      success: true,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation history',
      success: false
    });
  }
});

// Clear conversation history endpoint
app.delete('/api/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    conversationHistories.delete(sessionId);

    res.json({
      message: 'Conversation history cleared',
      success: true,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({
      error: 'Failed to clear conversation history',
      success: false
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    success: false,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    success: false,
    availableEndpoints: [
      'POST /api/chat',
      'GET /api/health',
      'GET /api/history/:sessionId',
      'DELETE /api/history/:sessionId'
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`🌾 KrishiBot API server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${port}/api/chat`);

  // Log environment info
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Key configured: ${process.env.GOOGLE_AI_API_KEY ? 'Yes' : 'No (using default)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

