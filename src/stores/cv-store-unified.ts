/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types pour le CV unifié
export interface CVItem {
  id: string;
  visible: boolean;
  [key: string]: any;
}

export interface CVSection {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  items: CVItem[];
}

export interface CVBasics {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  image?: string;
  photo?: string;
  summary?: string;
  // Champs existants
  link?: string;
  extraLink?: string;
  extraField?: string;
  dateOfBirth?: string;
  nationality?: string;
  // Champs B2B / Dossier de compétences
  title?: string; // Intitulé du poste (ex: Lead Dev Fullstack)
  yearsOfExperience?: string; // Ex: 7 ans
  availability?: string; // Ex: Immédiate, 1 mois
  mobility?: string; // Ex: Ile-de-France, Remote
  tjm?: string; // Tarif Journalier Moyen ou Salaire
  // Champs ESN avancés
  contractType?: 'cdi' | 'freelance' | 'portage' | 'cdd'; // Type de contrat
  seniorityLevel?: 'junior' | 'confirme' | 'senior' | 'expert' | 'architect'; // Niveau
  habilitations?: string; // Ex: SECRET, CONFIDENTIEL DÉFENSE
  sectors?: string[]; // Secteurs d'activité (Banque, Assurance, etc.)
  remotePolicy?: 'onsite' | 'hybrid' | 'full-remote'; // Politique télétravail
}

export interface CVTheme {
  primary: string;
  background: string;
  text: string;
}

export interface CVTypography {
  font: {
    family: string;
    size: number;
  };
  lineHeight: number;
  hideIcons: boolean;
  underlineLinks: boolean;
}

export interface CVPage {
  margin: number;
  format: 'a4' | 'letter';
  options: {
    breakLine: boolean;
    pageNumbers: boolean;
  };
}

// Informations de l'entreprise (ESN) pour le dossier de compétences
export interface CVCompany {
  name: string; // Nom de l'entreprise
  logo?: string; // URL du logo
  tagline?: string; // Slogan / Baseline
  website?: string; // Site web
  email?: string; // Email commercial
  phone?: string; // Téléphone
  address?: string; // Adresse
  color?: string; // Couleur de marque
  showInHeader: boolean; // Afficher dans l'en-tête
  showInFooter: boolean; // Afficher dans le pied de page
}

export interface CVMetadata {
  template: string;
  layout: string[][];
  css: {
    value: string;
    visible: boolean;
  };
  theme: CVTheme;
  typography: CVTypography;
  page: CVPage;
  notes: string;
}

export interface CV {
  id: string;
  title: string;
  slug?: string;
  isPublic: boolean;
  isLocked: boolean;
  company: CVCompany; // Informations entreprise (ESN)
  data: {
    basics: CVBasics;
    sections: Record<string, CVSection>;
  };
  metadata: CVMetadata;
  createdAt: string;
  updatedAt: string;
}

interface CVStoreState {
  // État principal
  cv: CV | null;
  loading: boolean;
  error: string | null;

  // État de l'éditeur
  selectedSection: string;
  editingItemId: string | null;
  isDirty: boolean;

  // Actions principales
  setCV: (cv: CV | null) => void;
  createNewCV: () => void;
  updateCV: (updates: Partial<CV>) => void;

  // Actions sur les sections
  updateSection: (sectionId: string, updates: Partial<CVSection>) => void;
  addItem: (sectionId: string, item: CVItem) => void;
  updateItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CVItem>
  ) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reorderItems: (sectionId: string, items: CVItem[]) => void;

  // Actions sur les bases
  updateBasics: (updates: Partial<CVBasics>) => void;

  // Actions sur l'entreprise
  updateCompany: (updates: Partial<CVCompany>) => void;

  // Actions sur les métadonnées
  updateTheme: (theme: Partial<CVTheme>) => void;
  updateTypography: (typography: Partial<CVTypography>) => void;
  updatePage: (page: Partial<CVPage>) => void;
  updateTemplate: (template: string) => void;
  updateNotes: (notes: string) => void;

  // Actions de l'éditeur
  setSelectedSection: (sectionId: string) => void;
  setEditingItemId: (itemId: string | null) => void;
  setDirty: (isDirty: boolean) => void;

  // Actions utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Sauvegarde
  saveCV: () => Promise<void>;
  exportCV: () => Promise<void>;
}

// CV par défaut
const createDefaultCV = (): CV => ({
  id: `cv_${Date.now()}`,
  title: 'Mon CV',
  isPublic: false,
  isLocked: false,
  company: {
    name: '',
    logo: '',
    tagline: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    color: '#2563eb',
    showInHeader: true,
    showInFooter: false,
  },
  data: {
    basics: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      image: '',
      photo: '',
      summary: '',
    },
    sections: {
      experience: {
        id: 'experience',
        name: 'Expérience',
        type: 'experience',
        visible: true,
        items: [],
      },
      education: {
        id: 'education',
        name: 'Formation',
        type: 'education',
        visible: true,
        items: [],
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
        visible: false,
        items: [],
      },
      languages: {
        id: 'languages',
        name: 'Langues',
        type: 'languages',
        visible: false,
        items: [],
      },
      certifications: {
        id: 'certifications',
        name: 'Certifications',
        type: 'certifications',
        visible: false,
        items: [],
      },
      interests: {
        id: 'interests',
        name: "Centres d'intérêt",
        type: 'interests',
        visible: false,
        items: [],
      },
      awards: {
        id: 'awards',
        name: 'Récompenses',
        type: 'awards',
        visible: false,
        items: [],
      },
      volunteer: {
        id: 'volunteer',
        name: 'Bénévolat',
        type: 'volunteer',
        visible: false,
        items: [],
      },
      // Sections ESN / Dossier de compétences
      technology: {
        id: 'technology',
        name: 'Compétences Techniques',
        type: 'technology',
        visible: true,
        items: [],
      },
      talent: {
        id: 'talent',
        name: 'Soft Skills',
        type: 'talent',
        visible: true,
        items: [],
      },
      achievement: {
        id: 'achievement',
        name: 'Réalisations',
        type: 'achievement',
        visible: false,
        items: [],
      },
      passion: {
        id: 'passion',
        name: 'Passions',
        type: 'passion',
        visible: false,
        items: [],
      },
      courses: {
        id: 'courses',
        name: 'Formations & Cours',
        type: 'courses',
        visible: false,
        items: [],
      },
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
        size: 14,
      },
      lineHeight: 1.5,
      hideIcons: false,
      underlineLinks: true,
    },
    page: {
      margin: 18,
      format: 'a4',
      options: {
        breakLine: true,
        pageNumbers: false,
      },
    },
    notes: '',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useCVStore = create<CVStoreState>()(
  persist(
    immer((set, get) => ({
      // État initial
      cv: null,
      loading: false,
      error: null,
      selectedSection: 'basics',
      editingItemId: null,
      isDirty: false,

      // Actions principales
      setCV: (cv) =>
        set((state) => {
          state.cv = cv;
          state.isDirty = false;
        }),

      createNewCV: () =>
        set((state) => {
          state.cv = createDefaultCV();
          state.isDirty = false;
          state.selectedSection = 'basics';
        }),

      updateCV: (updates) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv, updates);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      // Actions sur les sections
      updateSection: (sectionId, updates) =>
        set((state) => {
          if (state.cv?.data.sections[sectionId]) {
            Object.assign(state.cv.data.sections[sectionId], updates);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      addItem: (sectionId, item) =>
        set((state) => {
          if (state.cv?.data.sections[sectionId]) {
            state.cv.data.sections[sectionId].items.push(item);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      updateItem: (sectionId, itemId, updates) =>
        set((state) => {
          if (state.cv?.data.sections[sectionId]) {
            const itemIndex = state.cv.data.sections[sectionId].items.findIndex(
              (item) => item.id === itemId
            );
            if (itemIndex !== -1) {
              Object.assign(
                state.cv.data.sections[sectionId].items[itemIndex],
                updates
              );
              state.cv.updatedAt = new Date().toISOString();
              state.isDirty = true;
            }
          }
        }),

      removeItem: (sectionId, itemId) =>
        set((state) => {
          if (state.cv?.data.sections[sectionId]) {
            state.cv.data.sections[sectionId].items = state.cv.data.sections[
              sectionId
            ].items.filter((item) => item.id !== itemId);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      reorderItems: (sectionId, items) =>
        set((state) => {
          if (state.cv?.data.sections[sectionId]) {
            state.cv.data.sections[sectionId].items = items;
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      // Actions sur les bases
      updateBasics: (updates) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv.data.basics, updates);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      // Actions sur l'entreprise
      updateCompany: (updates) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv.company, updates);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      // Actions sur les métadonnées
      updateTheme: (theme) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv.metadata.theme, theme);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      updateTypography: (typography) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv.metadata.typography, typography);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      updatePage: (page) =>
        set((state) => {
          if (state.cv) {
            Object.assign(state.cv.metadata.page, page);
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      updateTemplate: (template) =>
        set((state) => {
          if (state.cv) {
            state.cv.metadata.template = template;
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      updateNotes: (notes) =>
        set((state) => {
          if (state.cv) {
            state.cv.metadata.notes = notes;
            state.cv.updatedAt = new Date().toISOString();
            state.isDirty = true;
          }
        }),

      // Actions de l'éditeur
      setSelectedSection: (sectionId) =>
        set((state) => {
          state.selectedSection = sectionId;
        }),

      setEditingItemId: (itemId) =>
        set((state) => {
          state.editingItemId = itemId;
        }),

      setDirty: (isDirty) =>
        set((state) => {
          state.isDirty = isDirty;
        }),

      // Actions utilitaires
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () =>
        set((state) => {
          state.cv = null;
          state.loading = false;
          state.error = null;
          state.selectedSection = 'basics';
          state.editingItemId = null;
          state.isDirty = false;
        }),

      // Sauvegarde
      saveCV: async () => {
        const { cv } = get();
        if (!cv) return;

        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Ici vous pouvez implémenter l'appel API pour sauvegarder
          // const response = await fetch('/api/cv/save', { ... });

          // Simulation d'une sauvegarde
          await new Promise((resolve) => setTimeout(resolve, 1000));

          set((state) => {
            state.isDirty = false;
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Erreur de sauvegarde';
            state.loading = false;
          });
        }
      },

      exportCV: async () => {
        const { cv } = get();
        if (!cv) return;

        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Ici vous pouvez implémenter l'export PDF
          // const response = await fetch('/api/cv/export', { ... });

          // Simulation d'un export
          await new Promise((resolve) => setTimeout(resolve, 2000));

          set((state) => {
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Erreur d'export";
            state.loading = false;
          });
        }
      },
    })),
    {
      name: 'cv-store-unified',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cv: state.cv,
        selectedSection: state.selectedSection,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.cv) {
          // Marquer comme non sale après rehydratation
          state.isDirty = false;
        }
      },
    }
  )
);
