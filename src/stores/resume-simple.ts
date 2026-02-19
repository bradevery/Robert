/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Types simplifiés pour éviter les erreurs
export interface ResumeBasics {
  name: string;
  label: string;
  email: string;
  phone: string;
  summary: string;
  photo: string;
  photoShape?: 'round' | 'rectangle';
  // Nouveaux champs Enhancv
  link: string; // LinkedIn/Portfolio
  extraLink: string; // Lien supplémentaire
  extraField: string; // Champ libre
  dateOfBirth: string; // Date de naissance
  nationality: string; // Nationalité
  // Visibilité des champs optionnels (masqués par défaut)
  fieldVisibility: {
    link: boolean;
    extraLink: boolean;
    extraField: boolean;
    dateOfBirth: boolean;
    nationality: boolean;
  };
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
}

export interface ResumeSection {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  items: any[];
}

export interface ResumeMetadata {
  template: string;
  layout: string[][][]; // pages -> columns -> sections
  css: {
    value: string;
    visible: boolean;
  };
  theme: {
    primary: string;
    background: string;
    text: string;
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
  page: {
    margin: number;
    format: 'a4' | 'letter';
    options: {
      breakLine: boolean;
      pageNumbers: boolean;
    };
  };
  notes: string;
}

export interface Resume {
  id: string;
  title: string;
  data: {
    basics: ResumeBasics;
    sections: Record<string, ResumeSection>;
    metadata: ResumeMetadata;
  };
}

interface ResumeState {
  resume: Resume | null;
  loading: boolean;
  error: string | null;

  // Actions
  setResume: (resume: Resume) => void;
  setValue: (path: string, value: unknown) => void;
  setTemplate: (template: string) => void;
  setTheme: (theme: Partial<ResumeMetadata['theme']>) => void;
  setTypography: (typography: Partial<ResumeMetadata['typography']>) => void;
  setPage: (page: Partial<ResumeMetadata['page']>) => void;
  setLayout: (layout: string[][][]) => void;
  setCss: (css: Partial<ResumeMetadata['css']>) => void;
  setNotes: (notes: string) => void;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  deleteSection: (sectionId: string) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Default resume
const createDefaultResume = (): Resume => ({
  id: 'temp-resume',
  title: 'Mon CV',
  data: {
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      summary: '',
      photo: '',
      photoShape: 'round',
      // Nouveaux champs Enhancv
      link: '',
      extraLink: '',
      extraField: '',
      dateOfBirth: '',
      nationality: '',
      // Visibilité des champs optionnels (masqués par défaut)
      fieldVisibility: {
        link: false,
        extraLink: false,
        extraField: false,
        dateOfBirth: false,
        nationality: false,
      },
      location: {
        city: '',
        country: '',
        countryCode: '',
      },
    },
    sections: {
      experience: {
        id: 'experience',
        name: 'Expérience professionnelle',
        type: 'experience',
        visible: true,
        items: [
          {
            id: 'exp1',
            position: '',
            company: '', // workplace alias
            startDate: '',
            endDate: '',
            location: '',
            url: '', // URL entreprise
            summary: '', // Description de l'entreprise
            highlights: [''], // Bullet points
          },
        ],
      },
      education: {
        id: 'education',
        name: 'Formation',
        type: 'education',
        visible: true,
        items: [
          {
            id: 'edu1',
            degree: '', // Diplome
            studyType: '', // Alias de degree
            area: '',
            institution: '',
            startDate: '',
            endDate: '',
            location: '',
            score: '',
            gpa: '', // Valeur GPA
            maxGpa: '', // GPA maximum
            gpaText: '', // Label GPA (ex: "Moyenne generale")
            bullets: [''], // Bullet points
          },
        ],
      },
      skills: {
        id: 'skills',
        name: 'Compétences',
        type: 'skills',
        visible: true,
        items: [],
      },
      projects: {
        id: 'projects',
        name: 'Projets',
        type: 'projects',
        visible: true,
        items: [],
      },
      certifications: {
        id: 'certifications',
        name: 'Certifications',
        type: 'certifications',
        visible: true,
        items: [],
      },
      languages: {
        id: 'languages',
        name: 'Langues',
        type: 'languages',
        visible: true,
        items: [],
      },
      interests: {
        id: 'interests',
        name: "Centres d'intérêt",
        type: 'interests',
        visible: true,
        items: [],
      },
      awards: {
        id: 'awards',
        name: 'Récompenses',
        type: 'awards',
        visible: true,
        items: [],
      },
      publications: {
        id: 'publications',
        name: 'Publications',
        type: 'publications',
        visible: true,
        items: [],
      },
      references: {
        id: 'references',
        name: 'Références',
        type: 'references',
        visible: true,
        items: [],
      },
      volunteer: {
        id: 'volunteer',
        name: 'Bénévolat',
        type: 'volunteer',
        visible: true,
        items: [],
      },
      // Nouvelles sections Enhancv
      talent: {
        id: 'talent',
        name: 'Points forts',
        type: 'talent',
        visible: true,
        items: [],
      },
      achievement: {
        id: 'achievement',
        name: 'Réalisations',
        type: 'achievement',
        visible: true,
        items: [],
      },
      technology: {
        id: 'technology',
        name: 'Compétences',
        type: 'technology',
        visible: true,
        items: [],
      },
      passion: {
        id: 'passion',
        name: 'Passions',
        type: 'passion',
        visible: true,
        items: [],
      },
      courses: {
        id: 'courses',
        name: 'Formation / Cours',
        type: 'courses',
        visible: true,
        items: [],
      },
    },
    metadata: {
      template: 'onyx',
      layout: [[['basics'], ['experience', 'education'], ['skills']]],
      css: {
        value: '',
        visible: false,
      },
      theme: {
        primary: '#dc2626',
        background: '#ffffff',
        text: '#000000',
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
      page: {
        margin: 18,
        format: 'a4' as const,
        options: {
          breakLine: true,
          pageNumbers: false,
        },
      },
      notes: '',
    },
  },
});

const defaultResume = createDefaultResume();
console.log('🏗️ Store initialization with default resume:', defaultResume);

export const useResumeStore = create<ResumeState>()(
  immer((set, _get) => ({
    resume: defaultResume, // Initialiser directement avec un CV par défaut
    loading: false,
    error: null,

    setResume: (resume) =>
      set((state) => {
        state.resume = resume;
        state.error = null;
      }),

    setValue: (path, value) =>
      set((state) => {
        if (state.resume) {
          // Simple path setting pour éviter les erreurs
          const keys = path.split('.');
          let current: any = state.resume;

          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              // Check if next key is a number to determine if we need an array
              const nextKey = keys[i + 1];
              const isNextKeyNumeric = !isNaN(Number(nextKey));
              current[keys[i]] = isNextKeyNumeric ? [] : {};
            }
            current = current[keys[i]];
          }

          current[keys[keys.length - 1]] = value;
        }
      }),

    setTemplate: (template) =>
      set((state) => {
        if (state.resume) {
          state.resume.data.metadata.template = template;
        }
      }),

    setTheme: (theme) =>
      set((state) => {
        if (state.resume) {
          Object.assign(state.resume.data.metadata.theme, theme);
        }
      }),

    setTypography: (typography) =>
      set((state) => {
        if (state.resume) {
          Object.assign(state.resume.data.metadata.typography, typography);
        }
      }),

    setPage: (page) =>
      set((state) => {
        if (state.resume) {
          Object.assign(state.resume.data.metadata.page, page);
        }
      }),

    setLayout: (layout) =>
      set((state) => {
        if (state.resume) {
          // Ensure metadata exists
          if (!state.resume.data.metadata) {
            state.resume.data.metadata = createDefaultResume().data.metadata;
          }
          state.resume.data.metadata.layout = layout;
          console.log('🔄 Layout updated:', layout);
        }
      }),

    setCss: (css) =>
      set((state) => {
        if (state.resume) {
          Object.assign(state.resume.data.metadata.css, css);
        }
      }),

    setNotes: (notes) =>
      set((state) => {
        if (state.resume) {
          state.resume.data.metadata.notes = notes;
        }
      }),

    updateSectionVisibility: (sectionId, visible) =>
      set((state) => {
        if (state.resume?.data.sections?.[sectionId]) {
          state.resume.data.sections[sectionId].visible = visible;
        }
      }),

    deleteSection: (sectionId) =>
      set((state) => {
        // Prevent deletion of the basics section
        if (sectionId === 'basics') {
          console.warn('Cannot delete the basics section');
          return;
        }

        if (state.resume?.data.sections?.[sectionId]) {
          // Remove section from sections
          delete state.resume.data.sections[sectionId];

          // Remove section from layout
          if (state.resume.data.metadata?.layout) {
            const newLayout = state.resume.data.metadata.layout
              .map(
                (page) =>
                  page
                    .map((column) =>
                      column.filter((sectionKey) => sectionKey !== sectionId)
                    )
                    .filter((column) => column.length > 0) // Remove empty columns
              )
              .filter((page) => page.length > 0); // Remove empty pages

            state.resume.data.metadata.layout = newLayout;
          }

          console.log(
            `🗑️ Section "${sectionId}" deleted and removed from layout`
          );
        }
      }),

    reset: () =>
      set((state) => {
        state.resume = createDefaultResume();
        state.loading = false;
        state.error = null;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);
