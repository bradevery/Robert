/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Types complets pour toutes les sections du CV Builder
 * Basé sur les requirements pour l'analyse et l'amélioration du contenu
 */

// ============================================
// BASE TYPES
// ============================================

export interface ContentImprovement {
  message: string;
  replacements?: Array<{
    value: string;
  }>;
  type:
    | 'style'
    | 'uncategorized'
    | 'grammar'
    | 'spelling'
    | 'NO_NUMBER'
    | 'BULLET_ENDING';
  range: [number, number];
  groupType:
    | 'WORDING_AND_READABILITY'
    | 'RECOMMENDATIONS'
    | 'GRAMMAR'
    | 'SPELLING';
  value: string;
  record: 'Item' | 'Section';
  id: string;
  hash: string;
  isLocked: boolean;
}

export interface Alignment {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'middle' | 'bottom';
}

// ============================================
// SUMMARY SECTION
// ============================================

export interface SummarySectionItem {
  id: string[];
  text: ContentImprovement[];
  alignment: Alignment[];
}

export interface SummarySection {
  items: SummarySectionItem[];
  name: string[];
}

// ============================================
// EXPERIENCE SECTION
// ============================================

export interface ExperienceSectionItem {
  id: string;
  position: string;
  workplace: string;
  description: string;
  location: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  link: string;
  table: any[]; // Pour les données tabulaires si nécessaire
  bullets: Array<ContentImprovement[]>;
  companyLogo: string;
  alignment: Alignment[];
  // Champs additionnels pour compatibilité
  company?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  url?: string;
  visible?: boolean;
}

export interface ExperienceSection {
  items: ExperienceSectionItem[];
  name: string;
  id: string;
  type: 'experience';
  columns: number;
  visible: boolean;
}

// ============================================
// EDUCATION SECTION
// ============================================

export interface EducationSectionItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  gpa: string;
  gpaText: string;
  maxGpa: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  bullets: Array<ContentImprovement[]>;
  companyLogo: string;
  alignment: Alignment[];
  // Champs additionnels pour compatibilité
  startDate?: string;
  endDate?: string;
  summary?: string;
  area?: string;
  studyType?: string;
  score?: string;
  courses?: string[];
  visible?: boolean;
}

export interface EducationSection {
  items: EducationSectionItem[];
  name: string;
  id: string;
  type: 'education';
  columns: number;
  visible: boolean;
}

// ============================================
// TALENT/SKILLS SECTION
// ============================================

export interface TalentSectionItem {
  id: string;
  title: string;
  icon: string;
  description: ContentImprovement[];
  alignment: Alignment[];
  // Champs additionnels pour compatibilité
  name?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  keywords?: string[];
  visible?: boolean;
}

export interface TalentSection {
  items: TalentSectionItem[];
  name: string;
  id: string;
  type: 'skills' | 'talent';
  columns: number;
  visible: boolean;
}

// ============================================
// ACHIEVEMENT/AWARDS SECTION
// ============================================

export interface AchievementSectionItem {
  id: string;
  icon: string;
  title: string;
  description: ContentImprovement[];
  alignment: Alignment[];
  // Champs additionnels pour compatibilité
  awarder?: string;
  date?: string;
  summary?: string;
  visible?: boolean;
}

export interface AchievementSection {
  items: AchievementSectionItem[];
  name: string;
  id: string;
  type: 'awards' | 'achievement';
  columns: number;
  visible: boolean;
}

// ============================================
// LANGUAGE SECTION
// ============================================

export interface LanguageSectionItem {
  id: string;
  name: string;
  level: number; // 1-5 ou 1-10
  levelText: string; // 'Natif', 'Courant', 'Intermédiaire', 'Débutant'
  // Champs additionnels
  fluency?: string;
  visible?: boolean;
}

export interface LanguageSection {
  items: LanguageSectionItem[];
  name: string;
  id: string;
  type: 'languages';
  columns: number;
  visible: boolean;
}

// ============================================
// TECHNOLOGY SECTION
// ============================================

export interface TechnologySectionItem {
  id: string;
  title: string;
  description: string;
  tags: string[][];
  // Champs additionnels
  level?: string;
  visible?: boolean;
}

export interface TechnologySection {
  items: TechnologySectionItem[];
  name: string;
  id: string;
  type: 'technology';
  columns: number;
  visible: boolean;
}

// ============================================
// COURSE SECTION
// ============================================

export interface CourseSectionItem {
  id: string;
  title: string;
  description: string;
  alignment: Alignment[];
  // Champs additionnels
  institution?: string;
  date?: string;
  url?: string;
  visible?: boolean;
}

export interface CourseSection {
  items: CourseSectionItem[];
  name: string;
  id: string;
  type: 'courses';
  columns: number;
  visible: boolean;
}

// ============================================
// PASSION/INTERESTS SECTION
// ============================================

export interface PassionSectionItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  alignment: Alignment[];
  // Champs additionnels
  keywords?: string[];
  visible?: boolean;
}

export interface PassionSection {
  items: PassionSectionItem[];
  name: string;
  id: string;
  type: 'interests' | 'passion';
  columns: number;
  visible: boolean;
}

// ============================================
// PROJECTS SECTION
// ============================================

export interface ProjectSectionItem {
  id: string;
  name: string;
  description: string;
  date: {
    startDate: string;
    endDate: string;
  };
  url: string;
  highlights: Array<ContentImprovement[]>;
  keywords: string[];
  alignment: Alignment[];
  visible?: boolean;
}

export interface ProjectSection {
  items: ProjectSectionItem[];
  name: string;
  id: string;
  type: 'projects';
  columns: number;
  visible: boolean;
}

// ============================================
// CERTIFICATIONS SECTION
// ============================================

export interface CertificationSectionItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
  summary: string;
  alignment: Alignment[];
  visible?: boolean;
}

export interface CertificationSection {
  items: CertificationSectionItem[];
  name: string;
  id: string;
  type: 'certifications';
  columns: number;
  visible: boolean;
}

// ============================================
// VOLUNTEER SECTION
// ============================================

export interface VolunteerSectionItem {
  id: string;
  organization: string;
  position: string;
  date: {
    startDate: string;
    endDate: string;
  };
  summary: string;
  highlights: string[];
  url: string;
  alignment: Alignment[];
  visible?: boolean;
}

export interface VolunteerSection {
  items: VolunteerSectionItem[];
  name: string;
  id: string;
  type: 'volunteer';
  columns: number;
  visible: boolean;
}

// ============================================
// PUBLICATIONS SECTION
// ============================================

export interface PublicationSectionItem {
  id: string;
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
  alignment: Alignment[];
  visible?: boolean;
}

export interface PublicationSection {
  items: PublicationSectionItem[];
  name: string;
  id: string;
  type: 'publications';
  columns: number;
  visible: boolean;
}

// ============================================
// REFERENCES SECTION
// ============================================

export interface ReferenceSectionItem {
  id: string;
  name: string;
  reference: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
  alignment: Alignment[];
  visible?: boolean;
}

export interface ReferenceSection {
  items: ReferenceSectionItem[];
  name: string;
  id: string;
  type: 'references';
  columns: number;
  visible: boolean;
}

// ============================================
// PROFIL SECTION (French specific)
// ============================================

export interface ProfilSectionItem {
  id: string;
  content: string;
  improvements: ContentImprovement[];
  alignment: Alignment[];
}

export interface ProfilSection {
  items: ProfilSectionItem[];
  name: string;
  id: string;
  type: 'profil';
  columns: number;
  visible: boolean;
  content?: string; // Pour compatibilité avec le format actuel
}

// ============================================
// UNION TYPE FOR ALL SECTIONS
// ============================================

export type ResumeSection =
  | SummarySection
  | ExperienceSection
  | EducationSection
  | TalentSection
  | AchievementSection
  | LanguageSection
  | TechnologySection
  | CourseSection
  | PassionSection
  | ProjectSection
  | CertificationSection
  | VolunteerSection
  | PublicationSection
  | ReferenceSection
  | ProfilSection;

export type ResumeSectionItem =
  | SummarySectionItem
  | ExperienceSectionItem
  | EducationSectionItem
  | TalentSectionItem
  | AchievementSectionItem
  | LanguageSectionItem
  | TechnologySectionItem
  | CourseSectionItem
  | PassionSectionItem
  | ProjectSectionItem
  | CertificationSectionItem
  | VolunteerSectionItem
  | PublicationSectionItem
  | ReferenceSectionItem
  | ProfilSectionItem;

// ============================================
// SECTION TYPE MAPPING
// ============================================

export const SECTION_TYPE_MAP = {
  summary: 'SummarySection',
  profil: 'ProfilSection',
  experience: 'ExperienceSection',
  education: 'EducationSection',
  skills: 'TalentSection',
  talent: 'TalentSection',
  awards: 'AchievementSection',
  achievement: 'AchievementSection',
  languages: 'LanguageSection',
  technology: 'TechnologySection',
  courses: 'CourseSection',
  interests: 'PassionSection',
  passion: 'PassionSection',
  projects: 'ProjectSection',
  certifications: 'CertificationSection',
  volunteer: 'VolunteerSection',
  publications: 'PublicationSection',
  references: 'ReferenceSection',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Crée un nouvel item vide pour une section donnée
 */
export function createEmptyItem(sectionType: string): any {
  switch (sectionType) {
    case 'experience':
      return {
        id: `exp_${Date.now()}`,
        position: '',
        workplace: '',
        company: '',
        description: '',
        location: '',
        dateRange: { startDate: '', endDate: '' },
        startDate: '',
        endDate: '',
        link: '',
        url: '',
        table: [],
        bullets: [],
        highlights: [],
        companyLogo: '',
        alignment: [],
        visible: true,
      };

    case 'education':
      return {
        id: `edu_${Date.now()}`,
        degree: '',
        institution: '',
        location: '',
        gpa: '',
        gpaText: '',
        maxGpa: '',
        score: '',
        dateRange: { startDate: '', endDate: '' },
        startDate: '',
        endDate: '',
        bullets: [],
        companyLogo: '',
        alignment: [],
        visible: true,
      };

    case 'skills':
    case 'talent':
      return {
        id: `skill_${Date.now()}`,
        title: '',
        name: '',
        icon: '',
        description: [],
        level: '',
        keywords: [],
        alignment: [],
        visible: true,
      };

    case 'languages':
      return {
        id: `lang_${Date.now()}`,
        name: '',
        level: 0,
        levelText: '',
        fluency: '',
        visible: true,
      };

    case 'projects':
      return {
        id: `proj_${Date.now()}`,
        name: '',
        description: '',
        date: { startDate: '', endDate: '' },
        url: '',
        highlights: [],
        keywords: [],
        alignment: [],
        visible: true,
      };

    case 'certifications':
      return {
        id: `cert_${Date.now()}`,
        name: '',
        issuer: '',
        date: '',
        url: '',
        summary: '',
        alignment: [],
        visible: true,
      };

    case 'volunteer':
      return {
        id: `vol_${Date.now()}`,
        organization: '',
        position: '',
        date: { startDate: '', endDate: '' },
        summary: '',
        highlights: [],
        url: '',
        alignment: [],
        visible: true,
      };

    case 'awards':
    case 'achievement':
      return {
        id: `award_${Date.now()}`,
        icon: '',
        title: '',
        description: [],
        awarder: '',
        date: '',
        summary: '',
        alignment: [],
        visible: true,
      };

    case 'publications':
      return {
        id: `pub_${Date.now()}`,
        name: '',
        publisher: '',
        releaseDate: '',
        url: '',
        summary: '',
        alignment: [],
        visible: true,
      };

    case 'references':
      return {
        id: `ref_${Date.now()}`,
        name: '',
        reference: '',
        position: '',
        company: '',
        email: '',
        phone: '',
        alignment: [],
        visible: true,
      };

    case 'interests':
    case 'passion':
      return {
        id: `int_${Date.now()}`,
        icon: '',
        title: '',
        description: '',
        keywords: [],
        alignment: [],
        visible: true,
      };

    case 'courses':
      return {
        id: `course_${Date.now()}`,
        title: '',
        description: '',
        institution: '',
        date: '',
        url: '',
        alignment: [],
        visible: true,
      };

    case 'technology':
      return {
        id: `tech_${Date.now()}`,
        title: '',
        description: '',
        tags: [],
        level: '',
        visible: true,
      };

    case 'profil':
      return {
        id: `profil_${Date.now()}`,
        content: '',
        improvements: [],
        alignment: [],
      };

    default:
      return {
        id: `item_${Date.now()}`,
        visible: true,
      };
  }
}

/**
 * Valide si un item a tous les champs requis
 */
export function validateItem(sectionType: string, item: any): boolean {
  switch (sectionType) {
    case 'experience':
      return !!(item.position && item.workplace);
    case 'education':
      return !!(item.degree && item.institution);
    case 'skills':
    case 'talent':
      return !!(item.title || item.name);
    case 'languages':
      return !!item.name;
    case 'projects':
      return !!item.name;
    default:
      return true;
  }
}
