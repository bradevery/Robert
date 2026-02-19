import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type Panel = 'left' | 'right';
export type Sheet = 'sections' | 'templates' | 'settings' | 'export';

interface BuilderState {
  // Iframe reference for artboard
  frame: {
    ref: HTMLIFrameElement | null;
    setRef: (ref: HTMLIFrameElement | null) => void;
  };

  // Sheets for mobile responsive design
  sheet: {
    left: Sheet;
    right: Sheet;
  };

  // Active panels
  panel: {
    left: Panel;
    right: Panel;
  };

  // Actions
  setSheet: (side: 'left' | 'right', sheet: Sheet) => void;
  setPanel: (side: 'left' | 'right', panel: Panel) => void;
}

export const useBuilderStore = create<BuilderState>()(
  immer((set) => ({
    // Frame state
    frame: {
      ref: null,
      setRef: (ref) =>
        set((state) => {
          state.frame.ref = ref;
        }),
    },

    // Default sheet states
    sheet: {
      left: 'sections',
      right: 'templates',
    },

    // Default panel states
    panel: {
      left: 'left',
      right: 'right',
    },

    // Actions
    setSheet: (side, sheet) =>
      set((state) => {
        state.sheet[side] = sheet;
      }),

    setPanel: (side, panel) =>
      set((state) => {
        state.panel[side] = panel;
      }),
  }))
);
