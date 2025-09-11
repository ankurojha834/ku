-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('FARMER', 'EXTENSION_OFFICER', 'AGRI_EXPERT', 'ADMIN', 'BLOGGER');

-- CreateEnum
CREATE TYPE "public"."PestType" AS ENUM ('PEST', 'DISEASE', 'WEED', 'NUTRIENT_DEFICIENCY');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "language" TEXT NOT NULL DEFAULT 'hi',
    "role" "public"."UserRole" NOT NULL DEFAULT 'FARMER',
    "farmSize" DOUBLE PRECISION,
    "crops" TEXT[],
    "soilType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" SERIAL NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "experience" INTEGER,
    "farmingMethods" TEXT[],
    "certifications" TEXT[],
    "userId" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "authorId" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'hi',
    "confidence" TEXT,
    "category" TEXT,
    "cropType" TEXT,
    "location" TEXT,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "userId" INTEGER,
    "rating" INTEGER,
    "feedback" TEXT,
    "isHelpful" BOOLEAN,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crop_data" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "scientificName" TEXT,
    "category" TEXT NOT NULL,
    "season" TEXT[],
    "soilTypes" TEXT[],
    "phRange" TEXT,
    "temperature" TEXT,
    "rainfall" TEXT,
    "seedRate" TEXT,
    "spacing" TEXT,
    "fertilizer" JSONB,
    "commonPests" TEXT[],
    "commonDiseases" TEXT[],
    "suitableStates" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pest_diseases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PestType" NOT NULL,
    "scientificName" TEXT,
    "description" TEXT NOT NULL,
    "symptoms" TEXT[],
    "affectedCrops" TEXT[],
    "organicControl" TEXT[],
    "chemicalControl" TEXT[],
    "preventiveMeasures" TEXT[],
    "imageUrls" TEXT[],
    "references" TEXT[],
    "prevalentInStates" TEXT[],
    "seasonality" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pest_diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."market_data" (
    "id" SERIAL NOT NULL,
    "crop" TEXT NOT NULL,
    "variety" TEXT,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "market" TEXT NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "unit" TEXT NOT NULL DEFAULT 'quintal',
    "quality" TEXT,
    "quantity" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weather_data" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,
    "forecast" JSONB,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."government_schemes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "eligibility" TEXT[],
    "targetGroup" TEXT[],
    "crops" TEXT[],
    "benefitType" TEXT NOT NULL,
    "benefitAmount" TEXT,
    "applicationProcess" TEXT NOT NULL,
    "requiredDocuments" TEXT[],
    "deadlines" TEXT,
    "states" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactInfo" JSONB,
    "launchDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE INDEX "conversations_sessionId_idx" ON "public"."conversations"("sessionId");

-- CreateIndex
CREATE INDEX "conversations_category_idx" ON "public"."conversations"("category");

-- CreateIndex
CREATE INDEX "conversations_timestamp_idx" ON "public"."conversations"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "crop_data_name_key" ON "public"."crop_data"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pest_diseases_name_key" ON "public"."pest_diseases"("name");

-- CreateIndex
CREATE INDEX "market_data_crop_state_date_idx" ON "public"."market_data"("crop", "state", "date");

-- CreateIndex
CREATE INDEX "weather_data_location_date_idx" ON "public"."weather_data"("location", "date");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
