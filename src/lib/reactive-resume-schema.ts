// Types compatibles avec Reactive-Resume Schema

export interface URL {
  href: string;
  label?: string;
}

export interface CustomField {
  id: string;
  icon: string;
  name: string;
  value: string;
}

export interface Basics {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  url: URL;
  customFields: CustomField[];
  picture: {
    url: string;
    size: number;
    aspectRatio: number;
    borderRadius: number;
    effects: {
      hidden: boolean;
      border: boolean;
      grayscale: boolean;
    };
  };
}

export interface SectionWithItem<T> {
  id: string;
  name: string;
  items: T[];
  visible: boolean;
  columns: number;
  separateLinks: boolean;
}

export interface SummarySection {
  id: string;
  name: string;
  content: string;
  visible: boolean;
  columns: number;
}

export interface Profile {
  id: string;
  icon: string;
  username: string;
  url: URL;
  visible: boolean;
}

export interface ProfilesSection {
  id: string;
  name: string;
  items: Profile[];
  visible: boolean;
  columns: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Education {
  id: string;
  institution: string;
  area: string;
  studyType: string;
  score: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Award {
  id: string;
  title: string;
  awarder: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  keywords: string[];
  visible: boolean;
}

export interface Interest {
  id: string;
  name: string;
  keywords: string[];
  visible: boolean;
}

export interface Publication {
  id: string;
  name: string;
  publisher: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Volunteer {
  id: string;
  organization: string;
  position: string;
  location: string;
  date: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface Language {
  id: string;
  name: string;
  description: string;
  level: number;
  visible: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  date: string;
  summary: string;
  keywords: string[];
  url: URL;
  visible: boolean;
}

export interface Reference {
  id: string;
  name: string;
  description: string;
  summary: string;
  url: URL;
  visible: boolean;
}

export interface CustomSection {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  summary: string;
  keywords: string[];
  url: URL;
  visible: boolean;
}

export interface CustomSectionGroup {
  id: string;
  name: string;
  items: CustomSection[];
  visible: boolean;
  columns: number;
  separateLinks: boolean;
}

export interface Sections {
  summary: SummarySection;
  profiles: ProfilesSection;
  experience: SectionWithItem<Experience>;
  education: SectionWithItem<Education>;
  awards: SectionWithItem<Award>;
  certifications: SectionWithItem<Certification>;
  skills: SectionWithItem<Skill>;
  interests: SectionWithItem<Interest>;
  publications: SectionWithItem<Publication>;
  volunteer: SectionWithItem<Volunteer>;
  languages: SectionWithItem<Language>;
  projects: SectionWithItem<Project>;
  references: SectionWithItem<Reference>;
  custom: Record<string, CustomSectionGroup>;
}

export interface Metadata {
  template: string;
  layout: SectionKey[][][];
  css: {
    value: string;
    visible: boolean;
  };
  page: {
    margin: number;
    format: 'a4' | 'letter';
    options: {
      breakLine: boolean;
      pageNumbers: boolean;
    };
  };
  theme: {
    background: string;
    text: string;
    primary: string;
  };
  typography: {
    font: {
      family: string;
      subset: string;
      variants: string[];
      size: number;
    };
    lineHeight: number;
    hideIcons: boolean;
    underlineLinks: boolean;
  };
  notes: string;
}

export interface ResumeData {
  basics: Basics;
  sections: Sections;
  metadata: Metadata;
}

export type SectionKey =
  | 'summary'
  | 'profiles'
  | 'experience'
  | 'education'
  | 'awards'
  | 'certifications'
  | 'skills'
  | 'interests'
  | 'publications'
  | 'volunteer'
  | 'languages'
  | 'projects'
  | 'references'
  | `custom.${string}`;
