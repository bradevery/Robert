import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;

  // Modals
  activeModal: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      activeModal: null,

      // Actions
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),

      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

      openModal: (modalId) => set({ activeModal: modalId }),

      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
