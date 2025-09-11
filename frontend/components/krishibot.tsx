"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Send, Leaf, Sun, CloudRain, Sprout, Moon, Palette, Languages, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryColor, getCategoryIcon } from "@/lib/categoryUtils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  category?: "crop" | "weather" | "pest" | "fertilizer" | "general"
}

interface Theme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  icon: React.ReactNode
}

interface Language {
  code: string
  name: string
  flag: string
}

interface Translations {
  [key: string]: {
    title: string
    subtitle: string
    placeholder: string
    suggestions: string[]
    categories: {
      crop: string
      weather: string
      pest: string
      fertilizer: string
      general: string
    }
    welcomeMessage: string
    errorMessage: string
    themeSelector: string
    connecting: string
    apiError: string
  }
}

const languages: Language[] = [
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
]

const translations: Translations = {
  hi: {
    title: "KrishiBot",
    subtitle: "आपका डिजिटल कृषि सलाहकार",
    placeholder: "अपना सवाल यहाँ लिखें...",
    suggestions: ["फसल की जानकारी", "मौसम की स्थिति", "कीट नियंत्रण", "खाद की सलाह"],
    categories: {
      crop: "फसल",
      weather: "मौसम",
      pest: "कीट",
      fertilizer: "खाद",
      general: "सामान्य",
    },
    welcomeMessage:
      "नमस्ते! मैं KrishiBot हूं, आपका कृषि सहायक। मैं फसल, कीट, मौसम, और खाद के बारे में सुझाव दे सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    errorMessage: "माफ करें, कुछ तकनीकी समस्या है। कृपया दोबारा कोशिश करें।",
    themeSelector: "थीम चुनें:",
    connecting: "जुड़ रहे हैं...",
    apiError: "AI सेवा से जुड़ने में समस्या हो रही है। कृपया बाद में कोशिश करें।"
  },
  en: {
    title: "KrishiBot",
    subtitle: "Your Digital Agriculture Advisor",
    placeholder: "Type your question here...",
    suggestions: ["Crop Information", "Weather Status", "Pest Control", "Fertilizer Advice"],
    categories: {
      crop: "Crop",
      weather: "Weather",
      pest: "Pest",
      fertilizer: "Fertilizer",
      general: "General",
    },
    welcomeMessage:
      "Hello! I'm KrishiBot, your agriculture assistant. I can provide suggestions about crops, pests, weather, and fertilizers. How can I help you today?",
    errorMessage: "Sorry, there's a technical issue. Please try again.",
    themeSelector: "Choose Theme:",
    connecting: "Connecting...",
    apiError: "Having trouble connecting to AI service. Please try again later."
  },
  ml: {
    title: "KrishiBot",
    subtitle: "നിങ്ങളുടെ ഡിജിറ്റൽ കൃഷി ഉപദേശകൻ",
    placeholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    suggestions: ["വിള വിവരങ്ങൾ", "കാലാവസ്ഥ", "കീട നിയന്ത്രണം", "വളം ഉപദേശം"],
    categories: {
      crop: "വിള",
      weather: "കാലാവസ്ഥ",
      pest: "കീടം",
      fertilizer: "വളം",
      general: "പൊതുവായത്",
    },
    welcomeMessage:
      "നമസ്കാരം! ഞാൻ KrishiBot ആണ്, നിങ്ങളുടെ കൃഷി സഹായി. വിളകൾ, കീടങ്ങൾ, കാലാവസ്ഥ, വളങ്ങൾ എന്നിവയെക്കുറിച്ച് എനിക്ക് നിർദ്ദേശങ്ങൾ നൽകാൻ കഴിയും. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
    errorMessage: "ക്ഷമിക്കണം, ഒരു സാങ്കേതിക പ്രശ്നമുണ്ട്. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
    themeSelector: "തീം തിരഞ്ഞെടുക്കുക:",
    connecting: "കണക്ട് ചെയ്യുന്നു...",
    apiError: "AI സേവനവുമായി ബന്ധിപ്പിക്കുന്നതിൽ പ്രശ്നം. ദയവായി പിന്നീട് ശ്രമിക്കുക."
  },
}

const themes: Theme[] = [
  {
    name: "Green Fields",
    primary: "bg-green-600 hover:bg-green-700",
    secondary: "bg-green-100 dark:bg-green-900",
    accent: "text-green-600 dark:text-green-400",
    background: "from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900",
    icon: <Leaf className="w-4 h-4" />,
  },
  {
    name: "Golden Harvest",
    primary: "bg-amber-600 hover:bg-amber-700",
    secondary: "bg-amber-100 dark:bg-amber-900",
    accent: "text-amber-600 dark:text-amber-400",
    background: "from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900",
    icon: <Sun className="w-4 h-4" />,
  },
  {
    name: "Monsoon Blue",
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-blue-100 dark:bg-blue-900",
    accent: "text-blue-600 dark:text-blue-400",
    background: "from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900",
    icon: <CloudRain className="w-4 h-4" />,
  },
  {
    name: "Earth Brown",
    primary: "bg-amber-700 hover:bg-amber-800",
    secondary: "bg-amber-200 dark:bg-amber-800",
    accent: "text-amber-700 dark:text-amber-300",
    background: "from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-900",
    icon: <Sprout className="w-4 h-4" />,
  },
]

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Your backend URL
  endpoints: {
    chat: '/api/chat'
  }
}

export function KrishiBot() {
  const [currentLanguage, setCurrentLanguage] = useState<"hi" | "en" | "ml">("hi")
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  const t = translations[currentLanguage]

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t.welcomeMessage,
      sender: "bot",
      timestamp: new Date(),
      category: "general",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const theme = themes[currentTheme]

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: t.welcomeMessage,
        sender: "bot",
        timestamp: new Date(),
        category: "general",
      },
    ])
  }, [currentLanguage, t.welcomeMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const categorizeMessage = (text: string): Message["category"] => {
    const lowerText = text.toLowerCase()

    if (
      lowerText.includes("फसल") ||
      lowerText.includes("crop") ||
      lowerText.includes("വിള") ||
      lowerText.includes("wheat") ||
      lowerText.includes("rice") ||
      lowerText.includes("गेहूं") ||
      lowerText.includes("ചാവല")
    )
      return "crop"

    if (
      lowerText.includes("मौसम") ||
      lowerText.includes("weather") ||
      lowerText.includes("കാലാവസ്ഥ") ||
      lowerText.includes("rain") ||
      lowerText.includes("temperature") ||
      lowerText.includes("बारिश")
    )
      return "weather"

    if (
      lowerText.includes("कीट") ||
      lowerText.includes("pest") ||
      lowerText.includes("കീടം") ||
      lowerText.includes("insect") ||
      lowerText.includes("disease") ||
      lowerText.includes("बीमारी")
    )
      return "pest"

    if (
      lowerText.includes("खाद") ||
      lowerText.includes("fertilizer") ||
      lowerText.includes("വളം") ||
      lowerText.includes("nutrient") ||
      lowerText.includes("soil") ||
      lowerText.includes("മണ്ണ്")
    )
      return "fertilizer"

    return "general"
  }

  // Function to call the backend API
  const callKrishiAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.chat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          language: currentLanguage
        }),
      })
      console.log('API response status:' + response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response || data.message || "I apologize, but I couldn't process your request properly."
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      category: categorizeMessage(inputValue),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)
    setConnectionError(false)

    try {
      const botResponse = await callKrishiAPI(currentInput)
      console.log('Bot response:', botResponse);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        category: categorizeMessage(botResponse),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error getting bot response:", error)
      setConnectionError(true)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t.apiError,
        sender: "bot",
        timestamp: new Date(),
        category: "general",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 transition-all duration-500`}>
      <div className="max-w-4xl mx-auto">
        <Card className="min-h-[90vh] flex flex-col shadow-2xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className={`${theme.primary} text-white p-6 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 bg-white/20">
                  <AvatarFallback className="bg-white/20 text-white font-bold text-lg">🌾</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{t.title}</h1>
                  <p className="text-white/90 text-sm">{t.subtitle}</p>
                  {connectionError && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-yellow-300" />
                      <span className="text-xs text-yellow-300">Connection issues detected</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="text-white hover:bg-white/20"
                >
                  <Languages className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-white hover:bg-white/20"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="text-white hover:bg-white/20"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showLanguageSelector && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm mb-3 text-white/90">भाषा चुनें / Choose Language / ഭാഷ തിരഞ്ഞെടുക്കുക:</p>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={currentLanguage === lang.code ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setCurrentLanguage(lang.code as "hi" | "en" | "ml")
                        setShowLanguageSelector(false)
                      }}
                      className="flex items-center gap-2 text-white hover:bg-white/20"
                    >
                      <span>{lang.flag}</span>
                      <span className="text-xs">{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showThemeSelector && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm mb-3 text-white/90">{t.themeSelector}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {themes.map((themeItem, index) => (
                    <Button
                      key={themeItem.name}
                      variant={currentTheme === index ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setCurrentTheme(index)
                        setShowThemeSelector(false)
                      }}
                      className="flex items-center gap-2 text-white hover:bg-white/20"
                    >
                      {themeItem.icon}
                      <span className="text-xs">{themeItem.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      message.sender === "user" ? "ml-auto flex-row-reverse" : "",
                    )}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          message.sender === "user"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            : `${theme.secondary} ${theme.accent}`,
                        )}
                      >
                        {message.sender === "user" ? "👤" : "🌾"}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn("flex flex-col gap-1", message.sender === "user" ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 max-w-full break-words",
                          message.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-md"
                            : `${theme.secondary} text-gray-800 dark:text-gray-200 rounded-bl-md`,
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>

                      <div className="flex items-center gap-2 px-2">
                        {message.category && message.category !== "general" && (
                          <Badge variant="secondary" className={cn("text-xs", getCategoryColor(message.category))}>
                            {getCategoryIcon(message.category)}
                            <span className="ml-1 capitalize">{t.categories[message.category]}</span>
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString(
                            currentLanguage === "hi" ? "hi-IN" : currentLanguage === "ml" ? "ml-IN" : "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`${theme.secondary} ${theme.accent}`}>🌾</AvatarFallback>
                    </Avatar>
                    <div className={`${theme.secondary} rounded-2xl rounded-bl-md px-4 py-3`}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{t.connecting}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.placeholder}
                    disabled={isLoading}
                    className="resize-none border-2 focus:border-green-500 dark:focus:border-green-400"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(theme.primary, "px-6 py-2 transition-all duration-200")}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {t.suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}