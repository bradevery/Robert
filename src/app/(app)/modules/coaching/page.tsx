'use client';

export const dynamic = 'force-dynamic';

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useReducer, useRef } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

import { exportCoachingToPDF } from '@/lib/pdf/coaching-export';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { usePipelineStore } from '@/stores/pipeline-store';

// ============================================
// Types
// ============================================

interface QAItem {
  question: string;
  answer: string;
  category: 'technique' | 'fonctionnel' | 'comportemental' | 'motivation';
}

interface CoachingResult {
  briefing: string;
  qa: QAItem[];
  fiche2min: string;
  pointsForts: string[];
  risques: string[];
  conseilsPresentation: string[];
}

type InputMode = 'file' | 'text';

interface PageState {
  // Inputs
  missionInputMode: InputMode;
  cvInputMode: InputMode;
  missionFile: File | null;
  cvFile: File | null;
  missionText: string;
  cvText: string;
  // UI
  expandedQA: number | null;
  activeTab: 'briefing' | 'qa' | 'fiche2min' | 'forces' | 'conseils';
}

type PageAction =
  | { type: 'SET_MISSION_INPUT_MODE'; payload: InputMode }
  | { type: 'SET_CV_INPUT_MODE'; payload: InputMode }
  | { type: 'SET_MISSION_FILE'; payload: File | null }
  | { type: 'SET_CV_FILE'; payload: File | null }
  | { type: 'SET_MISSION_TEXT'; payload: string }
  | { type: 'SET_CV_TEXT'; payload: string }
  | { type: 'TOGGLE_QA'; payload: number }
  | { type: 'SET_TAB'; payload: PageState['activeTab'] }
  | { type: 'RESET' };

// ============================================
// Reducer
// ============================================

const initialState: PageState = {
  missionInputMode: 'text',
  cvInputMode: 'file',
  missionFile: null,
  cvFile: null,
  missionText: '',
  cvText: '',
  expandedQA: null,
  activeTab: 'briefing',
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_MISSION_INPUT_MODE':
      return {
        ...state,
        missionInputMode: action.payload,
        missionFile: null,
        missionText: '',
      };
    case 'SET_CV_INPUT_MODE':
      return {
        ...state,
        cvInputMode: action.payload,
        cvFile: null,
        cvText: '',
      };
    case 'SET_MISSION_FILE':
      return { ...state, missionFile: action.payload };
    case 'SET_CV_FILE':
      return { ...state, cvFile: action.payload };
    case 'SET_MISSION_TEXT':
      return { ...state, missionText: action.payload };
    case 'SET_CV_TEXT':
      return { ...state, cvText: action.payload };
    case 'TOGGLE_QA':
      return {
        ...state,
        expandedQA: state.expandedQA === action.payload ? null : action.payload,
      };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ============================================
// Helpers
// ============================================

const categoryColors: Record<string, string> = {
  technique: 'bg-blue-100 text-blue-700',
  fonctionnel: 'bg-purple-100 text-purple-700',
  comportemental: 'bg-green-100 text-green-700',
  motivation: 'bg-orange-100 text-orange-700',
};

const categoryLabels: Record<string, string> = {
  technique: 'Technique',
  fonctionnel: 'Fonctionnel',
  comportemental: 'Comportemental',
  motivation: 'Motivation',
};

async function extractTextFromFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/files/extract-text', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Extraction du fichier impossible');
  const data = await res.json();
  return data.text;
}

// ============================================
// Sub-components
// ============================================

function InputToggle({
  value,
  onChange,
  disabled,
}: {
  value: InputMode;
  onChange: (v: InputMode) => void;
  disabled: boolean;
}) {
  return (
    <div className='flex gap-1'>
      <button
        type='button'
        onClick={() => onChange('file')}
        disabled={disabled}
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
          value === 'file'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <UploadCloud className='inline h-3 w-3 mr-1' />
        Fichier
      </button>
      <button
        type='button'
        onClick={() => onChange('text')}
        disabled={disabled}
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
          value === 'text'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <FileText className='inline h-3 w-3 mr-1' />
        Texte
      </button>
    </div>
  );
}

// ============================================
// Main Page
// ============================================

function CoachingPageContent() {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  const missionFileRef = useRef<HTMLInputElement>(null);
  const cvFileRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipeline');
  const { activeSession, updateStepData, advanceStep } = usePipelineStore();

  const {
    mutate: generateCoaching,
    isPending: isGenerating,
    data: result,
  } = useMutation({
    mutationFn: async () => {
      let ficheMission: string;
      let cvCandidat: string;

      // Get mission text
      if (state.missionInputMode === 'file' && state.missionFile) {
        ficheMission = await extractTextFromFile(state.missionFile);
      } else if (state.missionText.trim().length >= 30) {
        ficheMission = state.missionText.trim();
      } else {
        throw new Error('Ajoutez une fiche mission (min 30 caractères)');
      }

      // Get CV text
      if (state.cvInputMode === 'file' && state.cvFile) {
        cvCandidat = await extractTextFromFile(state.cvFile);
      } else if (state.cvText.trim().length >= 30) {
        cvCandidat = state.cvText.trim();
      } else {
        throw new Error('Ajoutez un CV candidat (min 30 caractères)');
      }

      const res = await fetch('/api/ai/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ficheMission, cvCandidat }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      return data.coachingKit as CoachingResult;
    },
    onSuccess: async (data) => {
      // Save to pipeline if in pipeline mode
      if (pipelineId && activeSession) {
        await updateStepData(7, 'coachingData', data);
      }
      toast.success('Kit coaching généré avec succès');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    },
  });

  const handleGenerate = useCallback(() => {
    generateCoaching();
  }, [generateCoaching]);

  const hasInputs =
    (state.missionInputMode === 'file'
      ? !!state.missionFile
      : state.missionText.trim().length >= 30) &&
    (state.cvInputMode === 'file'
      ? !!state.cvFile
      : state.cvText.trim().length >= 30);

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-emerald-50 rounded-lg text-emerald-600'>
              <GraduationCap className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Coaching Soutenance
              </h1>
              <p className='text-sm text-gray-500'>
                Préparez votre candidat à convaincre le client
              </p>
            </div>
          </div>
          {result && (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='gap-2 rounded-xl'
                onClick={() =>
                  result && exportCoachingToPDF(result)
                }
              >
                <Download className='w-4 h-4' /> Export PDF
              </Button>
              <Button
                variant='outline'
                className='gap-2 rounded-xl'
                onClick={() => {
                  const text = `BRIEFING\n${
                    result?.briefing
                  }\n\nFICHE 2MIN\n${
                    result?.fiche2min
                  }\n\nQ&A\n${result?.qa
                    ?.map((q, i) => `${i + 1}. ${q.question}\n→ ${q.answer}`)
                    .join('\n\n')}`;
                  navigator.clipboard.writeText(text);
                  toast.success('Kit coaching copié');
                }}
              >
                <Copy className='w-4 h-4' /> Copier tout
              </Button>
              <Button
                onClick={() => dispatch({ type: 'RESET' })}
                variant='outline'
                className='gap-2 rounded-xl'
              >
                Nouveau coaching
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='p-8'>
        {!result ? (
          /* Input Form */
          <div className='max-w-3xl mx-auto'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Kit de préparation soutenance
              </h2>
              <p className='text-gray-500 max-w-xl mx-auto'>
                Fournissez la fiche mission et le CV du candidat. Robert génère
                un briefing complet, les questions probables avec réponses, et
                une fiche &quot;2 minutes pour convaincre&quot;.
              </p>
            </div>

            <div className='space-y-6'>
              {/* Mission Input */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-blue-500' />
                    Fiche Mission / AO
                  </h3>
                  <InputToggle
                    value={state.missionInputMode}
                    onChange={(v) =>
                      dispatch({ type: 'SET_MISSION_INPUT_MODE', payload: v })
                    }
                    disabled={isGenerating}
                  />
                </div>

                {state.missionInputMode === 'file' ? (
                  <div
                    onClick={() => missionFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      state.missionFile
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      ref={missionFileRef}
                      type='file'
                      accept='.pdf,.doc,.docx'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          dispatch({ type: 'SET_MISSION_FILE', payload: file });
                      }}
                    />
                    {state.missionFile ? (
                      <div className='flex items-center justify-center gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-500' />
                        <span className='font-medium text-gray-900'>
                          {state.missionFile.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({
                              type: 'SET_MISSION_FILE',
                              payload: null,
                            });
                          }}
                          className='text-red-400 hover:text-red-600'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                        <p className='text-sm text-gray-500'>
                          Glissez ou cliquez pour ajouter la fiche mission
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={state.missionText}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_MISSION_TEXT',
                        payload: e.target.value,
                      })
                    }
                    placeholder="Collez la fiche mission ou le texte de l'appel d'offres..."
                    className='min-h-[120px] text-sm'
                    disabled={isGenerating}
                  />
                )}
              </div>

              {/* CV Input */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                    <FileText className='w-4 h-4 text-purple-500' />
                    CV Candidat
                  </h3>
                  <InputToggle
                    value={state.cvInputMode}
                    onChange={(v) =>
                      dispatch({ type: 'SET_CV_INPUT_MODE', payload: v })
                    }
                    disabled={isGenerating}
                  />
                </div>

                {state.cvInputMode === 'file' ? (
                  <div
                    onClick={() => cvFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      state.cvFile
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      ref={cvFileRef}
                      type='file'
                      accept='.pdf,.doc,.docx'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          dispatch({ type: 'SET_CV_FILE', payload: file });
                      }}
                    />
                    {state.cvFile ? (
                      <div className='flex items-center justify-center gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-500' />
                        <span className='font-medium text-gray-900'>
                          {state.cvFile.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'SET_CV_FILE', payload: null });
                          }}
                          className='text-red-400 hover:text-red-600'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                        <p className='text-sm text-gray-500'>
                          Glissez ou cliquez pour ajouter le CV du candidat
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={state.cvText}
                    onChange={(e) =>
                      dispatch({ type: 'SET_CV_TEXT', payload: e.target.value })
                    }
                    placeholder='Collez le contenu du CV du candidat...'
                    className='min-h-[120px] text-sm'
                    disabled={isGenerating}
                  />
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !hasInputs}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-base'
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                    Génération du kit coaching...
                  </>
                ) : (
                  <>
                    <GraduationCap className='w-5 h-5 mr-2' />
                    Générer le kit de coaching
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results Dashboard */
          <div className='max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1'>
                  Questions
                </div>
                <div className='text-3xl font-bold text-gray-900'>
                  {result.qa.length}
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  Préparez les réponses
                </div>
              </div>
              <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-xs font-bold text-blue-600 uppercase tracking-wider mb-1'>
                  Points Forts
                </div>
                <div className='text-3xl font-bold text-gray-900'>
                  {result.pointsForts.length}
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  À mettre en avant
                </div>
              </div>
              <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-xs font-bold text-orange-600 uppercase tracking-wider mb-1'>
                  Risques
                </div>
                <div className='text-3xl font-bold text-gray-900'>
                  {result.risques.length}
                </div>
                <div className='text-xs text-gray-500 mt-1'>À anticiper</div>
              </div>
              <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-xs font-bold text-purple-600 uppercase tracking-wider mb-1'>
                  Durée pitch
                </div>
                <div className='text-3xl font-bold text-gray-900'>~2 min</div>
                <div className='text-xs text-gray-500 mt-1'>Temps de parole</div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Column */}
              <div className='lg:col-span-2 space-y-8'>
                {/* 2min Pitch Card */}
                <div className='bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden'>
                  <div className='absolute top-0 right-0 p-8 opacity-10'>
                    <Clock className='w-32 h-32' />
                  </div>
                  <div className='relative z-10'>
                    <div className='flex items-center justify-between mb-6'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-white/20 rounded-xl backdrop-blur-md'>
                          <MessageSquare className='w-6 h-6' />
                        </div>
                        <h3 className='text-xl font-bold'>
                          2 minutes pour convaincre
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            result?.fiche2min || ''
                          );
                          toast.success('Fiche copiée');
                        }}
                        className='p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors'
                      >
                        <Copy className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20'>
                      <p className='text-lg leading-relaxed font-medium italic'>
                        &quot;{result.fiche2min}&quot;
                      </p>
                    </div>
                    <p className='mt-4 text-emerald-100 text-sm flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      Ce pitch est prêt à l&apos;emploi pour le début de la
                      soutenance.
                    </p>
                  </div>
                </div>

                {/* Briefing Card */}
                <div className='bg-white rounded-3xl border border-gray-100 p-8 shadow-sm'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-blue-50 rounded-xl text-blue-600'>
                      <FileText className='w-5 h-5' />
                    </div>
                    <h3 className='text-xl font-bold text-gray-900'>
                      Briefing de la Mission
                    </h3>
                  </div>
                  <div className='prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line'>
                    {result.briefing}
                  </div>
                </div>

                {/* Q&A Section */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between px-2'>
                    <h3 className='text-xl font-bold text-gray-900'>
                      Questions & Réponses Clés
                    </h3>
                    <div className='flex gap-2'>
                      {Object.entries(categoryLabels)
                        .slice(0, 2)
                        .map(([key, label]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${categoryColors[key]}`}
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className='space-y-3'>
                    {result.qa.map((item, index) => (
                      <div
                        key={index}
                        className='bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:border-emerald-200'
                      >
                        <button
                          onClick={() =>
                            dispatch({ type: 'TOGGLE_QA', payload: index })
                          }
                          className='w-full flex items-start gap-4 p-5 text-left'
                        >
                          <span className='flex-shrink-0 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold'>
                            {index + 1}
                          </span>
                          <div className='flex-1'>
                            <p className='font-bold text-gray-900 mb-1'>
                              {item.question}
                            </p>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                categoryColors[item.category]
                              }`}
                            >
                              {categoryLabels[item.category]}
                            </span>
                          </div>
                          {state.expandedQA === index ? (
                            <ChevronUp className='w-5 h-5 text-gray-400 mt-1' />
                          ) : (
                            <ChevronDown className='w-5 h-5 text-gray-400 mt-1' />
                          )}
                        </button>
                        {state.expandedQA === index && (
                          <div className='px-5 pb-5 animate-in slide-in-from-top-2 duration-200'>
                            <div className='ml-12 p-5 bg-emerald-50 rounded-2xl border border-emerald-100'>
                              <div className='flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs uppercase'>
                                <Sparkles className='w-3 h-3' /> Réponse
                                recommandée
                              </div>
                              <p className='text-sm text-emerald-900 leading-relaxed'>
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className='space-y-8'>
                {/* Forces & Risques */}
                <div className='bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6'>
                  <div>
                    <h4 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                      <Star className='w-5 h-5 text-yellow-500' />
                      Points Forts
                    </h4>
                    <div className='space-y-3'>
                      {result.pointsForts.map((point, i) => (
                        <div
                          key={i}
                          className='flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100'
                        >
                          <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 shrink-0' />
                          <span className='text-xs font-medium text-green-800'>
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='pt-6 border-t border-gray-50'>
                    <h4 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                      <AlertTriangle className='w-5 h-5 text-orange-500' />
                      Risques & Alertes
                    </h4>
                    <div className='space-y-3'>
                      {result.risques.map((risque, i) => (
                        <div
                          key={i}
                          className='flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100'
                        >
                          <AlertTriangle className='w-4 h-4 text-orange-500 mt-0.5 shrink-0' />
                          <span className='text-xs font-medium text-orange-800'>
                            {risque}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conseils Card */}
                <div className='bg-white rounded-3xl border border-gray-100 p-6 shadow-sm'>
                  <h4 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
                    <Shield className='w-5 h-5 text-blue-500' />
                    Conseils Robert
                  </h4>
                  <div className='space-y-3'>
                    {result.conseilsPresentation?.map((conseil, i) => (
                      <div key={i} className='flex gap-3 text-sm text-gray-600'>
                        <div className='mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0' />
                        <p className='text-xs leading-relaxed'>{conseil}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Step */}
                {pipelineId && (
                  <div className='p-6 bg-emerald-50 rounded-3xl border border-emerald-100 border-dashed'>
                    <p className='text-xs font-bold text-emerald-800 uppercase mb-3'>
                      Pipeline Robert
                    </p>
                    <Button
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 h-11'
                      onClick={async () => {
                        await advanceStep();
                        window.location.href = `/modules/library?pipeline=${pipelineId}`;
                      }}
                    >
                      <ChevronRight className='w-4 h-4' />
                      Terminer & Archiver
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoachingPage() {
  return (
    <Suspense fallback={null}>
      <CoachingPageContent />
    </Suspense>
  );
}
