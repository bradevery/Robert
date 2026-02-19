'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic';

import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  UploadCloud,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Textarea } from '@/components/ui/textarea';

import { useCandidatesStore } from '@/stores/candidates-store';
import { usePipelineStore } from '@/stores/pipeline-store';

// --- Types ---

interface PreQualifQuestion {
  id: number;
  formulation: string;
  elementsAttendus: string[];
  definitions: string[];
  exempleConcret: string;
  niveauCriticite: 'critique' | 'standard' | string;
}

interface PreQualifTheme {
  theme: string;
  questions: PreQualifQuestion[];
}

interface PreQualifResult {
  questionnaire: {
    titre: string;
    themes: PreQualifTheme[];
    synthese: {
      forces: string[];
      pointsAttention: string[];
      pointsACreuser: string[];
    };
  };
  cv: {
    nom: string;
    titreCv: string;
  };
}

interface StreamMessage {
  type: 'progress' | 'complete' | 'error';
  content?: string;
  data?: { success: boolean; data: PreQualifResult; message: string };
  message?: string;
  fullResponse?: string;
}

type InputType = 'text' | 'file';
type Language = 'fr' | 'en' | 'es' | 'pt';

// --- Reducer ---

interface FormState {
  cvInputType: InputType;
  cvFile: File | null;
  cvText: string;
  jobInputType: InputType;
  jobFile: File | null;
  jobText: string;
  language: Language;
  isProcessing: boolean;
  progress: number;
  progressStatus: string;
  streamingContent: string;
  result: PreQualifResult | null;
}

type FormAction =
  | { type: 'SET_CV_INPUT_TYPE'; payload: InputType }
  | { type: 'SET_CV_FILE'; payload: File | null }
  | { type: 'SET_CV_TEXT'; payload: string }
  | { type: 'SET_JOB_INPUT_TYPE'; payload: InputType }
  | { type: 'SET_JOB_FILE'; payload: File | null }
  | { type: 'SET_JOB_TEXT'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'START_PROCESSING' }
  | {
      type: 'UPDATE_PROGRESS';
      payload: { progress: number; status: string; streaming?: string };
    }
  | { type: 'SET_RESULT'; payload: PreQualifResult }
  | { type: 'SET_ERROR' }
  | { type: 'RESET' };

const initialState: FormState = {
  cvInputType: 'file',
  cvFile: null,
  cvText: '',
  jobInputType: 'text',
  jobFile: null,
  jobText: '',
  language: 'fr',
  isProcessing: false,
  progress: 0,
  progressStatus: '',
  streamingContent: '',
  result: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_CV_INPUT_TYPE':
      return {
        ...state,
        cvInputType: action.payload,
        cvFile: null,
        cvText: '',
      };
    case 'SET_CV_FILE':
      return { ...state, cvFile: action.payload };
    case 'SET_CV_TEXT':
      return { ...state, cvText: action.payload };
    case 'SET_JOB_INPUT_TYPE':
      return {
        ...state,
        jobInputType: action.payload,
        jobFile: null,
        jobText: '',
      };
    case 'SET_JOB_FILE':
      return { ...state, jobFile: action.payload };
    case 'SET_JOB_TEXT':
      return { ...state, jobText: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'START_PROCESSING':
      return {
        ...state,
        isProcessing: true,
        progress: 0,
        progressStatus: 'Initialisation...',
        streamingContent: '',
        result: null,
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.payload.progress,
        progressStatus: action.payload.status,
        streamingContent: action.payload.streaming ?? state.streamingContent,
      };
    case 'SET_RESULT':
      return {
        ...state,
        isProcessing: false,
        progress: 100,
        progressStatus: 'Termine',
        result: action.payload,
      };
    case 'SET_ERROR':
      return { ...state, isProcessing: false, progress: 0, progressStatus: '' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Constants ---

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
  { value: 'pt', label: 'PT' },
];

// --- SSE stream reader hook ---

function useSSEStream() {
  const abortRef = useRef<AbortController | null>(null);

  const fetchStream = useCallback(
    async (
      formData: FormData,
      onProgress: (
        progress: number,
        status: string,
        streaming?: string
      ) => void,
      onComplete: (data: PreQualifResult) => void,
      onError: (msg: string) => void
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/ai/pre-qualif', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Erreur HTTP ${response.status}`);
        }

        if (!response.body) throw new Error('Pas de corps de reponse');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let hasCompleted = false;

        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;

              try {
                const msg: StreamMessage = JSON.parse(jsonStr);
                switch (msg.type) {
                  case 'progress': {
                    const match = msg.content?.match(/(\d+)%/);
                    const pct = match ? parseInt(match[1]) : 0;
                    onProgress(pct, msg.content || '', msg.fullResponse);
                    break;
                  }
                  case 'complete':
                    hasCompleted = true;
                    if (msg.data?.success && msg.data.data) {
                      onComplete(msg.data.data);
                    } else {
                      onError(msg.data?.message || 'Reponse invalide');
                    }
                    break;
                  case 'error':
                    onError(msg.message || 'Erreur inconnue');
                    break;
                }
              } catch {
                // skip unparseable SSE line
              }
            }
          }

          if (!hasCompleted) {
            onError("Le flux s'est termine sans resultat");
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          toast.success('Operation annulee');
          return;
        }
        onError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return { fetchStream, cancel };
}

// --- Reusable input type toggle ---

function InputTypeToggle({
  value,
  onChange,
  disabled,
}: {
  value: InputType;
  onChange: (v: InputType) => void;
  disabled: boolean;
}) {
  return (
    <div className='flex gap-2'>
      <button
        type='button'
        onClick={() => onChange('text')}
        disabled={disabled}
        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          value === 'text'
            ? 'border-purple-300 bg-purple-50 text-purple-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <FileText className='inline h-3.5 w-3.5 mr-1.5' />
        Texte
      </button>
      <button
        type='button'
        onClick={() => onChange('file')}
        disabled={disabled}
        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          value === 'file'
            ? 'border-purple-300 bg-purple-50 text-purple-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <UploadCloud className='inline h-3.5 w-3.5 mr-1.5' />
        Fichier
      </button>
    </div>
  );
}

// --- Questionnaire result components ---

// eslint-disable-next-line unused-imports/no-unused-vars
function QuestionnaireResults({ result }: { result: PreQualifResult }) {
  const [expandedThemes, setExpandedThemes] = useState<Record<number, boolean>>(
    () =>
      Object.fromEntries(result.questionnaire.themes.map((_, i) => [i, true]))
  );

  const toggleTheme = useCallback((idx: number) => {
    setExpandedThemes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const { questionnaire, cv } = result;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>
              {questionnaire.titre}
            </h2>
            <div className='mt-2 flex items-center gap-3 text-sm text-gray-500'>
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 font-medium text-purple-700'>
                <UserCheck className='h-3.5 w-3.5' />
                {cv.nom}
              </span>
              <span className='text-gray-400'>|</span>
              <span>{cv.titreCv}</span>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500'>
            <Lightbulb className='h-3.5 w-3.5' />
            {questionnaire.themes.length} themes &middot;{' '}
            {questionnaire.themes.reduce(
              (sum, t) => sum + t.questions.length,
              0
            )}{' '}
            questions
          </div>
        </div>
      </div>

      {/* Themes */}
      {questionnaire.themes.map((theme, themeIdx) => (
        <div
          key={themeIdx}
          className='rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'
        >
          <button
            onClick={() => toggleTheme(themeIdx)}
            className='flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700'>
                {themeIdx + 1}
              </div>
              <h3 className='font-semibold text-gray-900'>{theme.theme}</h3>
              <span className='rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500'>
                {theme.questions.length} question
                {theme.questions.length > 1 ? 's' : ''}
              </span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                expandedThemes[themeIdx] ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedThemes[themeIdx] && (
            <div className='border-t border-gray-100 divide-y divide-gray-50'>
              {theme.questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Synthese */}
      <SyntheseSection synthese={questionnaire.synthese} />
    </div>
  );
}

function QuestionCard({ question: q }: { question: PreQualifQuestion }) {
  const isCritique = q.niveauCriticite === 'critique';

  return (
    <div className='px-6 py-5 space-y-3'>
      <div className='flex items-start gap-3'>
        <span
          className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isCritique
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}
        >
          {isCritique ? 'Critique' : 'Standard'}
        </span>
        <p className='font-medium text-gray-900 leading-relaxed'>
          {q.formulation}
        </p>
      </div>

      {q.elementsAttendus.length > 0 && (
        <div className='ml-[72px]'>
          <p className='mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400'>
            Elements attendus
          </p>
          <ul className='space-y-1'>
            {q.elementsAttendus.map((el, i) => (
              <li
                key={i}
                className='flex items-start gap-2 text-sm text-gray-600'
              >
                <CheckCircle className='mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500' />
                <span>{el}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {q.definitions.length > 0 && (
        <div className='ml-[72px]'>
          <p className='mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400'>
            Definitions
          </p>
          <div className='flex flex-wrap gap-2'>
            {q.definitions.map((def, i) => (
              <span
                key={i}
                className='inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600'
              >
                {def}
              </span>
            ))}
          </div>
        </div>
      )}

      {q.exempleConcret && (
        <div className='ml-[72px]'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400'>
            Exemple concret
          </p>
          <div className='rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-2 text-sm italic text-gray-600'>
            &ldquo;{q.exempleConcret}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}

function SyntheseSection({
  synthese,
}: {
  synthese: PreQualifResult['questionnaire']['synthese'];
}) {
  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h3 className='mb-5 flex items-center gap-2 text-lg font-bold text-gray-900'>
        <Shield className='h-5 w-5 text-purple-500' />
        Synthese
      </h3>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-xl border border-green-100 bg-green-50/50 p-4'>
          <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-green-700'>
            <CheckCircle className='h-4 w-4' />
            Forces
          </h4>
          <ul className='space-y-2'>
            {synthese.forces.map((f, i) => (
              <li key={i} className='text-sm text-green-800'>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-xl border border-red-100 bg-red-50/50 p-4'>
          <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-red-700'>
            <XCircle className='h-4 w-4' />
            Points d&apos;attention
          </h4>
          <ul className='space-y-2'>
            {synthese.pointsAttention.map((p, i) => (
              <li key={i} className='text-sm text-red-800'>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-xl border border-orange-100 bg-orange-50/50 p-4'>
          <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-orange-700'>
            <Search className='h-4 w-4' />
            Points a creuser
          </h4>
          <ul className='space-y-2'>
            {synthese.pointsACreuser.map((p, i) => (
              <li key={i} className='text-sm text-orange-800'>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- Main page ---

function PreQualifPageContent() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { fetchStream, cancel } = useSSEStream();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pipelineId = searchParams.get('pipeline');
  const candidateId = searchParams.get('candidateId');
  const { activeSession, loadSession, updateStepData, advanceStep } =
    usePipelineStore();
  const { candidates } = useCandidatesStore();

  useEffect(() => {
    const init = async () => {
      if (pipelineId) {
        if (!activeSession || activeSession.id !== pipelineId) {
          await loadSession(pipelineId);
        }
      }
    };
    init();
  }, [pipelineId, activeSession, loadSession]);

  useEffect(() => {
    if (pipelineId && activeSession) {
      // 1. Load Job Description from Fiche Mission
      if (activeSession.ficheMission) {
        const fm = activeSession.ficheMission as any;
        const jobText = `TITRE: ${fm.title}\n\nRESUME: ${
          fm.summary
        }\n\nCOMPETENCES: ${fm.skills?.map((s: any) => s.name).join(', ')}`;
        dispatch({ type: 'SET_JOB_TEXT', payload: jobText });
        dispatch({ type: 'SET_JOB_INPUT_TYPE', payload: 'text' });
      }

      // 2. Load Candidate CV
      if (candidateId) {
        const candidate = candidates.find((c) => c.id === candidateId);
        if (candidate) {
          // For now, we construct a text representation if we don't have the file easily accessible
          // In a real app, we might want to fetch the file URL or full text from DB
          const cvText = `CANDIDAT: ${candidate.firstName} ${
            candidate.lastName
          }\nTITRE: ${candidate.title}\nEXPERIENCE: ${
            candidate.yearsOfExperience
          } ans\nCOMPETENCES: ${candidate.skills.join(
            ', '
          )}\n\n(CV complet non chargé automatiquement dans cette démo)`;
          dispatch({ type: 'SET_CV_TEXT', payload: cvText });
          dispatch({ type: 'SET_CV_INPUT_TYPE', payload: 'text' });
          toast.success('Données candidat chargées');
        }
      }
    }
  }, [pipelineId, activeSession, candidateId, candidates]);

  // --- Handlers ---

  const handleGenerate = useCallback(() => {
    const {
      cvInputType,
      cvFile,
      cvText,
      jobInputType,
      jobFile,
      jobText,
      language,
    } = state;

    if (cvInputType === 'file' && !cvFile) {
      toast.error('Ajoutez un fichier CV.');
      return;
    }
    if (cvInputType === 'text' && cvText.trim().length < 30) {
      toast.error('Le texte du CV doit contenir au moins 30 caracteres.');
      return;
    }
    if (jobInputType === 'text' && jobText.trim().length < 30) {
      toast.error(
        'La description de poste doit contenir au moins 30 caracteres.'
      );
      return;
    }
    if (jobInputType === 'file' && !jobFile) {
      toast.error('Ajoutez un fichier de description de poste.');
      return;
    }

    dispatch({ type: 'START_PROCESSING' });

    const formData = new FormData();
    if (cvInputType === 'file' && cvFile) formData.append('cvFile', cvFile);
    else formData.append('cvText', cvText);

    if (jobInputType === 'file' && jobFile) formData.append('jobFile', jobFile);
    else formData.append('jobText', jobText);

    formData.append('language', language);

    fetchStream(
      formData,
      (progress, status, streaming) => {
        dispatch({
          type: 'UPDATE_PROGRESS',
          payload: { progress, status, streaming },
        });
      },
      (data) => {
        dispatch({ type: 'SET_RESULT', payload: data });
        toast.success('Fiche de qualification generee');

        // Save to pipeline
        if (pipelineId) {
          updateStepData(
            3,
            'prequalifData',
            data as unknown as Record<string, unknown>
          );
        }
      },
      (msg) => {
        dispatch({ type: 'SET_ERROR' });
        toast.error(msg);
      }
    );
  }, [state, fetchStream, pipelineId, updateStepData]);

  const handleCancel = useCallback(() => {
    cancel();
    dispatch({ type: 'SET_ERROR' });
  }, [cancel]);

  const handleNextStep = async () => {
    if (pipelineId) {
      await advanceStep();
      router.push(
        `/cv-builder?pipeline=${pipelineId}&candidateId=${candidateId}`
      );
    }
  };

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-purple-50 rounded-lg text-purple-600'>
            <UserCheck className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>
              Pre-Qualification
            </h1>
            <p className='text-sm text-gray-500'>
              Generez une fiche de qualification d&apos;entretien via IA
            </p>
          </div>
        </div>
      </div>

      <div className='p-8'>
        <div className='grid gap-6 lg:grid-cols-[420px,1fr]'>
          {/* Left panel — form */}
          <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Donnees d&apos;entree
            </h2>

            {/* Language selector */}
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-700'>Langue</span>
              <div className='flex gap-1 rounded-lg bg-gray-100 p-1'>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() =>
                      dispatch({ type: 'SET_LANGUAGE', payload: opt.value })
                    }
                    disabled={state.isProcessing}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                      state.language === opt.value
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CV input */}
            <div className='space-y-2'>
              <div className='text-sm font-medium text-gray-700'>
                CV du candidat
              </div>
              <InputTypeToggle
                value={state.cvInputType}
                onChange={(v) =>
                  dispatch({ type: 'SET_CV_INPUT_TYPE', payload: v })
                }
                disabled={state.isProcessing}
              />

              {state.cvInputType === 'file' && (
                <FileDropzone
                  file={state.cvFile}
                  onFileChange={(f) =>
                    dispatch({ type: 'SET_CV_FILE', payload: f })
                  }
                  placeholder='Importer un CV (PDF, DOCX, TXT)'
                  disabled={state.isProcessing}
                  accent='purple'
                />
              )}

              {state.cvInputType === 'text' && (
                <Textarea
                  value={state.cvText}
                  onChange={(e) =>
                    dispatch({ type: 'SET_CV_TEXT', payload: e.target.value })
                  }
                  placeholder='Collez le contenu du CV ou le profil LinkedIn...'
                  className='min-h-[140px]'
                  disabled={state.isProcessing}
                />
              )}
            </div>

            {/* Job description input */}
            <div className='space-y-2'>
              <div className='text-sm font-medium text-gray-700'>
                Description du poste
              </div>
              <InputTypeToggle
                value={state.jobInputType}
                onChange={(v) =>
                  dispatch({ type: 'SET_JOB_INPUT_TYPE', payload: v })
                }
                disabled={state.isProcessing}
              />

              {state.jobInputType === 'text' && (
                <Textarea
                  value={state.jobText}
                  onChange={(e) =>
                    dispatch({ type: 'SET_JOB_TEXT', payload: e.target.value })
                  }
                  placeholder='Decrivez le besoin, les competences requises, le contexte...'
                  className='min-h-[160px]'
                  disabled={state.isProcessing}
                />
              )}

              {state.jobInputType === 'file' && (
                <FileDropzone
                  file={state.jobFile}
                  onFileChange={(f) =>
                    dispatch({ type: 'SET_JOB_FILE', payload: f })
                  }
                  placeholder='Importer la fiche de poste (PDF, DOCX, TXT)'
                  disabled={state.isProcessing}
                  accent='purple'
                />
              )}
            </div>

            {/* Progress bar */}
            {state.isProcessing && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{state.progressStatus}</span>
                  <span>{state.progress}%</span>
                </div>
                <div className='h-2 overflow-hidden rounded-full bg-gray-100'>
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300'
                    style={{ width: `${state.progress}%` }}
                  />
                </div>

                {state.streamingContent && (
                  <div className='max-h-[160px] overflow-auto rounded-lg bg-gray-50 p-3 text-xs font-mono text-gray-500 whitespace-pre-wrap break-words'>
                    {state.streamingContent.length > 800
                      ? '...' + state.streamingContent.slice(-800)
                      : state.streamingContent}
                  </div>
                )}

                <button
                  type='button'
                  onClick={handleCancel}
                  className='text-xs font-medium text-red-500 hover:text-red-700 transition-colors'
                >
                  <X className='inline h-3 w-3 mr-1' />
                  Annuler
                </button>
              </div>
            )}

            {/* Submit */}
            <div className='flex gap-2'>
              <Button
                onClick={handleGenerate}
                disabled={state.isProcessing}
                className='flex-1 rounded-xl bg-purple-600 text-white hover:bg-purple-700'
              >
                {state.isProcessing ? (
                  <>
                    <RefreshCw className='h-4 w-4 animate-spin mr-2' />
                    Generation en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4 mr-2' />
                    Generer la fiche de qualification
                  </>
                )}
              </Button>
              {state.result && (
                <Button
                  variant='outline'
                  onClick={() => dispatch({ type: 'RESET' })}
                  className='rounded-xl'
                >
                  <RefreshCw className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          {/* Right panel — results */}
          <div>
            {!state.isProcessing && !state.result && (
              <div className='rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500'>
                <Lightbulb className='mx-auto h-8 w-8 text-gray-300 mb-3' />
                Ajoutez vos documents pour generer la fiche de qualification.
              </div>
            )}
            {state.isProcessing && !state.result && (
              <div className='rounded-2xl border border-gray-100 bg-white p-10 text-center'>
                <RefreshCw className='mx-auto h-6 w-6 animate-spin text-purple-500' />
                <p className='mt-3 text-sm text-gray-500'>
                  Analyse en cours...
                </p>
              </div>
            )}
            {state.result && (
              <div className='mt-8 pt-6 border-t border-gray-100 flex justify-end'>
                <Button
                  className='bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2'
                  onClick={handleNextStep}
                >
                  <ChevronRight className='w-4 h-4' />
                  Étape suivante: Harmonisation CV
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function PreQualifPage() {
  return (
    <Suspense fallback={null}>
      <PreQualifPageContent />
    </Suspense>
  );
}
