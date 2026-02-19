-- CreateEnum
CREATE TYPE "Role" AS ENUM ('freelancer', 'client');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('new', 'contacted', 'qualified', 'proposed', 'placed', 'rejected');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('immediate', '1month', '3months');

-- CreateEnum
CREATE TYPE "CandidateInvitationStatus" AS ENUM ('pending', 'opened', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('prospect', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "DossierStatus" AS ENUM ('draft', 'in-progress', 'submitted', 'won', 'lost');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "email_verified" BOOLEAN DEFAULT false,
    "emailVerificationToken" TEXT,
    "image" TEXT,
    "tel" TEXT,
    "password" TEXT,
    "lastEmailSent" TIMESTAMP(3),
    "lastVerificationReset" TIMESTAMP(3),
    "emailVerificationCount" INTEGER NOT NULL DEFAULT 0,
    "nationality" TEXT DEFAULT 'Française',
    "hasWorkPermit" BOOLEAN NOT NULL DEFAULT true,
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "rawText" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "data" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_views" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "french_resume_contexts" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "diplomeFrancais" JSONB NOT NULL DEFAULT '{}',
    "niveauRNCP" INTEGER,
    "statutActuel" TEXT,
    "conventionCollective" TEXT,
    "langues" JSONB NOT NULL DEFAULT '[]',
    "mobiliteGeographique" JSONB NOT NULL DEFAULT '{}',
    "permisConduire" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pretentionsSalariales" JSONB NOT NULL DEFAULT '{}',
    "disponibilite" TEXT,

    CONSTRAINT "french_resume_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_resume_data" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "hardSkills" JSONB NOT NULL DEFAULT '[]',
    "softSkills" JSONB NOT NULL DEFAULT '[]',
    "tools" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "fullTextEmbedding" JSONB,
    "keywordsEmbedding" JSONB,
    "skillsEmbedding" JSONB,
    "experienceEmbedding" JSONB,
    "secteursPertinents" TEXT[],
    "niveauExperience" TEXT,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalSkills" INTEGER NOT NULL DEFAULT 0,
    "totalExperience" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coherenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingTime" INTEGER,
    "extractionVersion" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "extracted_resume_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authenticity_scores" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "globalScore" DOUBLE PRECISION NOT NULL,
    "naturalLanguageScore" DOUBLE PRECISION NOT NULL,
    "coherenceScore" DOUBLE PRECISION NOT NULL,
    "personalityScore" DOUBLE PRECISION NOT NULL,
    "keywordDensity" DOUBLE PRECISION NOT NULL,
    "uniquenessScore" DOUBLE PRECISION NOT NULL,
    "issues" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authenticity_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "french_job_contexts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "typeEntreprise" TEXT,
    "tailleEntreprise" TEXT,
    "secteurActivite" TEXT,
    "typeContrat" TEXT,
    "conventionCollective" TEXT,
    "coefficientHierarchique" INTEGER,
    "statutCadre" BOOLEAN NOT NULL DEFAULT false,
    "niveauEtudesMin" TEXT,
    "diplomesAcceptes" TEXT[],
    "salaireMin" INTEGER,
    "salaireMax" INTEGER,
    "avantages" JSONB NOT NULL DEFAULT '[]',
    "teletravail" JSONB NOT NULL DEFAULT '{}',
    "mobiliteProfessionnelle" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "french_job_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_job_data" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "requiredSkills" JSONB NOT NULL DEFAULT '[]',
    "preferredSkills" JSONB NOT NULL DEFAULT '[]',
    "tools" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "fullTextEmbedding" JSONB,
    "requirementsEmbedding" JSONB,
    "cultureEmbedding" JSONB,
    "yearsExperienceMin" INTEGER,
    "yearsExperienceMax" INTEGER,
    "educationLevel" TEXT,
    "requiredLanguages" JSONB NOT NULL DEFAULT '[]',
    "companyValues" TEXT[],
    "workEnvironment" TEXT,
    "teamSize" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingTime" INTEGER,

    CONSTRAINT "extracted_job_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_analyses" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "authenticityBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "technicalSkillsScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "educationScore" DOUBLE PRECISION NOT NULL,
    "softSkillsScore" DOUBLE PRECISION NOT NULL,
    "culturalFitScore" DOUBLE PRECISION NOT NULL,
    "authenticityScore" DOUBLE PRECISION NOT NULL,
    "skillsAnalysis" JSONB NOT NULL,
    "frenchContextAnalysis" JSONB NOT NULL,
    "naturalSuggestions" JSONB NOT NULL,
    "overOptimizationFlags" JSONB NOT NULL DEFAULT '[]',
    "adaptiveWeights" JSONB NOT NULL,
    "sectorContext" TEXT,
    "analysisType" TEXT NOT NULL DEFAULT 'authentic',
    "processingTime" INTEGER NOT NULL,
    "matchingVersion" TEXT NOT NULL DEFAULT '2.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_improvements" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalContent" TEXT NOT NULL,
    "improvedContent" TEXT NOT NULL,
    "naturalChanges" JSONB NOT NULL,
    "originalScore" DOUBLE PRECISION NOT NULL,
    "improvedScore" DOUBLE PRECISION NOT NULL,
    "authenticityMaintained" BOOLEAN NOT NULL DEFAULT true,
    "userAccepted" BOOLEAN,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_improvements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "french_diplomas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "rncp" INTEGER,
    "type" TEXT NOT NULL,
    "equivalents" TEXT[],
    "europeanLevel" TEXT,
    "domains" TEXT[],

    CONSTRAINT "french_diplomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "french_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "siret" TEXT,
    "size" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "convention" TEXT,
    "cultureKeywords" TEXT[],
    "values" TEXT[],

    CONSTRAINT "french_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "french_skill_ontology" (
    "id" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "synonyms" TEXT[],
    "relatedSkills" TEXT[],
    "parentSkill" TEXT,
    "sectors" TEXT[],
    "jobTitles" TEXT[],
    "defaultLevel" TEXT,

    CONSTRAINT "french_skill_ontology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding_cache" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "embedding" JSONB,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "dimensions" INTEGER NOT NULL DEFAULT 1536,
    "tokenCount" INTEGER,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embedding_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authenticity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "resumeId" TEXT,
    "detectionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authenticity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_metrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "authenticMatches" INTEGER NOT NULL DEFAULT 0,
    "avgAuthenticityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgMatchScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suggestionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "suggestionsAccepted" INTEGER NOT NULL DEFAULT 0,
    "avgProcessingTime" INTEGER NOT NULL DEFAULT 0,
    "cacheHitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "matching_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "photo" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "seniorityLevel" TEXT,
    "tjm" INTEGER,
    "salaryExpectation" INTEGER,
    "availability" "Availability" NOT NULL DEFAULT 'immediate',
    "status" "CandidateStatus" NOT NULL DEFAULT 'new',
    "location" TEXT,
    "mobility" JSONB NOT NULL DEFAULT '{}',
    "remotePreference" TEXT,
    "skills" TEXT[],
    "tools" TEXT[],
    "certifications" TEXT[],
    "languages" JSONB NOT NULL DEFAULT '[]',
    "resumeId" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_invitations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "dossierId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "CandidateInvitationStatus" NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'prospect',
    "size" TEXT,
    "revenue" INTEGER,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_contacts" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossiers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "status" "DossierStatus" NOT NULL DEFAULT 'draft',
    "deadline" TIMESTAMP(3),
    "submissionDate" TIMESTAMP(3),
    "budget" INTEGER,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "requiredProfiles" INTEGER NOT NULL DEFAULT 1,
    "matchedProfiles" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "goNoGoScore" INTEGER,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossier_candidates" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "matchScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossier_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ao_analyses" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "summary" TEXT,
    "requiredSkills" JSONB NOT NULL DEFAULT '[]',
    "preferredSkills" JSONB NOT NULL DEFAULT '[]',
    "requiredProfiles" JSONB NOT NULL DEFAULT '[]',
    "risks" JSONB NOT NULL DEFAULT '[]',
    "opportunities" JSONB NOT NULL DEFAULT '[]',
    "goNoGoScore" INTEGER,
    "goNoGoReasons" JSONB NOT NULL DEFAULT '[]',
    "extractedBudget" INTEGER,
    "budgetAnalysis" TEXT,
    "keyDates" JSONB NOT NULL DEFAULT '[]',
    "evaluationCriteria" JSONB NOT NULL DEFAULT '[]',
    "sourceFile" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ao_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propales" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "introduction" TEXT,
    "approach" TEXT,
    "methodology" TEXT,
    "teamPresentation" TEXT,
    "pricing" JSONB NOT NULL DEFAULT '{}',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "proposedTeam" JSONB NOT NULL DEFAULT '[]',
    "pdfUrl" TEXT,
    "docxUrl" TEXT,
    "generatedBy" TEXT,
    "aiPromptUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "dossierId" TEXT,
    "candidateId" TEXT,
    "uploadedBy" TEXT,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT,
    "contextId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "tokens" INTEGER,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "config" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "companyLogo" TEXT,
    "defaultTemplate" TEXT,
    "openaiApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resumes_slug_key" ON "resumes"("slug");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE INDEX "resumes_slug_idx" ON "resumes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_auth_userId_key" ON "two_factor_auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "french_resume_contexts_resumeId_key" ON "french_resume_contexts"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_resume_data_resumeId_key" ON "extracted_resume_data"("resumeId");

-- CreateIndex
CREATE INDEX "extracted_resume_data_resumeId_idx" ON "extracted_resume_data"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "authenticity_scores_resumeId_key" ON "authenticity_scores"("resumeId");

-- CreateIndex
CREATE INDEX "authenticity_scores_globalScore_idx" ON "authenticity_scores"("globalScore");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "french_job_contexts_jobId_key" ON "french_job_contexts"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_job_data_jobId_key" ON "extracted_job_data"("jobId");

-- CreateIndex
CREATE INDEX "extracted_job_data_jobId_idx" ON "extracted_job_data"("jobId");

-- CreateIndex
CREATE INDEX "matching_analyses_resumeId_idx" ON "matching_analyses"("resumeId");

-- CreateIndex
CREATE INDEX "matching_analyses_jobId_idx" ON "matching_analyses"("jobId");

-- CreateIndex
CREATE INDEX "matching_analyses_userId_idx" ON "matching_analyses"("userId");

-- CreateIndex
CREATE INDEX "matching_analyses_overallScore_idx" ON "matching_analyses"("overallScore");

-- CreateIndex
CREATE INDEX "resume_improvements_resumeId_idx" ON "resume_improvements"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "french_diplomas_name_key" ON "french_diplomas"("name");

-- CreateIndex
CREATE INDEX "french_diplomas_level_idx" ON "french_diplomas"("level");

-- CreateIndex
CREATE INDEX "french_diplomas_type_idx" ON "french_diplomas"("type");

-- CreateIndex
CREATE UNIQUE INDEX "french_companies_siret_key" ON "french_companies"("siret");

-- CreateIndex
CREATE INDEX "french_companies_name_idx" ON "french_companies"("name");

-- CreateIndex
CREATE INDEX "french_companies_sector_idx" ON "french_companies"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "french_skill_ontology_skillName_key" ON "french_skill_ontology"("skillName");

-- CreateIndex
CREATE INDEX "french_skill_ontology_category_idx" ON "french_skill_ontology"("category");

-- CreateIndex
CREATE INDEX "french_skill_ontology_skillName_idx" ON "french_skill_ontology"("skillName");

-- CreateIndex
CREATE UNIQUE INDEX "embedding_cache_contentHash_key" ON "embedding_cache"("contentHash");

-- CreateIndex
CREATE INDEX "embedding_cache_contentHash_idx" ON "embedding_cache"("contentHash");

-- CreateIndex
CREATE INDEX "embedding_cache_expiresAt_idx" ON "embedding_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "authenticity_logs_userId_idx" ON "authenticity_logs"("userId");

-- CreateIndex
CREATE INDEX "authenticity_logs_detectionType_idx" ON "authenticity_logs"("detectionType");

-- CreateIndex
CREATE UNIQUE INDEX "matching_metrics_date_key" ON "matching_metrics"("date");

-- CreateIndex
CREATE INDEX "matching_metrics_date_idx" ON "matching_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_email_idx" ON "candidates"("email");

-- CreateIndex
CREATE INDEX "candidates_status_idx" ON "candidates"("status");

-- CreateIndex
CREATE INDEX "candidates_availability_idx" ON "candidates"("availability");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_invitations_token_key" ON "candidate_invitations"("token");

-- CreateIndex
CREATE INDEX "candidate_invitations_status_idx" ON "candidate_invitations"("status");

-- CreateIndex
CREATE INDEX "candidate_invitations_expiresAt_idx" ON "candidate_invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "dossiers_userId_idx" ON "dossiers"("userId");

-- CreateIndex
CREATE INDEX "dossiers_clientId_idx" ON "dossiers"("clientId");

-- CreateIndex
CREATE INDEX "dossiers_status_idx" ON "dossiers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dossier_candidates_dossierId_candidateId_key" ON "dossier_candidates"("dossierId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "ao_analyses_dossierId_key" ON "ao_analyses"("dossierId");

-- CreateIndex
CREATE INDEX "propales_dossierId_idx" ON "propales"("dossierId");

-- CreateIndex
CREATE INDEX "documents_dossierId_idx" ON "documents"("dossierId");

-- CreateIndex
CREATE INDEX "documents_candidateId_idx" ON "documents"("candidateId");

-- CreateIndex
CREATE INDEX "chat_threads_userId_idx" ON "chat_threads"("userId");

-- CreateIndex
CREATE INDEX "chat_messages_threadId_idx" ON "chat_messages"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "templates_slug_key" ON "templates"("slug");

-- CreateIndex
CREATE INDEX "templates_category_idx" ON "templates"("category");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_idx" ON "activity_logs"("entityType");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_views" ADD CONSTRAINT "resume_views_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "french_resume_contexts" ADD CONSTRAINT "french_resume_contexts_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_resume_data" ADD CONSTRAINT "extracted_resume_data_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticity_scores" ADD CONSTRAINT "authenticity_scores_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "french_job_contexts" ADD CONSTRAINT "french_job_contexts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_job_data" ADD CONSTRAINT "extracted_job_data_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_analyses" ADD CONSTRAINT "matching_analyses_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_analyses" ADD CONSTRAINT "matching_analyses_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_analyses" ADD CONSTRAINT "matching_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_improvements" ADD CONSTRAINT "resume_improvements_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticity_logs" ADD CONSTRAINT "authenticity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_invitations" ADD CONSTRAINT "candidate_invitations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_invitations" ADD CONSTRAINT "candidate_invitations_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_candidates" ADD CONSTRAINT "dossier_candidates_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_candidates" ADD CONSTRAINT "dossier_candidates_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ao_analyses" ADD CONSTRAINT "ao_analyses_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propales" ADD CONSTRAINT "propales_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
