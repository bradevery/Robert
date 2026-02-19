import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { DossierStatus } from '@/lib/design-tokens';

export interface Dossier {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  status: DossierStatus;
  budget?: number;
  deadline?: string;
  requiredProfiles: number;
  matchedProfiles: number;
  score?: number;
  skills: string[];
  documents: string[];
  candidateIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceStoreState {
  // Current context
  activeDossierId: string | null;
  activeModule: string | null;

  // Dossiers/AO
  dossiers: Dossier[];

  // UI state
  sidebarCollapsed: boolean;

  // Actions Dossier
  createDossier: (
    dossier: Omit<Dossier, 'id' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateDossier: (id: string, updates: Partial<Dossier>) => void;
  deleteDossier: (id: string) => void;
  getDossierById: (id: string) => Dossier | undefined;

  // Actions Context
  setActiveDossier: (id: string | null) => void;
  setActiveModule: (module: string | null) => void;

  // Actions Dossier-Candidate
  addCandidateToDossier: (dossierId: string, candidateId: string) => void;
  removeCandidateFromDossier: (dossierId: string, candidateId: string) => void;

  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Utility
  reset: () => void;

  // Loading state
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchDossiers: (params?: {
    search?: string;
    status?: string;
    clientId?: string;
  }) => Promise<void>;
  createDossierAPI: (
    data: Omit<Dossier, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Dossier | null>;
  updateDossierAPI: (id: string, updates: Partial<Dossier>) => Promise<void>;
  deleteDossierAPI: (id: string) => Promise<void>;
  addCandidateToDossierAPI: (
    dossierId: string,
    candidateId: string,
    matchScore?: number
  ) => Promise<void>;
}

const generateId = () =>
  `dossier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    immer((set, get) => ({
      activeDossierId: null,
      activeModule: null,
      dossiers: [],
      sidebarCollapsed: false,
      loading: false,
      error: null,

      createDossier: (dossierData) => {
        const now = new Date().toISOString();
        const newDossier: Dossier = {
          ...dossierData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          state.dossiers.push(newDossier);
          state.activeDossierId = newDossier.id;
        });

        return newDossier.id;
      },

      updateDossier: (id, updates) =>
        set((state) => {
          const index = state.dossiers.findIndex((d) => d.id === id);
          if (index !== -1) {
            state.dossiers[index] = {
              ...state.dossiers[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      deleteDossier: (id) =>
        set((state) => {
          state.dossiers = state.dossiers.filter((d) => d.id !== id);
          if (state.activeDossierId === id) {
            state.activeDossierId = state.dossiers[0]?.id || null;
          }
        }),

      getDossierById: (id) => get().dossiers.find((d) => d.id === id),

      setActiveDossier: (id) =>
        set((state) => {
          state.activeDossierId = id;
        }),

      setActiveModule: (module) =>
        set((state) => {
          state.activeModule = module;
        }),

      addCandidateToDossier: (dossierId, candidateId) =>
        set((state) => {
          const dossier = state.dossiers.find((d) => d.id === dossierId);
          if (dossier && !dossier.candidateIds.includes(candidateId)) {
            dossier.candidateIds.push(candidateId);
            dossier.matchedProfiles = dossier.candidateIds.length;
            dossier.updatedAt = new Date().toISOString();
          }
        }),

      removeCandidateFromDossier: (dossierId, candidateId) =>
        set((state) => {
          const dossier = state.dossiers.find((d) => d.id === dossierId);
          if (dossier) {
            dossier.candidateIds = dossier.candidateIds.filter(
              (c) => c !== candidateId
            );
            dossier.matchedProfiles = dossier.candidateIds.length;
            dossier.updatedAt = new Date().toISOString();
          }
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),

      reset: () =>
        set((state) => {
          state.activeDossierId = null;
          state.activeModule = null;
          state.dossiers = [];
          state.sidebarCollapsed = false;
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

      // API actions
      fetchDossiers: async (params) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const searchParams = new URLSearchParams();
          if (params?.search) searchParams.append('search', params.search);
          if (params?.status) searchParams.append('status', params.status);
          if (params?.clientId)
            searchParams.append('clientId', params.clientId);

          const response = await fetch(`/api/dossiers?${searchParams}`);
          if (!response.ok) throw new Error('Failed to fetch dossiers');

          const data = await response.json();
          set((state) => {
            state.dossiers = data.dossiers.map(
              (d: Record<string, unknown>) => ({
                ...d,
                requiredProfiles: (d.requirements as string[])?.length || 0,
                matchedProfiles:
                  (d._count as { candidates: number })?.candidates || 0,
                candidateIds: [],
                documents: [],
              })
            );
            state.loading = false;
          });
        } catch (error) {
          console.error('Error fetching dossiers:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to load dossiers';
          });
        }
      },

      createDossierAPI: async (data) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/dossiers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: data.title,
              description: data.description,
              clientId: data.clientId,
              skills: data.skills,
              budget: data.budget,
              deadline: data.deadline,
              status: data.status,
            }),
          });

          if (!response.ok) throw new Error('Failed to create dossier');

          const result = await response.json();
          const newDossier: Dossier = {
            ...result.dossier,
            requiredProfiles: 0,
            matchedProfiles: 0,
            candidateIds: [],
            documents: [],
          };

          set((state) => {
            state.dossiers.unshift(newDossier);
            state.activeDossierId = newDossier.id;
            state.loading = false;
          });

          return newDossier;
        } catch (error) {
          console.error('Error creating dossier:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to create dossier';
          });
          return null;
        }
      },

      updateDossierAPI: async (id, updates) => {
        try {
          const response = await fetch(`/api/dossiers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update dossier');

          const result = await response.json();
          set((state) => {
            const index = state.dossiers.findIndex((d) => d.id === id);
            if (index !== -1) {
              state.dossiers[index] = {
                ...state.dossiers[index],
                ...result.dossier,
              };
            }
          });
        } catch (error) {
          console.error('Error updating dossier:', error);
          set((state) => {
            state.error = 'Failed to update dossier';
          });
        }
      },

      deleteDossierAPI: async (id) => {
        try {
          const response = await fetch(`/api/dossiers/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete dossier');

          set((state) => {
            state.dossiers = state.dossiers.filter((d) => d.id !== id);
            if (state.activeDossierId === id) {
              state.activeDossierId = state.dossiers[0]?.id || null;
            }
          });
        } catch (error) {
          console.error('Error deleting dossier:', error);
          set((state) => {
            state.error = 'Failed to delete dossier';
          });
        }
      },

      addCandidateToDossierAPI: async (dossierId, candidateId, matchScore) => {
        try {
          const response = await fetch(
            `/api/dossiers/${dossierId}/candidates`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ candidateId, matchScore }),
            }
          );

          if (!response.ok)
            throw new Error('Failed to add candidate to dossier');

          set((state) => {
            const dossier = state.dossiers.find((d) => d.id === dossierId);
            if (dossier && !dossier.candidateIds.includes(candidateId)) {
              dossier.candidateIds.push(candidateId);
              dossier.matchedProfiles = dossier.candidateIds.length;
              dossier.updatedAt = new Date().toISOString();
            }
          });
        } catch (error) {
          console.error('Error adding candidate to dossier:', error);
          set((state) => {
            state.error = 'Failed to add candidate';
          });
        }
      },
    })),
    {
      name: 'workspace-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dossiers: state.dossiers,
        activeDossierId: state.activeDossierId,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selector helpers
export const useActiveDossier = () => {
  const { dossiers, activeDossierId } = useWorkspaceStore();
  return dossiers.find((d) => d.id === activeDossierId);
};

export const useDossiersByStatus = (status: DossierStatus) => {
  const { dossiers } = useWorkspaceStore();
  return dossiers.filter((d) => d.status === status);
};

export const useDossiersByClient = (clientId: string) => {
  const { dossiers } = useWorkspaceStore();
  return dossiers.filter((d) => d.clientId === clientId);
};

export const useRecentDossiers = (limit = 5) => {
  const { dossiers } = useWorkspaceStore();
  return [...dossiers]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit);
};
