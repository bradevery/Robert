// Types pour le système de matching CV/Job

// Types de base inspirés de Resume-Matcher
export interface CVData {
  id: string;
  name: string;
  source: 'upload' | 'linkedin' | 'text';
  content: {
    personalInfo: PersonalInfo;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    summary: string;
    extractedKeywords: string[];
  };
  raw_text: string;
  processed_at: string;
}

export interface JobData {
  id: string;
  title: string;
  company?: string;
  description: string;
  requirements: string[];
  extractedKeywords: string[];
  parsed: {
    responsibilities: string[];
    qualifications: {
      required: string[];
      preferred: string[];
    };
    skills: string[];
    experience_required: string;
  };
  processed_at: string;
}

// Types inspirés de Hrflow
export interface PersonalInfo {
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  urls?: {
    type: string;
    url: string;
  }[];
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  skills?: string[];
  achievements?: string[];
}

export interface Education {
  degree: string;
  school: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

export interface Skill {
  name: string;
  type: 'hard' | 'soft' | 'technical' | 'language';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

// Types pour le scoring et les suggestions
export interface MatchingScore {
  overall: number;
  breakdown: {
    keywords: number;
    experience: number;
    skills: number;
    education: number;
    summary: number;
  };
  details: {
    matchedKeywords: string[];
    missingKeywords: string[];
    skillsMatch: SkillMatch[];
    experienceMatch: ExperienceMatch;
  };
}

export interface SkillMatch {
  skill: string;
  found: boolean;
  importance: 'high' | 'medium' | 'low';
  suggestions?: string[];
}

export interface ExperienceMatch {
  yearsRequired: number;
  yearsFound: number;
  relevantExperiences: Experience[];
  suggestions?: string[];
}

export interface SectionSuggestion {
  section: 'summary' | 'experience' | 'skills' | 'education' | 'keywords';
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  suggestions: Suggestion[];
  improvementTips: string[];
}

export interface Suggestion {
  type: 'add' | 'modify' | 'remove' | 'highlight';
  priority: 'high' | 'medium' | 'low';
  description: string;
  example?: string;
  impact: string; // Explication de l'impact de cette suggestion
}

// Types pour les APIs
export interface HrflowParseResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      info: PersonalInfo;
      experiences: Experience[];
      educations: Education[];
      skills: Skill[];
      summary: string;
    };
    parsing: {
      text: string;
      extractedKeywords: string[];
    };
  };
}

export interface LixitLinkedInResponse {
  success: boolean;
  message: string;
  data: {
    firstName: string;
    lastName: string;
    headline: string;
    summary: string;
    experiences: {
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string;
    }[];
    education: {
      school: string;
      degree: string;
      fieldOfStudy: string;
      startDate: string;
      endDate: string;
    }[];
    skills: string[];
    location: string;
  };
}

export interface OpenAIAnalysisRequest {
  cvData: CVData;
  jobData: JobData;
  analysisType: 'score' | 'suggestions' | 'improvement';
}

export interface OpenAIAnalysisResponse {
  success: boolean;
  data: {
    matchingScore: MatchingScore;
    suggestions: SectionSuggestion[];
    improvedCV?: string; // CV amélioré en format text/markdown
    reasoning: string; // Explication du raisonnement de l'IA
  };
}

// Types pour l'UI
export interface MatchingState {
  step: 1 | 2 | 3 | 4;
  cvData?: CVData;
  jobData?: JobData;
  isAnalyzing: boolean;
  results?: {
    score: MatchingScore;
    suggestions: SectionSuggestion[];
    improvedCV?: string;
  };
  error?: string;
}

export interface UploadProgress {
  stage: 'uploading' | 'parsing' | 'analyzing' | 'complete';
  progress: number;
  message: string;
}

// Types pour les prompts OpenAI (inspirés de Resume-Matcher)
export interface CVImprovementPrompt {
  systemPrompt: string;
  cvContent: string;
  jobDescription: string;
  extractedJobKeywords: string[];
  extractedCVKeywords: string[];
  currentScore: number;
  targetSection?: string;
}

export interface JobAnalysisPrompt {
  systemPrompt: string;
  jobDescription: string;
  extractKeywords: boolean;
  analyzeSections: boolean;
}

// Types pour l'interface Jobscan-like
export interface JobscanAnalysis {
  matchRate: {
    score: number;
    level: 'Low' | 'Medium' | 'High';
  };
  sections: {
    searchability: SearchabilitySection;
    hardSkills: SkillsSection;
    softSkills: SkillsSection;
    recruiterTips: RecruiterTipsSection;
    formatting: FormattingSection;
  };
  comparison: {
    resume: ResumeHighlights;
    jobDescription: JobHighlights;
  };
}

export interface SearchabilitySection {
  score: number;
  issues: SearchabilityIssue[];
  tips: string[];
}

export interface SearchabilityIssue {
  type:
    | 'ATS_tip'
    | 'contact_info'
    | 'summary'
    | 'section_headings'
    | 'job_title_match'
    | 'date_formatting'
    | 'education_match';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  status: 'error' | 'warning' | 'success';
}

export interface SkillsSection {
  score: number;
  total: number;
  matched: number;
  missing: number;
  comparison: SkillComparison[];
  tips: string[];
}

export interface SkillComparison {
  skill: string;
  inResume: boolean;
  inJob: boolean;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
}

export interface RecruiterTipsSection {
  score: number;
  tips: RecruiterTip[];
}

export interface RecruiterTip {
  type:
    | 'job_level_match'
    | 'measurable_results'
    | 'resume_tone'
    | 'web_presence'
    | 'word_count';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  status: 'error' | 'warning' | 'success';
}

export interface FormattingSection {
  score: number;
  layout: FormattingCheck;
  fontCheck: FormattingCheck;
  pageSetup: FormattingCheck;
}

export interface FormattingCheck {
  status: 'pass' | 'warning' | 'fail';
  message: string;
  suggestion?: string;
}

export interface ResumeHighlights {
  skills: string[];
  keywords: string[];
  experience: string[];
  education: string[];
}

export interface JobHighlights {
  requirements: string[];
  skills: string[];
  keywords: string[];
  qualifications: string[];
}

// Configuration
export interface MatcherConfig {
  openai: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  hrflow: {
    apiKey: string;
    sourceKey: string;
  };
  lixit: {
    apiKey: string;
  };
  scoring: {
    weights: {
      keywords: number;
      experience: number;
      skills: number;
      education: number;
      summary: number;
    };
    thresholds: {
      excellent: number;
      good: number;
      needsImprovement: number;
    };
  };
}
