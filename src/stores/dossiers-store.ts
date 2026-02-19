/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// We map "Dossier" to the Resume model from the backend
export interface Dossier {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived'; // Mapped from isPublic/isLocked or metadata
  updatedAt: string;
  createdAt: string;
  candidateId?: string;
  clientId?: string;
  metadata?: any;
  data?: any;
}

interface DossiersFilter {
  search: string;
}

interface DossiersStoreState {
  dossiers: Dossier[];
  filter: DossiersFilter;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDossiers: () => Promise<void>;
  createDossier: (data: {
    title: string;
    candidateId: string;
    clientId?: string;
    description?: string;
  }) => Promise<Dossier | null>;
  deleteDossier: (id: string) => Promise<void>;
  getDossierById: (id: string) => Dossier | undefined;
  setFilter: (filter: Partial<DossiersFilter>) => void;
}

export const useDossiersStore = create<DossiersStoreState>()(
  persist(
    immer((set, get) => ({
      dossiers: [],
      filter: { search: '' },
      loading: false,
      error: null,

      getDossierById: (id) => get().dossiers.find((d) => d.id === id),

      fetchDossiers: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });
        try {
          const response = await fetch('/api/resumes');
          if (!response.ok) throw new Error('Failed to fetch dossiers');
          const data = await response.json();

          // Map Resumes to Dossiers
          const mappedDossiers = data.resumes.map((r: Record<string, any>) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            updatedAt: r.updatedAt,
            createdAt: r.createdAt,
            status: r.isPublic ? 'published' : 'draft',
            candidateId: r.metadata?.candidateId,
            clientId: r.metadata?.clientId,
            metadata: r.metadata as Record<string, unknown>,
            data: r.data as Record<string, unknown>,
          }));

          set((state) => {
            state.dossiers = mappedDossiers;
            state.loading = false;
          });
        } catch (error) {
          console.error(error);
          set((state) => {
            state.loading = false;
            state.error = 'Erreur chargement dossiers';
          });
        }
      },

      createDossier: async (data) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });
        try {
          const response = await fetch('/api/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) throw new Error('Failed to create dossier');
          const result = await response.json();
          const r = result.resume;

          const newDossier: Dossier = {
            id: r.id,
            title: r.title,
            slug: r.slug,
            updatedAt: r.updatedAt,
            createdAt: r.createdAt,
            status: 'draft',
            candidateId: r.metadata?.candidateId,
            clientId: r.metadata?.clientId,
            metadata: r.metadata,
            data: r.data,
          };

          set((state) => {
            state.dossiers.unshift(newDossier);
            state.loading = false;
          });

          return newDossier;
        } catch (error) {
          console.error(error);
          set((state) => {
            state.loading = false;
            state.error = 'Erreur création dossier';
          });
          return null;
        }
      },

      deleteDossier: async (id) => {
        // Optimistic update
        set((state) => {
          state.dossiers = state.dossiers.filter((d) => d.id !== id);
        });

        try {
          await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
        } catch (error) {
          // Revert if needed (omitted for simplicity)
          console.error(error);
        }
      },

      setFilter: (filter) =>
        set((state) => {
          state.filter = { ...state.filter, ...filter };
        }),
    })),
    {
      name: 'dossiers-competences-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useFilteredDossiers = () => {
  const { dossiers, filter } = useDossiersStore();
  return dossiers.filter((d) => {
    if (!filter.search) return true;
    const search = filter.search.toLowerCase();
    return d.title.toLowerCase().includes(search);
  });
};
