import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { ClientStatus } from '@/lib/design-tokens';

export interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface Client {
  id: string;
  name: string;
  sector: string;
  website?: string;
  address?: string;
  description?: string;
  contacts: Contact[];
  projects: string[]; // dossier IDs
  status: ClientStatus;
  revenue?: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClientsFilter {
  search: string;
  status: ClientStatus[];
  sectors: string[];
}

interface ClientsStoreState {
  clients: Client[];
  selectedClientId: string | null;
  filter: ClientsFilter;
  loading: boolean;
  error: string | null;

  // Actions CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  removeClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;

  // Actions sur les contacts
  addContact: (clientId: string, contact: Omit<Contact, 'id'>) => void;
  updateContact: (
    clientId: string,
    contactId: string,
    updates: Partial<Contact>
  ) => void;
  removeContact: (clientId: string, contactId: string) => void;

  // Actions de sélection
  selectClient: (id: string | null) => void;

  // Actions de filtre
  setFilter: (filter: Partial<ClientsFilter>) => void;
  resetFilter: () => void;

  // Actions de projets
  addProjectToClient: (clientId: string, projectId: string) => void;
  removeProjectFromClient: (clientId: string, projectId: string) => void;

  // Utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // API actions
  fetchClients: (params?: {
    search?: string;
    status?: string;
  }) => Promise<void>;
  createClientAPI: (
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Client | null>;
  updateClientAPI: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClientAPI: (id: string) => Promise<void>;
}

const defaultFilter: ClientsFilter = {
  search: '',
  status: [],
  sectors: [],
};

const generateId = () =>
  `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useClientsStore = create<ClientsStoreState>()(
  persist(
    immer((set, get) => ({
      clients: [],
      selectedClientId: null,
      filter: defaultFilter,
      loading: false,
      error: null,

      addClient: (clientData) =>
        set((state) => {
          const now = new Date().toISOString();
          const newClient: Client = {
            ...clientData,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          state.clients.push(newClient);
        }),

      updateClient: (id, updates) =>
        set((state) => {
          const index = state.clients.findIndex((c) => c.id === id);
          if (index !== -1) {
            state.clients[index] = {
              ...state.clients[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        }),

      removeClient: (id) =>
        set((state) => {
          state.clients = state.clients.filter((c) => c.id !== id);
          if (state.selectedClientId === id) {
            state.selectedClientId = null;
          }
        }),

      getClientById: (id) => get().clients.find((c) => c.id === id),

      addContact: (clientId, contactData) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client) {
            const newContact: Contact = {
              ...contactData,
              id: `contact_${Date.now()}`,
            };
            client.contacts.push(newContact);
            client.updatedAt = new Date().toISOString();
          }
        }),

      updateContact: (clientId, contactId, updates) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client) {
            const contactIndex = client.contacts.findIndex(
              (c) => c.id === contactId
            );
            if (contactIndex !== -1) {
              client.contacts[contactIndex] = {
                ...client.contacts[contactIndex],
                ...updates,
              };
              client.updatedAt = new Date().toISOString();
            }
          }
        }),

      removeContact: (clientId, contactId) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client) {
            client.contacts = client.contacts.filter((c) => c.id !== contactId);
            client.updatedAt = new Date().toISOString();
          }
        }),

      selectClient: (id) =>
        set((state) => {
          state.selectedClientId = id;
        }),

      setFilter: (filter) =>
        set((state) => {
          state.filter = { ...state.filter, ...filter };
        }),

      resetFilter: () =>
        set((state) => {
          state.filter = defaultFilter;
        }),

      addProjectToClient: (clientId, projectId) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client && !client.projects.includes(projectId)) {
            client.projects.push(projectId);
            client.updatedAt = new Date().toISOString();
          }
        }),

      removeProjectFromClient: (clientId, projectId) =>
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client) {
            client.projects = client.projects.filter((p) => p !== projectId);
            client.updatedAt = new Date().toISOString();
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
          state.clients = [];
          state.selectedClientId = null;
          state.filter = defaultFilter;
          state.loading = false;
          state.error = null;
        }),

      // API actions
      fetchClients: async (params) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const searchParams = new URLSearchParams();
          if (params?.search) searchParams.append('search', params.search);
          if (params?.status) searchParams.append('status', params.status);

          const response = await fetch(`/api/clients?${searchParams}`);
          if (!response.ok) throw new Error('Failed to fetch clients');

          const data = await response.json();
          set((state) => {
            state.clients = data.clients.map((c: Record<string, unknown>) => ({
              ...c,
              sector: c.industry || '',
              projects: [],
              tags: [],
            }));
            state.loading = false;
          });
        } catch (error) {
          console.error('Error fetching clients:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to load clients';
          });
        }
      },

      createClientAPI: async (data) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...data,
              industry: data.sector,
            }),
          });

          if (!response.ok) throw new Error('Failed to create client');

          const result = await response.json();
          const newClient = {
            ...result.client,
            sector: result.client.industry || '',
            projects: [],
            tags: [],
          };

          set((state) => {
            state.clients.unshift(newClient);
            state.loading = false;
          });

          return newClient;
        } catch (error) {
          console.error('Error creating client:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to create client';
          });
          return null;
        }
      },

      updateClientAPI: async (id, updates) => {
        try {
          const apiUpdates = {
            ...updates,
            ...(updates.sector && { industry: updates.sector }),
          };

          const response = await fetch(`/api/clients/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiUpdates),
          });

          if (!response.ok) throw new Error('Failed to update client');

          const result = await response.json();
          set((state) => {
            const index = state.clients.findIndex((c) => c.id === id);
            if (index !== -1) {
              state.clients[index] = {
                ...state.clients[index],
                ...result.client,
                sector: result.client.industry || state.clients[index].sector,
              };
            }
          });
        } catch (error) {
          console.error('Error updating client:', error);
          set((state) => {
            state.error = 'Failed to update client';
          });
        }
      },

      deleteClientAPI: async (id) => {
        try {
          const response = await fetch(`/api/clients/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete client');

          set((state) => {
            state.clients = state.clients.filter((c) => c.id !== id);
            if (state.selectedClientId === id) {
              state.selectedClientId = null;
            }
          });
        } catch (error) {
          console.error('Error deleting client:', error);
          set((state) => {
            state.error = 'Failed to delete client';
          });
        }
      },
    })),
    {
      name: 'clients-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clients: state.clients,
        filter: state.filter,
      }),
    }
  )
);

// Selector helpers
export const useFilteredClients = () => {
  const { clients, filter } = useClientsStore();

  return clients.filter((client) => {
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch =
        client.name.toLowerCase().includes(searchLower) ||
        client.sector.toLowerCase().includes(searchLower) ||
        client.contacts.some((c) => c.name.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filter.status.length > 0 && !filter.status.includes(client.status)) {
      return false;
    }

    // Sector filter
    if (filter.sectors.length > 0 && !filter.sectors.includes(client.sector)) {
      return false;
    }

    return true;
  });
};

// Get unique sectors from all clients
export const useClientSectors = () => {
  const { clients } = useClientsStore();
  return [...new Set(clients.map((c) => c.sector).filter(Boolean))];
};
