import { create } from 'zustand';

import { ResumeData } from '@/lib/reactive-resume-schema';
import { createDateRange, generateId } from '@/lib/reactive-resume-utils';

export type ArtboardStore = {
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
};

// Create default resume data compatible with Reactive-Resume templates
const createDefaultResumeData = (): ResumeData => ({
  basics: {
    name: 'Jean Dupont',
    headline: 'Développeur Full Stack',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    url: {
      href: '',
      label: '',
    },
    customFields: [],
    picture: {
      url: '',
      size: 128,
      aspectRatio: 1,
      borderRadius: 0,
      effects: {
        hidden: true,
        border: false,
        grayscale: false,
      },
    },
  },
  metadata: {
    template: 'onyx',
    layout: [
      [
        ['summary', 'experience', 'education'],
        ['skills', 'projects', 'languages', 'interests'],
      ],
    ],
    css: {
      value: '',
      visible: false,
    },
    page: {
      margin: 18,
      format: 'a4',
      options: {
        breakLine: true,
        pageNumbers: true,
      },
    },
    theme: {
      background: '#ffffff',
      text: '#000000',
      primary: '#dc2626',
    },
    typography: {
      font: {
        family: 'IBM Plex Serif',
        subset: 'latin',
        variants: ['regular'],
        size: 14,
      },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: true,
    },
    notes: '',
  },
  sections: {
    summary: {
      id: 'summary',
      name: 'Résumé',
      content:
        "Développeur passionné avec 5 ans d'expérience dans le développement web full-stack. Expertise en React, Node.js et bases de données. Cherche à contribuer à des projets innovants.",
      visible: true,
      columns: 1,
    },
    profiles: {
      id: 'profiles',
      name: 'Profils',
      items: [],
      visible: true,
      columns: 1,
    },
    experience: {
      id: 'experience',
      name: 'Expérience professionnelle',
      items: [
        {
          id: generateId('exp'),
          company: 'TechCorp',
          position: 'Développeur Full Stack Senior',
          location: 'Paris, France',
          date: createDateRange('2021-01', ''),
          summary:
            "Développement d'applications web modernes avec React et Node.js. Gestion d'équipe de 3 développeurs.",
          url: { href: '', label: '' },
          visible: true,
        },
      ],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    education: {
      id: 'education',
      name: 'Formation',
      items: [
        {
          id: generateId('edu'),
          institution: "École Supérieure d'Informatique",
          area: 'Informatique',
          studyType: 'Master',
          score: 'Mention Bien',
          date: createDateRange('2018', '2020'),
          summary: '',
          url: { href: '', label: '' },
          visible: true,
        },
      ],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    awards: {
      id: 'awards',
      name: 'Récompenses',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    certifications: {
      id: 'certifications',
      name: 'Certifications',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    skills: {
      id: 'skills',
      name: 'Compétences',
      items: [
        {
          id: generateId('skill'),
          name: 'React',
          description: 'Framework JavaScript',
          level: 4,
          keywords: ['JavaScript', 'Frontend', 'UI'],
          visible: true,
        },
        {
          id: generateId('skill'),
          name: 'Node.js',
          description: 'Runtime JavaScript',
          level: 3,
          keywords: ['JavaScript', 'Backend', 'API'],
          visible: true,
        },
      ],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    interests: {
      id: 'interests',
      name: "Centres d'intérêt",
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    publications: {
      id: 'publications',
      name: 'Publications',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    volunteer: {
      id: 'volunteer',
      name: 'Bénévolat',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    languages: {
      id: 'languages',
      name: 'Langues',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    projects: {
      id: 'projects',
      name: 'Projets',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    references: {
      id: 'references',
      name: 'Références',
      items: [],
      visible: true,
      columns: 1,
      separateLinks: false,
    },
    custom: {},
  },
});

export const useArtboardStore = create<ArtboardStore>()((set) => ({
  resume: createDefaultResumeData(),
  setResume: (resume) => {
    set({ resume });
  },
}));
