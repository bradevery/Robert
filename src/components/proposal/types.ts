import type { ProposalResult } from '@/stores/proposal-store';

export interface ProposalFormState {
  cvFile: File | null;
  aoFile: File | null;
  typeRemuneration: 'TJM' | 'SAB';
  tjmOrSab: string;
  dateDisponibilite: string;
  startAsap: boolean;
  lieuMission: string;
  repartitionTravail: string;
  entrepriseNom: string;
  language: string;
  isGenerating: boolean;
  result: ProposalResult | null;
  editedData: ProposalResult | null;
}

export type ProposalAction =
  | { type: 'SET_CV_FILE'; payload: File | null }
  | { type: 'SET_AO_FILE'; payload: File | null }
  | { type: 'SET_TYPE_REMUNERATION'; payload: 'TJM' | 'SAB' }
  | { type: 'SET_TJM_OR_SAB'; payload: string }
  | { type: 'SET_DATE_DISPONIBILITE'; payload: string }
  | { type: 'TOGGLE_ASAP' }
  | { type: 'SET_LIEU_MISSION'; payload: string }
  | { type: 'SET_REPARTITION'; payload: string }
  | { type: 'SET_ENTREPRISE'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'START_GENERATING' }
  | { type: 'SET_RESULT'; payload: ProposalResult }
  | { type: 'SET_ERROR' }
  | { type: 'UPDATE_EDITED'; payload: ProposalResult }
  | { type: 'RESET' };

export const initialState: ProposalFormState = {
  cvFile: null,
  aoFile: null,
  typeRemuneration: 'TJM',
  tjmOrSab: '',
  dateDisponibilite: '',
  startAsap: false,
  lieuMission: '',
  repartitionTravail: '',
  entrepriseNom: '',
  language: 'FR',
  isGenerating: false,
  result: null,
  editedData: null,
};

export function proposalReducer(
  state: ProposalFormState,
  action: ProposalAction
): ProposalFormState {
  switch (action.type) {
    case 'SET_CV_FILE':
      return {
        ...state,
        cvFile: action.payload,
        result: null,
        editedData: null,
      };
    case 'SET_AO_FILE':
      return {
        ...state,
        aoFile: action.payload,
        result: null,
        editedData: null,
      };
    case 'SET_TYPE_REMUNERATION':
      return { ...state, typeRemuneration: action.payload };
    case 'SET_TJM_OR_SAB':
      return { ...state, tjmOrSab: action.payload };
    case 'SET_DATE_DISPONIBILITE':
      return { ...state, dateDisponibilite: action.payload, startAsap: false };
    case 'TOGGLE_ASAP':
      return { ...state, startAsap: !state.startAsap, dateDisponibilite: '' };
    case 'SET_LIEU_MISSION':
      return { ...state, lieuMission: action.payload };
    case 'SET_REPARTITION':
      return { ...state, repartitionTravail: action.payload };
    case 'SET_ENTREPRISE':
      return { ...state, entrepriseNom: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'START_GENERATING':
      return { ...state, isGenerating: true, result: null, editedData: null };
    case 'SET_RESULT':
      return {
        ...state,
        isGenerating: false,
        result: action.payload,
        editedData: { ...action.payload },
      };
    case 'SET_ERROR':
      return { ...state, isGenerating: false };
    case 'UPDATE_EDITED':
      return { ...state, editedData: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
