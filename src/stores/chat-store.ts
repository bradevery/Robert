import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  type: 'file' | 'image' | 'document';
  name: string;
  url?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  timestamp?: string; // Alias for createdAt for compatibility
}

export interface Thread {
  id: string;
  title: string;
  module?: string; // Module context (ao-reader, score, etc.)
  dossierId?: string; // Associated dossier if any
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ChatStoreState {
  threads: Thread[];
  activeThreadId: string | null;
  isTyping: boolean;
  loading: boolean;
  error: string | null;

  // Thread actions
  createThread: (
    title?: string,
    module?: string,
    initialMessage?: Omit<Message, 'id' | 'createdAt' | 'timestamp'>
  ) => string;
  deleteThread: (id: string) => void;
  updateThread: (
    id: string,
    updates: Partial<Pick<Thread, 'title' | 'module' | 'dossierId'>>
  ) => void;
  getThreadById: (id: string) => Thread | undefined;
  setActiveThread: (id: string | null) => void;

  // Message actions
  addMessage: (
    threadId: string,
    message: Omit<Message, 'id' | 'createdAt'>
  ) => void;
  updateMessage: (threadId: string, messageId: string, content: string) => void;
  deleteMessage: (threadId: string, messageId: string) => void;

  // Typing indicator
  setTyping: (isTyping: boolean) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearThreadMessages: (threadId: string) => void;
  reset: () => void;

  // Database sync actions
  loadThreadsFromDB: (userId: string, module?: string) => Promise<void>;
  saveThreadToDB: (threadId: string, userId: string) => Promise<void>;
  syncMessageToDB: (threadId: string, message: Message) => Promise<void>;
}

const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStoreState>()(
  persist(
    immer((set, get) => ({
      threads: [],
      activeThreadId: null,
      isTyping: false,
      loading: false,
      error: null,

      createThread: (title, module, initialMessage) => {
        const now = new Date().toISOString();
        const messages: Message[] = initialMessage
          ? [
              {
                ...initialMessage,
                id: `msg_${generateId()}`,
                createdAt: now,
                timestamp: now,
              },
            ]
          : [];

        const newThread: Thread = {
          id: `thread_${generateId()}`,
          title: title || 'Nouvelle conversation',
          module,
          messages,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          state.threads.unshift(newThread);
          state.activeThreadId = newThread.id;
        });

        return newThread.id;
      },

      deleteThread: (id) =>
        set((state) => {
          state.threads = state.threads.filter((t) => t.id !== id);
          if (state.activeThreadId === id) {
            state.activeThreadId = state.threads[0]?.id || null;
          }
        }),

      updateThread: (id, updates) =>
        set((state) => {
          const thread = state.threads.find((t) => t.id === id);
          if (thread) {
            Object.assign(thread, updates);
            thread.updatedAt = new Date().toISOString();
          }
        }),

      getThreadById: (id) => get().threads.find((t) => t.id === id),

      setActiveThread: (id) =>
        set((state) => {
          state.activeThreadId = id;
        }),

      addMessage: (threadId, messageData) =>
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          if (thread) {
            const now = new Date().toISOString();
            const newMessage: Message = {
              ...messageData,
              id: `msg_${generateId()}`,
              createdAt: now,
              timestamp: now,
            };
            thread.messages.push(newMessage);
            thread.updatedAt = now;

            // Update thread title if it's the first user message
            if (thread.messages.length === 1 && messageData.role === 'user') {
              thread.title =
                messageData.content.slice(0, 50) +
                (messageData.content.length > 50 ? '...' : '');
            }
          }
        }),

      updateMessage: (threadId, messageId, content) =>
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          if (thread) {
            const message = thread.messages.find((m) => m.id === messageId);
            if (message) {
              message.content = content;
              thread.updatedAt = new Date().toISOString();
            }
          }
        }),

      deleteMessage: (threadId, messageId) =>
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          if (thread) {
            thread.messages = thread.messages.filter((m) => m.id !== messageId);
            thread.updatedAt = new Date().toISOString();
          }
        }),

      setTyping: (isTyping) =>
        set((state) => {
          state.isTyping = isTyping;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearThreadMessages: (threadId) =>
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          if (thread) {
            thread.messages = [];
            thread.updatedAt = new Date().toISOString();
          }
        }),

      reset: () =>
        set((state) => {
          state.threads = [];
          state.activeThreadId = null;
          state.isTyping = false;
          state.loading = false;
          state.error = null;
        }),

      // Database sync functions
      loadThreadsFromDB: async (userId: string, module?: string) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const params = new URLSearchParams({ userId });
          if (module) params.append('module', module);

          const response = await fetch(`/api/chat/threads?${params}`);
          if (!response.ok) throw new Error('Failed to load threads');

          const data = await response.json();
          const threads: Thread[] = data.threads.map(
            (t: Record<string, unknown>) => ({
              id: t.id,
              title: t.title,
              module: t.module,
              dossierId: t.dossierId,
              messages: (t.messages as Array<Record<string, unknown>>).map(
                (m) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  metadata: m.metadata,
                  createdAt: m.createdAt,
                  timestamp: m.createdAt,
                })
              ),
              createdAt: t.createdAt as string,
              updatedAt: t.updatedAt as string,
            })
          );

          set((state) => {
            state.threads = threads;
            state.loading = false;
            if (threads.length > 0 && !state.activeThreadId) {
              state.activeThreadId = threads[0].id;
            }
          });
        } catch (error) {
          console.error('Error loading threads from DB:', error);
          set((state) => {
            state.loading = false;
            state.error = 'Failed to load conversations';
          });
        }
      },

      saveThreadToDB: async (threadId: string, userId: string) => {
        const thread = get().threads.find((t) => t.id === threadId);
        if (!thread) return;

        try {
          const response = await fetch('/api/chat/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              title: thread.title,
              module: thread.module,
              dossierId: thread.dossierId,
              initialMessage: thread.messages[0] || undefined,
            }),
          });

          if (!response.ok) throw new Error('Failed to save thread');

          const data = await response.json();
          // Update local thread ID with DB ID
          set((state) => {
            const localThread = state.threads.find((t) => t.id === threadId);
            if (localThread) {
              localThread.id = data.thread.id;
              if (state.activeThreadId === threadId) {
                state.activeThreadId = data.thread.id;
              }
            }
          });
        } catch (error) {
          console.error('Error saving thread to DB:', error);
        }
      },

      syncMessageToDB: async (threadId: string, message: Message) => {
        try {
          await fetch(`/api/chat/threads/${threadId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: message.role,
              content: message.content,
              metadata: message.metadata,
            }),
          });
        } catch (error) {
          console.error('Error syncing message to DB:', error);
        }
      },
    })),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);

// Selector helpers
export const useActiveThread = () => {
  const { threads, activeThreadId } = useChatStore();
  return threads.find((t) => t.id === activeThreadId);
};

export const useThreadsByModule = (module: string) => {
  const { threads } = useChatStore();
  return threads.filter((t) => t.module === module);
};

export const useRecentThreads = (limit = 10) => {
  const { threads } = useChatStore();
  return threads.slice(0, limit);
};
