import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),

      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          // Simulation d'un appel API
          // En production, remplacer par un vrai appel API
          if (email && password) {
            const mockUser: User = {
              id: '1',
              email,
              name: email.split('@')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set({ user: mockUser, loading: false });
          } else {
            throw new Error('Email et mot de passe requis');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Erreur de connexion',
            loading: false,
          });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
