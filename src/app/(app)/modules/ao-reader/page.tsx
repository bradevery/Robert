'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Copy,
  Download,
  Euro,
  FileText,
  FolderPlus,
  Loader2,
  Sparkles,
  Target,
  Upload,
  UploadCloud,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useReducer, useRef, useState } from 'react';
import React from 'react';
import toast from 'react-hot-toast';

import { useAOReader, AnalysisResult } from '@/hooks/useAOReader';
import { useFileExtraction } from '@/hooks/useFileExtraction';

import { Button } from '@/components/ui/button';
import LoadingState from '@/components/ui/loading-state';
import { ScoreBadge } from '@/components/ui/score-badge';
import { Textarea } from '@/components/ui/textarea';

import { usePipelineStore } from '@/stores/pipeline-store';

// --- Constants ---

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = '.pdf,.doc,.docx';
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// --- Types ---

type InputType = 'file' | 'text';

// --- Reducer ---

interface PageState {
  inputType: InputType;
  file: File | null;
  text: string;
  isDragging: boolean;
}

type PageAction =
  | { type: 'SET_INPUT_TYPE'; payload: InputType }
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'RESET' };

const initialState: PageState = {
  inputType: 'file',
  file: null,
  text: '',
  isDragging: false,
};

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_INPUT_TYPE':
      return {
        ...state,
        inputType: action.payload,
        file: null,
        text: '',
      };
    case 'SET_FILE':
      return { ...state, file: action.payload };
    case 'SET_TEXT':
      return { ...state, text: action.payload };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Helpers ---

function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME.includes(file.type)) {
    return 'Format non supporté. Utilisez un fichier PDF, DOC ou DOCX.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Fichier trop volumineux. Taille max: ${MAX_FILE_SIZE_MB} Mo.`;
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

function getRiskColor(severity: 'high' | 'medium' | 'low') {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
}

function getRiskIcon(severity: 'high' | 'medium' | 'low') {
  switch (severity) {
    case 'high':
      return <XCircle className='w-4 h-4' />;
    case 'medium':
      return <AlertTriangle className='w-4 h-4' />;
    case 'low':
      return <AlertCircle className='w-4 h-4' />;
  }
}

// --- Reusable toggle ---

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
        onClick={() => onChange('file')}
        disabled={disabled}
        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          value === 'file'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <UploadCloud className='inline h-3.5 w-3.5 mr-1.5' />
        Fichier
      </button>
      <button
        type='button'
        onClick={() => onChange('text')}
        disabled={disabled}
        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
          value === 'text'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
      >
        <FileText className='inline h-3.5 w-3.5 mr-1.5' />
        Texte
      </button>
    </div>
  );
}

// --- Main page ---

function AOReaderPageContent() {
  const [state, dispatch] = useReducer(pageReducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipeline');
  const { activeSession, updateStepData, advanceStep } = usePipelineStore();

  // --- Hooks ---
  const { analyze, createDossier } = useAOReader();
  const extractFile = useFileExtraction();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const isAnalyzing = analyze.isPending || extractFile.isPending;

  // --- File handling ---

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setResult(null);
    dispatch({ type: 'SET_FILE', payload: file });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAGGING', payload: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_DRAGGING', payload: false });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dispatch({ type: 'SET_DRAGGING', payload: false });
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  // --- Analyze ---

  const handleAnalyze = useCallback(async () => {
    const { inputType, file, text } = state;

    // Validation
    if (inputType === 'file' && !file) {
      toast.error('Ajoutez un fichier à analyser.');
      return;
    }
    if (inputType === 'text' && text.trim().length < 50) {
      toast.error('Le texte doit contenir au moins 50 caractères.');
      return;
    }

    try {
      let content: string;
      let fileName: string;

      if (inputType === 'file' && file) {
        content = await extractFile.mutateAsync(file);
        fileName = file.name;
      } else {
        content = text.trim();
        fileName = 'Texte collé';
      }

      const analysisResult = await analyze.mutateAsync({ content, fileName });
      setResult(analysisResult);
      toast.success('Analyse terminée !');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'analyse"
      );
    }
  }, [state, extractFile, analyze]);

  const handleCreateDossier = useCallback(async () => {
    if (!result) return;
    try {
      const data = await createDossier.mutateAsync({
        title: result.title || 'Nouveau Dossier',
        description: result.summary,
        requiredSkills: result.skills.filter((s) => s.level === 'required').map((s) => s.name),
        preferredSkills: result.skills.filter((s) => s.level === 'preferred').map((s) => s.name),
        goNoGoScore: result.goNoGoScore,
      });
      toast.success('Dossier créé avec succès');
      router.push(`/mes-dossiers/${data.dossier?.id || data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du dossier');
    }
  }, [result, createDossier, router]);

  const hasInput =
    state.inputType === 'file' ? !!state.file : state.text.trim().length >= 50;

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-50 rounded-lg text-blue-600'>
              <Sparkles className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>AO Reader</h1>
              <p className='text-sm text-gray-500'>
                Ne perdez plus une seconde à décrypter des PDF de 40 pages
              </p>
            </div>
          </div>
          {result && (
            <div className='flex items-center gap-2'>
              <Button variant='outline' className='gap-2 rounded-xl'>
                <Download className='w-4 h-4' /> Exporter
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  dispatch({ type: 'RESET' });
                }}
                variant='outline'
                className='gap-2 rounded-xl'
              >
                Nouvelle analyse
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8'>
        {!result ? (
          <div className='max-w-3xl mx-auto'>
            {isAnalyzing && (
              <LoadingState message='Analyse en cours...' />
            )}

            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Analysez vos Appels d&apos;Offres instantanément
              </h2>
              <p className='text-gray-500 max-w-xl mx-auto'>
                Importez vos documents PDF ou Word, ou collez le texte
                directement. L&apos;IA extrait le contexte, les enjeux, la stack
                technique, le budget, les délais et détecte les risques cachés.
              </p>
            </div>

            {/* Input type selector */}
            <div className='max-w-xs mx-auto mb-6'>
              <InputTypeToggle
                value={state.inputType}
                onChange={(v) => {
                  setResult(null);
                  dispatch({ type: 'SET_INPUT_TYPE', payload: v });
                }}
                disabled={isAnalyzing}
              />
            </div>

            {/* File mode */}
            {state.inputType === 'file' && (
              <div className='relative group'>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center bg-white transition-all cursor-pointer min-h-[340px] flex flex-col items-center justify-center ${
                    state.isDragging
                      ? 'border-blue-500 bg-blue-50/50'
                      : state.file
                      ? 'border-green-300 bg-green-50/30'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept={ACCEPTED_TYPES}
                    onChange={handleFileInputChange}
                    className='hidden'
                  />

                  {state.file ? (
                    <>
                      <div className='w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <CheckCircle className='w-8 h-8' />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-1 truncate max-w-md px-4'>
                        {state.file.name}
                      </h3>
                      <p className='text-gray-500 mb-1'>
                        {formatFileSize(state.file.size)}
                      </p>
                      <p className='text-xs text-gray-400 mb-6'>
                        Limite: {MAX_FILE_SIZE_MB} Mo &middot; PDF, DOC, DOCX
                      </p>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze();
                        }}
                        disabled={isAnalyzing}
                        className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 h-12'
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className='w-4 h-4 mr-2' />
                            Lancer l&apos;analyse IA
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className='w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Upload className='w-8 h-8' />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        Glissez-déposez vos fichiers ici
                      </h3>
                      <p className='text-sm text-gray-400 mb-2 max-w-md mx-auto'>
                        Formats : PDF, DOC, DOCX
                      </p>
                      <p className='text-sm text-gray-400 mb-6'>
                        Taille max: {MAX_FILE_SIZE_MB} Mo
                      </p>
                      <Button className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12'>
                        Parcourir les fichiers
                      </Button>
                    </>
                  )}
                </div>

                {state.file && !isAnalyzing && (
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SET_FILE', payload: null });
                    }}
                    className='absolute top-4 right-4 p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 shadow-sm transition-all z-20'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>
            )}

            {/* Text mode */}
            {state.inputType === 'text' && (
              <div className='space-y-4'>
                <div className='bg-white rounded-3xl border border-gray-200 p-6 space-y-4'>
                  <Textarea
                    value={state.text}
                    onChange={(e) =>
                      dispatch({ type: 'SET_TEXT', payload: e.target.value })
                    }
                    placeholder="Collez le contenu de l'appel d'offres ici..."
                    className='min-h-[280px] text-sm'
                    disabled={isAnalyzing}
                  />
                  <div className='flex items-center justify-between'>
                    <p className='text-xs text-gray-400'>
                      {state.text.length} caractères{' '}
                      {state.text.trim().length < 50 && state.text.length > 0
                        ? '(min 50)'
                        : ''}
                    </p>
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !hasInput}
                      className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8'
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className='w-4 h-4 mr-2' />
                          Lancer l&apos;analyse IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-12'>
              <div className='p-5 bg-white rounded-2xl border border-gray-100'>
                <div className='w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4'>
                  <Target className='w-5 h-5' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-1'>
                  Extraction compétences
                </h4>
                <p className='text-sm text-gray-500'>
                  Extraction automatique des compétences clés, profils et stack
                  technique.
                </p>
              </div>
              <div className='p-5 bg-white rounded-2xl border border-gray-100'>
                <div className='w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4'>
                  <AlertTriangle className='w-5 h-5' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-1'>
                  Clauses à risque
                </h4>
                <p className='text-sm text-gray-500'>
                  Détection des clauses juridiques à risque, pénalités et
                  astreintes.
                </p>
              </div>
              <div className='p-5 bg-white rounded-2xl border border-gray-100'>
                <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4'>
                  <Sparkles className='w-5 h-5' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-1'>
                  Synthèse en 30s
                </h4>
                <p className='text-sm text-gray-500'>
                  Synthèse exécutive complète avec budget, délais et enjeux en
                  30 secondes.
                </p>
              </div>
              <div className='p-5 bg-white rounded-2xl border border-gray-100'>
                <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4'>
                  <FileText className='w-5 h-5' />
                </div>
                <h4 className='font-semibold text-gray-900 mb-1'>
                  OCR intégré
                </h4>
                <p className='text-sm text-gray-500'>
                  Compatible PDF scannés grâce à un OCR puissant. PDF, Word,
                  email.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className='max-w-6xl mx-auto space-y-6'>
            {/* Header Card */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                    {result.title}
                  </h2>
                  <p className='text-gray-500'>{result.client}</p>
                </div>
                <div className='text-center'>
                  <p className='text-sm text-gray-500 mb-2'>Score Go/No-Go</p>
                  <ScoreBadge
                    score={result.goNoGoScore}
                    size='lg'
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100'>
                <div className='text-center p-4 bg-gray-50 rounded-xl'>
                  <Euro className='w-5 h-5 text-blue-500 mx-auto mb-2' />
                  <p className='text-lg font-bold text-gray-900'>
                    {result.budget.min / 1000}k -{' '}
                    {result.budget.max / 1000}k€
                  </p>
                  <p className='text-xs text-gray-500'>Budget estimé</p>
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-xl'>
                  <Calendar className='w-5 h-5 text-orange-500 mx-auto mb-2' />
                  <p className='text-lg font-bold text-gray-900'>
                    {result.deadline}
                  </p>
                  <p className='text-xs text-gray-500'>Échéance</p>
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-xl'>
                  <Users className='w-5 h-5 text-purple-500 mx-auto mb-2' />
                  <p className='text-lg font-bold text-gray-900'>
                    {result.profiles.reduce((sum, p) => sum + p.count, 0)}
                  </p>
                  <p className='text-xs text-gray-500'>Profils requis</p>
                </div>
                <div className='text-center p-4 bg-gray-50 rounded-xl'>
                  <Target className='w-5 h-5 text-green-500 mx-auto mb-2' />
                  <p className='text-lg font-bold text-gray-900'>
                    {result.skills.length}
                  </p>
                  <p className='text-xs text-gray-500'>Compétences clés</p>
                </div>
              </div>
            </div>

            {/* Summary & Context */}
            <div className='bg-blue-50 rounded-2xl border border-blue-100 p-6 space-y-4'>
              <div>
                <h3 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                  <Sparkles className='w-5 h-5' /> Synthèse Exécutive
                </h3>
                <p className='text-blue-800 leading-relaxed'>
                  {result.summary}
                </p>
              </div>

              {result.context && (
                <div className='pt-4 border-t border-blue-200'>
                  <h4 className='text-sm font-semibold text-blue-900 mb-1'>
                    Contexte du Projet
                  </h4>
                  <p className='text-sm text-blue-800'>
                    {result.context}
                  </p>
                </div>
              )}

              {result.issues && result.issues.length > 0 && (
                <div className='pt-4 border-t border-blue-200'>
                  <h4 className='text-sm font-semibold text-blue-900 mb-2'>
                    Enjeux Clés
                  </h4>
                  <ul className='list-disc list-inside text-sm text-blue-800 space-y-1'>
                    {result.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Skills */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  Compétences Requises
                </h3>
                <div className='space-y-2'>
                  {result.skills.map((skill, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-medium text-gray-900'>
                          {skill.name}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {skill.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          skill.level === 'required'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill.level === 'required'
                          ? 'Obligatoire'
                          : 'Souhaité'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profiles */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  Profils Recherchés
                </h3>
                <div className='space-y-2'>
                  {result.profiles.map((profile, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'
                    >
                      <div>
                        <p className='font-medium text-gray-900'>
                          {profile.role}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {profile.seniorityLevel}
                        </p>
                      </div>
                      <span className='px-3 py-1 text-sm font-bold text-blue-600 bg-blue-100 rounded-full'>
                        x{profile.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <AlertTriangle className='w-5 h-5 text-orange-500' /> Points
                  de Vigilance
                </h3>
                <div className='space-y-3'>
                  {result.specificClauses?.penalties && (
                    <div className='flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700'>
                      <AlertTriangle className='w-4 h-4 mt-0.5' />
                      <div>
                        <span className='block font-semibold text-xs uppercase mb-1'>
                          Pénalités détectées
                        </span>
                        <span className='text-sm'>
                          {result.specificClauses.penalties}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.specificClauses?.onCall && (
                    <div className='flex items-start gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700'>
                      <Calendar className='w-4 h-4 mt-0.5' />
                      <div>
                        <span className='block font-semibold text-xs uppercase mb-1'>
                          Astreintes / HNO
                        </span>
                        <span className='text-sm'>
                          {result.specificClauses.onCall}
                        </span>
                      </div>
                    </div>
                  )}

                  {result.risks.map((risk, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${getRiskColor(
                        risk.severity
                      )}`}
                    >
                      {getRiskIcon(risk.severity)}
                      <span className='text-sm'>{risk.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div className='bg-white rounded-2xl border border-gray-100 p-6'>
                <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5 text-green-500' />{' '}
                  Opportunités
                </h3>
                <div className='space-y-2'>
                  {result.opportunities.map((opp, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 p-3 bg-green-50 rounded-xl text-green-700'
                    >
                      <ChevronRight className='w-4 h-4 mt-0.5' />
                      <span className='text-sm'>{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                Actions Recommandées
              </h3>
              <div className='flex flex-wrap gap-3'>
                <Button
                  className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2'
                  onClick={async () => {
                    // Save data to pipeline if in pipeline mode, then navigate
                    if (pipelineId && activeSession) {
                      await updateStepData(
                        1,
                        'ficheMission',
                        result as unknown as Record<string, unknown>
                      );
                      await advanceStep();
                      router.push(`/modules/score?pipeline=${pipelineId}`);
                    } else {
                      // One-shot mode: pass fiche_mission via query param
                      const encoded = encodeURIComponent(
                        JSON.stringify({
                          title: result?.title,
                          skills: result?.skills,
                          profiles: result?.profiles,
                          summary: result?.summary,
                        })
                      );
                      router.push(`/modules/score?ficheMission=${encoded}`);
                    }
                  }}
                >
                  <Users className='w-4 h-4' /> Matcher des Profils
                </Button>
                <Button
                  variant='outline'
                  className='rounded-xl gap-2'
                  onClick={handleCreateDossier}
                >
                  <FolderPlus className='w-4 h-4' /> Créer un Dossier
                </Button>
                <Button
                  variant='outline'
                  className='rounded-xl gap-2'
                  onClick={() => {
                    navigator.clipboard.writeText(result?.summary || '');
                    toast.success('Résumé copié');
                  }}
                >
                  <Copy className='w-4 h-4' /> Copier le Résumé
                </Button>
              </div>

              {/* Pipeline Navigation */}
              {pipelineId && (
                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <Button
                    className='bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2'
                    onClick={async () => {
                      await updateStepData(
                        1,
                        'ficheMission',
                        result as unknown as Record<string, unknown>
                      );
                      await advanceStep();
                      router.push(`/modules/score?pipeline=${pipelineId}`);
                    }}
                  >
                    <ChevronRight className='w-4 h-4' />
                    Étape suivante: Score & Matching
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function AOReaderPage() {
  return (
    <Suspense fallback={null}>
      <AOReaderPageContent />
    </Suspense>
  );
}
