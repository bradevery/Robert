import { create } from 'zustand';

export interface ProposalResult {
  titre: string;
  contexteMission: string;
  profilCandidat: string;
  adequationBesoin: { bulletPoints: string[] };
  impactValeur: { bulletPoints: string[] };
}

interface ProposalState {
  lastResult: ProposalResult | null;
  setLastResult: (result: ProposalResult | null) => void;
}

export const useProposalStore = create<ProposalState>()((set) => ({
  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),
}));
