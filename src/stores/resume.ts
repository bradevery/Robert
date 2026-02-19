/* eslint-disable @typescript-eslint/no-explicit-any */
import { temporal } from 'zundo';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types basés sur l'architecture Reactive-Resume
export interface ResumeBasics {
  name: string;
  label: string;
  photo: string;
  image: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    address: string;
    postalCode: string;
    city: string;
    countryCode: string;
    region: string;
  };
  profiles: Array<{
    id: string;
    network: string;
    username: string;
    url: string;
  }>;
}

export interface ResumeSection {
  id: string;
  name: string;
  type: string;
  columns: number;
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

export interface Resume {
  id: string;
  title: string;
  slug: string;
  data: {
    basics: ResumeBasics;
    sections: Record<string, ResumeSection>;
    metadata: ResumeMetadata;
  };
  visibility: 'public' | 'private';
  locked: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumeState {
  resume: Resume | null;
  loading: boolean;
  error: string | null;

  // Actions
  setResume: (resume: Resume) => void;
  setValue: (path: string, value: unknown) => void;
  addSection: (section: ResumeSection) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  addItem: (sectionId: string, item: any) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  duplicateItem: (sectionId: string, itemId: string) => void;
  moveItem: (sectionId: string, fromIndex: number, toIndex: number) => void;

  // Metadata actions
  setTemplate: (template: string) => void;
  setTheme: (theme: Partial<ResumeMetadata['theme']>) => void;
  setTypography: (typography: Partial<ResumeMetadata['typography']>) => void;
  setPage: (page: Partial<ResumeMetadata['page']>) => void;

  // Utility actions
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Default resume structure
const createDefaultResume = (): Resume => ({
  id: 'temp-resume',
  title: 'Mon CV',
  slug: 'mon-cv',
  data: {
    basics: {
      name: '',
      label: '',
      photo: '',
      image: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: {
        address: '',
        postalCode: '',
        city: '',
        countryCode: '',
        region: '',
      },
      profiles: [],
    },
    sections: {
      experience: {
        id: 'experience',
        name: 'Expérience professionnelle',
        type: 'experience',
        columns: 1,
        visible: true,
        items: [],
      },
      education: {
        id: 'education',
        name: 'Formation',
        type: 'education',
        columns: 1,
        visible: true,
        items: [],
      },
      skills: {
        id: 'skills',
        name: 'Compétences',
        type: 'skills',
        columns: 2,
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
      page: {
        margin: 18,
        format: 'a4',
        options: {
          breakLine: true,
          pageNumbers: false,
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
  },
  visibility: 'private',
  locked: false,
  userId: 'user-temp',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useResumeStore = create<ResumeState>()(
  subscribeWithSelector(
    persist(
      temporal(
        immer((set, _get) => ({
          resume: null,
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
                set(state.resume, path, value);
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          addSection: (section) =>
            set((state) => {
              if (state.resume) {
                state.resume.data.sections[section.id] = section;
                // Ajouter la section au layout si pas déjà présente
                const layout = state.resume.data.metadata.layout;
                const lastColumn = layout[0][layout[0].length - 1];
                if (!lastColumn.includes(section.id)) {
                  lastColumn.push(section.id);
                }
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          removeSection: (sectionId) =>
            set((state) => {
              if (state.resume) {
                delete state.resume.data.sections[sectionId];
                // Retirer du layout
                const layout = state.resume.data.metadata.layout;
                layout.forEach((page) => {
                  page.forEach((column) => {
                    const index = column.indexOf(sectionId);
                    if (index > -1) {
                      column.splice(index, 1);
                    }
                  });
                });
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          duplicateSection: (sectionId) =>
            set((state) => {
              if (state.resume && state.resume.data.sections[sectionId]) {
                const originalSection = state.resume.data.sections[sectionId];
                const newId = `${sectionId}_copy_${Date.now()}`;
                const newSection = {
                  ...originalSection,
                  id: newId,
                  name: `${originalSection.name} (Copie)`,
                };
                state.resume.data.sections[newId] = newSection;
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          addItem: (sectionId, item) =>
            set((state) => {
              if (state.resume && state.resume.data.sections[sectionId]) {
                const itemWithId = {
                  ...item,
                  id: item.id || `item_${Date.now()}`,
                };
                state.resume.data.sections[sectionId].items.push(itemWithId);
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          removeItem: (sectionId, itemId) =>
            set((state) => {
              if (state.resume && state.resume.data.sections[sectionId]) {
                const section = state.resume.data.sections[sectionId];
                section.items = section.items.filter(
                  (item) => item.id !== itemId
                );
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          duplicateItem: (sectionId, itemId) =>
            set((state) => {
              if (state.resume && state.resume.data.sections[sectionId]) {
                const section = state.resume.data.sections[sectionId];
                const originalItem = section.items.find(
                  (item) => item.id === itemId
                );
                if (originalItem) {
                  const newItem = {
                    ...originalItem,
                    id: `${itemId}_copy_${Date.now()}`,
                  };
                  section.items.push(newItem);
                  state.resume.updatedAt = new Date().toISOString();
                }
              }
            }),

          moveItem: (sectionId, fromIndex, toIndex) =>
            set((state) => {
              if (state.resume && state.resume.data.sections[sectionId]) {
                const items = state.resume.data.sections[sectionId].items;
                const [movedItem] = items.splice(fromIndex, 1);
                items.splice(toIndex, 0, movedItem);
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          setTemplate: (template) =>
            set((state) => {
              if (state.resume) {
                state.resume.data.metadata.template = template;
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          setTheme: (theme) =>
            set((state) => {
              if (state.resume) {
                Object.assign(state.resume.data.metadata.theme, theme);
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          setTypography: (typography) =>
            set((state) => {
              if (state.resume) {
                Object.assign(
                  state.resume.data.metadata.typography,
                  typography
                );
                state.resume.updatedAt = new Date().toISOString();
              }
            }),

          setPage: (page) =>
            set((state) => {
              if (state.resume) {
                Object.assign(state.resume.data.metadata.page, page);
                state.resume.updatedAt = new Date().toISOString();
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
        })),
        {
          limit: 100,
          equality: (pastState, currentState) =>
            JSON.stringify(pastState.resume?.data) ===
            JSON.stringify(currentState.resume?.data),
        }
      ),
      {
        name: 'resume-storage',
        partialize: (state) => ({ resume: state.resume }),
      }
    )
  )
);
