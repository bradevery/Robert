import { create } from 'zustand';

interface PipelineSession {
  id: string;
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  dossierId: string | null;
  ficheMission: Record<string, unknown> | null;
  scoreResult: Record<string, unknown> | null;
  prequalifData: Record<string, unknown> | null;
  dcHarmonise: Record<string, unknown> | null;
  cvOptimise: Record<string, unknown> | null;
  propaleData: Record<string, unknown> | null;
  coachingData: Record<string, unknown> | null;
  selectedCandidateId: string | null;
}

interface PipelineStore {
  activeSession: PipelineSession | null;
  isInPipeline: boolean;

  // Actions
  setActiveSession: (session: PipelineSession | null) => void;
  updateStepData: (
    step: number,
    dataKey: string,
    data: Record<string, unknown>
  ) => Promise<void>;
  advanceStep: () => Promise<void>;
  clearPipeline: () => void;
  loadSession: (pipelineId: string) => Promise<void>;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  activeSession: null,
  isInPipeline: false,

  setActiveSession: (session) =>
    set({ activeSession: session, isInPipeline: session !== null }),

  updateStepData: async (step, dataKey, data) => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      const res = await fetch(`/api/pipeline/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [dataKey]: data }),
      });

      if (res.ok) {
        const { session } = await res.json();
        set({ activeSession: session });
      }
    } catch (error) {
      console.error('Failed to update pipeline step data:', error);
    }
  },

  advanceStep: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    const nextStep = Math.min(activeSession.currentStep + 1, 8);
    const isCompleted = nextStep > 8;

    try {
      const res = await fetch(`/api/pipeline/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: nextStep,
          ...(isCompleted && { status: 'completed' }),
        }),
      });

      if (res.ok) {
        const { session } = await res.json();
        set({ activeSession: session });
      }
    } catch (error) {
      console.error('Failed to advance pipeline step:', error);
    }
  },

  clearPipeline: () => set({ activeSession: null, isInPipeline: false }),

  loadSession: async (pipelineId) => {
    try {
      const res = await fetch(`/api/pipeline/${pipelineId}`);
      if (res.ok) {
        const { session } = await res.json();
        set({ activeSession: session, isInPipeline: true });
      }
    } catch (error) {
      console.error('Failed to load pipeline session:', error);
    }
  },
}));
