/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Availability, CandidateStatus } from '@/lib/design-tokens';

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  skills: string[];
  availability: Availability;
  tjm?: number;
  salary?: number;
  location?: string;
  remotePolicy?: 'onsite' | 'hybrid' | 'full-remote';
  yearsOfExperience?: number;
  matchScores: Record<string, number>; // dossierId -> score
  status: CandidateStatus;
  notes?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CandidatesFilter {
  search: string;
  status: CandidateStatus[];
  availability: Availability[];
  skills: string[];
  minScore?: number;
  maxTjm?: number;
}

interface CandidatesStoreState {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  filter: CandidatesFilter;
  loading: boolean;
  error: string | null;

  // Actions CRUD
  addCandidate: (
    candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  getCandidateById: (id: string) => Candidate | undefined;

  // Actions de sélection
  selectCandidate: (id: string | null) => void;

  // Actions de filtre
  setFilter: (filter: Partial<CandidatesFilter>) => void;
  resetFilter: () => void;

  // Actions de matching
  updateMatchScore: (
    candidateId: string,
    dossierId: string,
    score: number
  ) => void;
  getTopCandidatesForDossier: (
    dossierId: string,
    limit?: number
  ) => Candidate[];

  // Actions de status
  updateStatus: (id: string, status: CandidateStatus) => void;

  // Utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // API actions
  fetchCandidates: (params?: {
    search?: string;
    status?: string;
    availability?: string;
  }) => Promise<void>;
  createCandidateAPI: (
    data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'matchScores'>
  ) => Promise<Candidate | null>;
  updateCandidateAPI: (
    id: string,
    updates: Partial<Candidate>
  ) => Promise<void>;
  deleteCandidateAPI: (id: string) => Promise<void>;
}

const defaultFilter: CandidatesFilter = {
  search: '',
  status: [],
  availability: [],
  skills: [],
};

const generateId = () =>
  `cand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useCandidatesStore = create<CandidatesStoreState>()(
  persist(
    immer((set, get) => ({
      candidates: [],
      selectedCandidateId: null,
      filter: defaultFilter,
      loading: false,
      error: null,

      addCandidate: (candidateData) =>
        set((state) => {
          const now = new Date().toISOString();
          const newCandidate: Candidate = {
            ...candidateData,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          state.candidates.push(newCandidate);
        }),

      updateCandidate: (id, updates) =>
        set((state) => {
          const index = state.candidates.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.candidates[index] = {
              ...state.candidates[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      removeCandidate: (id) =>
        set((state) => {
          state.candidates = state.candidates.filter((c) => c.id !== id);
          if (state.selectedCandidateId === id) {
            state.selectedCandidateId = null;
          }
        }),

      getCandidateById: (id) => get().candidates.find((c) => c.id === id),

      selectCandidate: (id) =>
        set((state) => {
          state.selectedCandidateId = id;
        }),

      setFilter: (filter) =>
        set((state) => {
          state.filter = { ...state.filter, ...filter };
        }),

      resetFilter: () =>
        set((state) => {
          state.filter = defaultFilter;
        }),

      updateMatchScore: (candidateId, dossierId, score) =>
        set((state) => {
          const candidate = state.candidates.find((c) => c.id === candidateId);
          if (candidate) {
            candidate.matchScores[dossierId] = score;
            candidate.updatedAt = new Date().toISOString();
          }
        }),

      getTopCandidatesForDossier: (dossierId, limit = 5) => {
        const { candidates } = get();
        return candidates
          .filter((c) => c.matchScores[dossierId] !== undefined)
          .sort(
            (a, b) =>
              (b.matchScores[dossierId] || 0) - (a.matchScores[dossierId] || 0)
          )
          .slice(0, limit);
      },

      updateStatus: (id, status) =>
        set((state) => {
          const candidate = state.candidates.find((c) => c.id === id);
          if (candidate) {
            candidate.status = status;
            candidate.updatedAt = new Date().toISOString();
          }
        }),

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
          state.candidates = [];
          state.selectedCandidateId = null;
          state.filter = defaultFilter;
          state.loading = false;
          state.error = null;
        }),

      // API actions
      fetchCandidates: async (params) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const searchParams = new URLSearchParams();
          if (params?.search) searchParams.append('search', params.search);
          if (params?.status) searchParams.append('status', params.status);
          if (params?.availability)
            searchParams.append('availability', params.availability);

          const response = await fetch(`/api/candidates?${searchParams}`);
          if (!response.ok) throw new Error('Failed to fetch candidates');

          const data = await response.json();
          set((state) => {
            state.candidates = data.candidates.map((c: any) => ({
              ...c,
              yearsOfExperience: c.yearsExperience,
              matchScores: {},
              tags: c.skills || [],
            }));
            state.loading = false;
          });
        } catch (error) {
          console.error('Error fetching candidates:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to load candidates';
          });
        }
      },

      createCandidateAPI: async (data) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) throw new Error('Failed to create candidate');

          const result = await response.json();
          const newCandidate = {
            ...result.candidate,
            yearsOfExperience: result.candidate.yearsExperience,
            matchScores: {},
            tags: result.candidate.skills || [],
          };

          set((state) => {
            state.candidates.unshift(newCandidate);
            state.loading = false;
          });

          return newCandidate;
        } catch (error) {
          console.error('Error creating candidate:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to create candidate';
          });
          return null;
        }
      },

      updateCandidateAPI: async (id, updates) => {
        try {
          const response = await fetch(`/api/candidates/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update candidate');

          const result = await response.json();
          set((state) => {
            const index = state.candidates.findIndex((c) => c.id === id);
            if (index !== -1) {
              state.candidates[index] = {
                ...state.candidates[index],
                ...result.candidate,
              };
            }
          });
        } catch (error) {
          console.error('Error updating candidate:', error);
          set((state) => {
            state.error = 'Failed to update candidate';
          });
        }
      },

      deleteCandidateAPI: async (id) => {
        try {
          const response = await fetch(`/api/candidates/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete candidate');

          set((state) => {
            state.candidates = state.candidates.filter((c) => c.id !== id);
            if (state.selectedCandidateId === id) {
              state.selectedCandidateId = null;
            }
          });
        } catch (error) {
          console.error('Error deleting candidate:', error);
          set((state) => {
            state.error = 'Failed to delete candidate';
          });
        }
      },
    })),
    {
      name: 'candidates-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        candidates: state.candidates,
        filter: state.filter,
      }),
    }
  )
);

// Selector helpers
export const useFilteredCandidates = () => {
  const { candidates, filter } = useCandidatesStore();

  return candidates.filter((candidate) => {
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch =
        candidate.firstName.toLowerCase().includes(searchLower) ||
        candidate.lastName.toLowerCase().includes(searchLower) ||
        candidate.title.toLowerCase().includes(searchLower) ||
        candidate.skills.some((s) => s.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filter.status.length > 0 && !filter.status.includes(candidate.status)) {
      return false;
    }

    // Availability filter
    if (
      filter.availability.length > 0 &&
      !filter.availability.includes(candidate.availability)
    ) {
      return false;
    }

    // Skills filter
    if (filter.skills.length > 0) {
      const hasAllSkills = filter.skills.every((skill) =>
        candidate.skills.some((s) =>
          s.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasAllSkills) return false;
    }

    // TJM filter
    if (filter.maxTjm && candidate.tjm && candidate.tjm > filter.maxTjm) {
      return false;
    }

    return true;
  });
};
