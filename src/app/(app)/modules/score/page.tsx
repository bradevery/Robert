'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic';

import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  ChevronRight,
  FileText,
  Link,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Target,
  Trophy,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useFileExtraction } from '@/hooks/useFileExtraction';
import { useScore, MatchResult, ScoreResult } from '@/hooks/useScore';

import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { ScoreBadge, ScoreProgress } from '@/components/ui/score-badge';
import { Textarea } from '@/components/ui/textarea';

import { useCandidatesStore } from '@/stores/candidates-store';
import { usePipelineStore } from '@/stores/pipeline-store';

interface StreamMessage {
  type:
    | 'progress'
    | 'partial_result'
    | 'complete'
    | 'error'
    | 'streaming_content';
  content?: string;
  data?: any;
  message?: string;
}

function ScorePageContent() {
  const [mode, setMode] = useState<'dossier' | 'files'>('dossier');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'skills' | 'experience'>(
    'score'
  );
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);

  const [jobOfferInputType, setJobOfferInputType] = useState<'file' | 'text'>(
    'file'
  );
  const [jobOfferFile, setJobOfferFile] = useState<File | null>(null);
  const [jobOfferText, setJobOfferText] = useState('');
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [fileResults, setFileResults] = useState<ScoreResult[] | null>(null);
  const [isFileMatching, setIsFileMatching] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [_streamingContent, setStreamingContent] = useState('');

  // Hooks
  const router = useRouter();
  const extractFile = useFileExtraction();
  const { matchCandidate } = useScore();
  const isMatching = matchCandidate.isPending;

  const { candidates } = useCandidatesStore();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipeline');
  const ficheMissionParam = searchParams.get('ficheMission');
  const { activeSession, loadSession } = usePipelineStore();

  // Load pipeline data
  useEffect(() => {
    const init = async () => {
      // 1. Pipeline Mode
      if (pipelineId) {
        if (!activeSession || activeSession.id !== pipelineId) {
          await loadSession(pipelineId);
        }
      }
      // 2. One-Shot Mode (via query param)
      else if (ficheMissionParam) {
        try {
          const fm = JSON.parse(decodeURIComponent(ficheMissionParam));
          // Construct a text representation
          const text = `TITRE: ${fm.title}\n\nRESUME: ${
            fm.summary
          }\n\nCOMPETENCES: ${fm.skills
            ?.map((s: any) => s.name)
            .join(', ')}\n\nPROFILS: ${fm.profiles
            ?.map((p: any) => p.role)
            .join(', ')}`;
          setJobOfferText(text);
          setJobOfferInputType('text');
          toast.success('Données AO chargées');
        } catch (e) {
          console.error('Failed to parse ficheMission param', e);
        }
      }
    };
    init();
  }, [pipelineId, ficheMissionParam, loadSession, activeSession]);

  // React to activeSession changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeSession?.ficheMission && pipelineId) {
      const fm = activeSession.ficheMission as any;
      const text = `TITRE: ${fm.title}\n\nRESUME: ${
        fm.summary
      }\n\nCOMPETENCES: ${fm.skills
        ?.map((s: any) => s.name)
        .join(', ')}\n\nPROFILS: ${fm.profiles
        ?.map((p: any) => p.role)
        .join(', ')}`;
      setJobOfferText(text);
      setJobOfferInputType('text');
      // Only toast once if text is empty
      if (!jobOfferText) toast.success('Données AO récupérées de la pipeline');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, pipelineId]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!matchResults) return [];

    let results = [...matchResults];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.matchedSkills.some((s) => s.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case 'score':
        results.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'skills':
        results.sort((a, b) => b.skillMatch - a.skillMatch);
        break;
      case 'experience':
        results.sort((a, b) => b.experienceMatch - a.experienceMatch);
        break;
    }

    return results;
  }, [matchResults, searchQuery, sortBy]);

  const handleFileModeReset = useCallback(() => {
    setJobOfferFile(null);
    setJobOfferText('');
    setCvFiles([]);
    setFileResults(null);
    setProcessingStatus('');
    setProcessingProgress(0);
    setAbortController(null);
    setStreamingContent('');
  }, []);

  const handleFileModeCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsFileMatching(false);
      setProcessingStatus('');
      setProcessingProgress(0);
      toast.success('Analyse annulée');
    }
  }, [abortController]);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= 5) {
        toast.error('Maximum 5 candidats pour la comparaison');
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const handleRunMatching = async () => {
    let jobDescriptionText = '';

    if (jobOfferInputType === 'text') {
      jobDescriptionText = jobOfferText;
    } else if (jobOfferFile) {
      try {
        jobDescriptionText = await extractFile.mutateAsync(jobOfferFile);
      } catch (err) {
        toast.error("Impossible de lire le fichier de l'offre.");
        return;
      }
    }

    if (!jobDescriptionText?.trim()) {
      toast.error(
        'Veuillez fournir une description de poste (texte ou fichier).'
      );
      return;
    }

    const candidatesToMatch =
      selectedCandidateIds.length > 0
        ? candidates.filter((c) => selectedCandidateIds.includes(c.id))
        : candidates;

    if (candidatesToMatch.length === 0) {
      toast.error('Veuillez sélectionner au moins un candidat.');
      return;
    }

    try {
      const results: MatchResult[] = [];

      for (const candidate of candidatesToMatch) {
        try {
          const matchingResult = await matchCandidate.mutateAsync({
            candidate: {
              id: candidate.id,
              name: `${candidate.firstName} ${candidate.lastName}`,
              title: candidate.title,
              skills: candidate.skills,
              yearsExperience: candidate.yearsOfExperience,
              availability: candidate.availability,
              tjm: candidate.tjm,
            },
            job: {
              description: jobDescriptionText,
            },
          });
          results.push(matchingResult);
        } catch {
          // Continue with next candidate on error
        }
      }

      if (results.length === 0) {
        setMatchResults([]);
        toast.error('Aucun resultat de matching disponible.');
      } else {
        setMatchResults(results);

        // Save to pipeline if active
        if (pipelineId) {
          const { updateStepData } = usePipelineStore.getState();
          await updateStepData(2, 'scoreResult', { results });
        }
      }
    } catch {
      toast.error('Erreur lors du matching.');
    }
  };

  const handleRunFileMatching = async () => {
    if (jobOfferInputType === 'file' && !jobOfferFile) {
      toast.error("Veuillez sélectionner un fichier d'appel d'offres.");
      return;
    }
    if (jobOfferInputType === 'text' && !jobOfferText.trim()) {
      toast.error("Veuillez saisir le texte de l'appel d'offres.");
      return;
    }
    if (cvFiles.length === 0) {
      toast.error('Ajoutez au moins un CV.');
      return;
    }
    if (cvFiles.length > 5) {
      toast.error('Maximum 5 CVs à la fois.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsFileMatching(true);
    setFileResults([]);
    setProcessingStatus("Initialisation de l'analyse...");
    setProcessingProgress(0);
    setStreamingContent('');

    const formData = new FormData();

    if (jobOfferInputType === 'text') {
      const textFile = new File([jobOfferText], 'offre_d_emploi.txt', {
        type: 'text/plain',
      });
      formData.append('jobOffer', textFile);
    } else if (jobOfferFile) {
      formData.append('jobOffer', jobOfferFile);
    }

    cvFiles.forEach((file) => {
      formData.append('cvs', file);
    });

    try {
      const response = await fetch('/api/scoring', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Erreur HTTP' }));
        throw new Error(errorData.message || 'Erreur lors de la requête');
      }

      if (!response.body) throw new Error('Réponse vide');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6);
              const message: StreamMessage = JSON.parse(jsonData);

              if (message.type === 'progress') {
                setProcessingStatus(message.content || '');
                // Estimation de progression
                if (message.content?.includes('Analyse du CV')) {
                  setProcessingProgress((prev) => Math.min(prev + 15, 90));
                }
              } else if (message.type === 'streaming_content') {
                setStreamingContent(message.content || '');
              } else if (message.type === 'partial_result') {
                setFileResults((prev) => [...(prev || []), message.data]);
                setStreamingContent('');
              } else if (message.type === 'complete') {
                setProcessingStatus('Analyse terminée');
                setProcessingProgress(100);
                setStreamingContent('');
                setIsFileMatching(false);
                toast.success('Matching terminé !');
              } else if (message.type === 'error') {
                throw new Error(message.message || 'Erreur inconnue');
              }
            } catch (e) {
              console.error('Erreur parsing SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors du matching'
      );
      setIsFileMatching(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    if (!matchResults) return null;
    const avgScore =
      matchResults.reduce((sum, r) => sum + r.overallScore, 0) /
      matchResults.length;
    const above80 = matchResults.filter((r) => r.overallScore >= 80).length;
    const above90 = matchResults.filter((r) => r.overallScore >= 90).length;
    return { avgScore, above80, above90, total: matchResults.length };
  }, [matchResults]);

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 pb-0 bg-white/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-50 rounded-lg text-green-600'>
              <Target className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                Robert Score
              </h1>
              <p className='text-xs text-gray-500 italic'>
                L'objectivité mathématique au service du recrutement.
              </p>
            </div>
          </div>
          {mode === 'dossier' && (
            <Button
              onClick={handleRunMatching}
              disabled={isMatching}
              className='gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl'
            >
              <Sparkles className='w-4 h-4' />
              {isMatching ? 'Analyse en cours...' : 'Lancer Robert Score'}
            </Button>
          )}
        </div>
        <div className='mt-4 flex border-b border-gray-200'>
          <button
            onClick={() => setMode('dossier')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'dossier'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className='w-4 h-4' />
            Scoring DC
          </button>
          <button
            onClick={() => setMode('files')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'files'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className='w-4 h-4' />
            Scoring Fichiers
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8 space-y-6'>
        {mode === 'files' && (
          <div className='grid gap-6 lg:grid-cols-[420px,1fr]'>
            <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between border-b pb-4 mb-4'>
                <h2 className='text-lg font-bold text-gray-900'>
                  Analyse Robert
                </h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleFileModeReset}
                  className='text-gray-500'
                >
                  Réinitialiser
                </Button>
              </div>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='text-sm font-semibold text-gray-700'>
                      1. Exigences de l'AO
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setJobOfferInputType('file')}
                      disabled={isFileMatching}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        jobOfferInputType === 'file'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <UploadCloud className='inline h-3.5 w-3.5 mr-1.5' />
                      Fichier
                    </button>
                    <button
                      type='button'
                      onClick={() => setJobOfferInputType('text')}
                      disabled={isFileMatching}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        jobOfferInputType === 'text'
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FileText className='inline h-3.5 w-3.5 mr-1.5' />
                      Texte
                    </button>
                  </div>

                  {jobOfferInputType === 'file' ? (
                    <FileDropzone
                      file={jobOfferFile}
                      onFileChange={setJobOfferFile}
                      placeholder="Importer l'Offre (PDF, DOCX, TXT)"
                      accent='blue'
                    />
                  ) : (
                    <Textarea
                      value={jobOfferText}
                      onChange={(e) => setJobOfferText(e.target.value)}
                      placeholder="Collez le contenu de l\'appel d\'offres ici..."
                      className='min-h-[120px] text-sm resize-none'
                    />
                  )}
                </div>

                <div className='space-y-2'>
                  <div className='text-sm font-semibold text-gray-700'>
                    2. Profils Consultants (max 5)
                  </div>
                  <input
                    type='file'
                    className='hidden'
                    id='cv-upload-score'
                    accept='.pdf,.doc,.docx'
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).slice(
                        0,
                        5
                      );
                      setCvFiles(files);
                    }}
                  />
                  <label
                    htmlFor='cv-upload-score'
                    className='flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all'
                  >
                    <span className='flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-blue-500' />
                      {cvFiles.length > 0
                        ? `${cvFiles.length} profil(s) prêt(s)`
                        : 'Ajouter des Consultants'}
                    </span>
                    <Plus className='h-4 w-4' />
                  </label>
                  {cvFiles.length > 0 && (
                    <div className='space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600'>
                      {cvFiles.map((file) => (
                        <div
                          key={file.name}
                          className='flex items-center justify-between'
                        >
                          <span className='truncate pr-2'>{file.name}</span>
                          <button
                            type='button'
                            onClick={() =>
                              setCvFiles((prev) =>
                                prev.filter((f) => f.name !== file.name)
                              )
                            }
                            className='text-gray-400 hover:text-red-500 transition-colors'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isFileMatching && (
                  <div className='rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900'>
                    <div className='font-bold flex items-center gap-2'>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      {processingStatus}
                    </div>
                    <div className='mt-2 h-1.5 w-full rounded-full bg-blue-100'>
                      <div
                        className='h-full rounded-full bg-blue-600 transition-all duration-500'
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <div className='mt-3 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-blue-600'>
                      <span>
                        Progression: {Math.round(processingProgress)}%
                      </span>
                      <button
                        type='button'
                        onClick={handleFileModeCancel}
                        className='hover:underline'
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRunFileMatching}
                  disabled={isFileMatching}
                  className='w-full rounded-xl bg-gray-900 text-white hover:bg-black py-6 text-md font-bold shadow-lg'
                >
                  {isFileMatching
                    ? 'Robert analyse...'
                    : 'Générer Robert Score'}
                </Button>
              </div>
            </div>

            <div className='space-y-4'>
              {!fileResults && !isFileMatching && (
                <div className='rounded-2xl border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm'>
                  <div className='w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Target className='w-8 h-8 text-blue-600' />
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 mb-2'>
                    Matrice de Couverture Robert
                  </h3>
                  <p className='text-gray-500 max-w-sm mx-auto'>
                    Croisez les exigences de l'AO avec vos profils pour obtenir
                    une objectivité mathématique instantanée.
                  </p>
                </div>
              )}

              {fileResults && fileResults.length > 0 && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between px-2'>
                    <h3 className='font-bold text-gray-900 uppercase tracking-widest text-sm'>
                      Meilleurs Profils (Ranking)
                    </h3>
                    <span className='text-xs text-gray-500'>
                      {fileResults.length} profils scorés
                    </span>
                  </div>
                  {fileResults
                    .sort((a, b) => b.score - a.score)
                    .map((result, idx) => (
                      <div
                        key={idx}
                        className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group'
                      >
                        <div className='absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity' />
                        <div className='flex items-start justify-between'>
                          <div className='flex gap-4'>
                            <div className='w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-inner'>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className='text-xs font-bold text-blue-600 uppercase tracking-tighter'>
                                {result.profile.fileName || 'Candidat'}
                              </div>
                              <div className='text-xl font-black text-gray-900 leading-tight'>
                                {result.profile.info.display_name}
                              </div>
                            </div>
                          </div>
                          <ScoreBadge score={result.score} size='lg' />
                        </div>

                        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
                          <div className='space-y-4'>
                            <div className='p-4 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100 leading-relaxed'>
                              <div className='flex items-center gap-2 font-bold text-gray-900 mb-2 uppercase text-[10px] tracking-widest'>
                                <Sparkles className='w-3 h-3 text-blue-600' />
                                Explication Robert
                              </div>
                              {result.justification}
                            </div>

                            <div className='grid grid-cols-1 gap-3'>
                              <ScoreProgress
                                label='Axe Technique (Hard Skills)'
                                score={result.breakdown.keywordScore}
                                size='sm'
                              />
                              <ScoreProgress
                                label='Axe Fonctionnel (Métier)'
                                score={result.breakdown.semanticScore}
                                size='sm'
                              />
                              <ScoreProgress
                                label='Axe Culturel (Soft Skills)'
                                score={Math.round(
                                  (result.breakdown.vectorScore +
                                    result.breakdown.embeddingScore) /
                                    2
                                )}
                                size='sm'
                              />
                            </div>
                          </div>

                          <div className='space-y-4'>
                            <div>
                              <div className='text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center justify-between'>
                                <span>Matrice de Couverture</span>
                                <span className='text-green-600'>
                                  Points Forts
                                </span>
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {result.skills.matching
                                  .slice(0, 6)
                                  .map((skill) => (
                                    <span
                                      key={skill.name}
                                      className='rounded-lg bg-green-50 border border-green-100 px-3 py-1.5 text-xs font-bold text-green-700 flex items-center gap-1.5'
                                    >
                                      <CheckCircle className='w-3 h-3' />
                                      {skill.name}
                                    </span>
                                  ))}
                              </div>
                            </div>

                            <div>
                              <div className='text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center justify-between'>
                                <span>Gap Analysis</span>
                                <span className='text-red-600'>
                                  Écarts identifiés
                                </span>
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {result.skills.missing
                                  .slice(0, 6)
                                  .map((skill) => (
                                    <span
                                      key={skill.name}
                                      className='rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-xs font-bold text-red-700 flex items-center gap-1.5'
                                    >
                                      <AlertCircle className='w-3 h-3' />
                                      {skill.name}
                                    </span>
                                  ))}
                                {result.skills.missing.length === 0 && (
                                  <span className='text-xs text-gray-400 italic'>
                                    Aucun écart majeur détecté.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {mode === 'dossier' && (
          <>
            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-2xl border border-gray-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-green-100 text-green-600 rounded-lg'>
                    <Trophy className='w-5 h-5' />
                  </div>
                  <h3 className='font-semibold text-gray-700'>Score Moyen</h3>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {stats ? `${stats.avgScore.toFixed(0)}%` : '—'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  Sur tous les candidats
                </p>
              </div>

              <div className='bg-white p-6 rounded-2xl border border-gray-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-blue-100 text-blue-600 rounded-lg'>
                    <Target className='w-5 h-5' />
                  </div>
                  <h3 className='font-semibold text-gray-700'>Excellents</h3>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {stats ? stats.above90 : '—'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Score ≥ 90%</p>
              </div>

              <div className='bg-white p-6 rounded-2xl border border-gray-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-purple-100 text-purple-600 rounded-lg'>
                    <Users className='w-5 h-5' />
                  </div>
                  <h3 className='font-semibold text-gray-700'>Compatibles</h3>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {stats ? stats.above80 : '—'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Score ≥ 80%</p>
              </div>

              <div className='bg-white p-6 rounded-2xl border border-gray-100'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-orange-100 text-orange-600 rounded-lg'>
                    <BarChart2 className='w-5 h-5' />
                  </div>
                  <h3 className='font-semibold text-gray-700'>Analysés</h3>
                </div>
                <p className='text-3xl font-bold text-gray-900'>
                  {stats ? stats.total : '—'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>Candidats évalués</p>
              </div>
            </div>

            {!matchResults && !isMatching ? (
              /* No Results Yet */
              <div className='max-w-2xl mx-auto'>
                <div className='bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm'>
                  <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto'>
                    <Sparkles className='w-10 h-10 text-blue-600' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    Prêt pour le Scoring Robert
                  </h2>
                  <p className='text-gray-500 mb-8'>
                    L'IA va évaluer automatiquement l'ensemble de votre base de
                    données candidats par rapport à ce dossier spécifique.
                  </p>

                  <div className='grid grid-cols-1 gap-4 mb-8 text-left'>
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <div className='flex items-center gap-2 mb-4'>
                        <FileText className='w-4 h-4 text-blue-600' />
                        <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                          Offre d'emploi / Mission
                        </span>
                      </div>

                      {/* Job Offer Input */}
                      <div className='space-y-3'>
                        <div className='flex gap-2'>
                          <button
                            type='button'
                            onClick={() => setJobOfferInputType('file')}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              jobOfferInputType === 'file'
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <UploadCloud className='inline h-3.5 w-3.5 mr-1.5' />
                            Fichier
                          </button>
                          <button
                            type='button'
                            onClick={() => setJobOfferInputType('text')}
                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              jobOfferInputType === 'text'
                                ? 'border-blue-300 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <FileText className='inline h-3.5 w-3.5 mr-1.5' />
                            Texte
                          </button>
                        </div>

                        {jobOfferInputType === 'file' ? (
                          <FileDropzone
                            file={jobOfferFile}
                            onFileChange={setJobOfferFile}
                            placeholder="Importer l'Offre (PDF, DOCX, TXT)"
                            accent='blue'
                          />
                        ) : (
                          <Textarea
                            value={jobOfferText}
                            onChange={(e) => setJobOfferText(e.target.value)}
                            placeholder="Collez le contenu de l\'appel d\'offres ici..."
                            className='min-h-[120px] text-sm resize-none'
                          />
                        )}
                      </div>
                    </div>

                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <Users className='w-4 h-4 text-blue-600' />
                          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                            Sélection Candidats
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            selectedCandidateIds.length > 0
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {selectedCandidateIds.length}/5
                        </span>
                      </div>

                      <div className='max-h-60 overflow-y-auto space-y-2 pr-2'>
                        {candidates.length === 0 ? (
                          <p className='text-sm text-gray-500 italic text-center py-4'>
                            Aucun candidat dans la base.
                          </p>
                        ) : (
                          candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              onClick={() =>
                                toggleCandidateSelection(candidate.id)
                              }
                              className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedCandidateIds.includes(candidate.id)
                                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-blue-200'
                              }`}
                            >
                              <div className='flex items-center gap-3'>
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    selectedCandidateIds.includes(candidate.id)
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedCandidateIds.includes(
                                    candidate.id
                                  ) && (
                                    <CheckCircle className='w-3 h-3 text-white' />
                                  )}
                                </div>
                                <div className='text-left'>
                                  <p className='text-sm font-semibold text-gray-900 leading-none'>
                                    {candidate.firstName} {candidate.lastName}
                                  </p>
                                  <p className='text-xs text-gray-500 mt-0.5'>
                                    {candidate.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className=''>
                    <Button
                      onClick={handleRunMatching}
                      disabled={
                        isMatching ||
                        selectedCandidateIds.length === 0 ||
                        (!jobOfferText && !jobOfferFile)
                      }
                      className='w-full max-w-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg font-bold gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Target className='w-5 h-5' />
                      {isMatching
                        ? 'Analyse en cours...'
                        : selectedCandidateIds.length > 0
                        ? `Robert : Comparer ${
                            selectedCandidateIds.length
                          } candidat${
                            selectedCandidateIds.length > 1 ? 's' : ''
                          }`
                        : 'Sélectionnez des candidats'}
                    </Button>
                  </div>
                </div>

                <div className='mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start'>
                  <CheckCircle className='w-5 h-5 text-blue-600 mt-0.5' />
                  <div className='text-sm text-blue-800'>
                    <p className='font-bold'>Comment ça marche ?</p>
                    <p className='opacity-80'>
                      Robert analyse chaque CV de votre base, calcule un score
                      sur 3 axes (Technique, Fonctionnel, Culturel) et les
                      classe du plus pertinent au moins pertinent.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Results */
              <div className='space-y-6'>
                {/* Toolbar */}
                <div className='flex items-center justify-between gap-4'>
                  <div className='relative flex-1 max-w-md'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Rechercher un candidat...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setMatchResults(null)}
                      className='rounded-xl'
                    >
                      <X className='w-4 h-4 mr-2' /> Effacer
                    </Button>
                    <span className='text-sm text-gray-500'>Trier par:</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as 'score' | 'skills' | 'experience'
                        )
                      }
                      className='px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500'
                    >
                      <option value='score'>Score global</option>
                      <option value='skills'>Compétences</option>
                      <option value='experience'>Expérience</option>
                    </select>
                  </div>
                </div>

                {/* Results List */}
                <div className='space-y-4'>
                  {filteredResults.map((result, index) => (
                    <Link
                      key={result.candidateId}
                      href={`/mes-candidats/${result.candidateId}`}
                      className='block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all group'
                    >
                      <div className='flex items-start gap-6'>
                        {/* Rank & Avatar */}
                        <div className='flex items-center gap-4'>
                          <div className='w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-400'>
                            #{index + 1}
                          </div>
                          <div className='w-14 h-14 bg-green-50 rounded-full flex items-center justify-center'>
                            <span className='text-lg font-semibold text-green-600'>
                              {result.avatar}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className='flex-1'>
                          <div className='flex items-start justify-between mb-4'>
                            <div>
                              <h3 className='text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors'>
                                {result.name}
                              </h3>
                              <p className='text-gray-500'>{result.title}</p>
                            </div>
                            <ScoreBadge score={result.overallScore} size='lg' />
                          </div>

                          {/* Score Breakdown */}
                          <div className='grid grid-cols-4 gap-4 mb-4'>
                            <div>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-gray-500'>
                                  Compétences
                                </span>
                                <span className='text-xs font-medium text-gray-700'>
                                  {result.skillMatch}%
                                </span>
                              </div>
                              <ScoreProgress
                                score={result.skillMatch}
                                showLabel={false}
                                size='sm'
                              />
                            </div>
                            <div>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-gray-500'>
                                  Expérience
                                </span>
                                <span className='text-xs font-medium text-gray-700'>
                                  {result.experienceMatch}%
                                </span>
                              </div>
                              <ScoreProgress
                                score={result.experienceMatch}
                                showLabel={false}
                                size='sm'
                              />
                            </div>
                            <div>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-gray-500'>
                                  Disponibilité
                                </span>
                                <span className='text-xs font-medium text-gray-700'>
                                  {result.availabilityMatch}%
                                </span>
                              </div>
                              <ScoreProgress
                                score={result.availabilityMatch}
                                showLabel={false}
                                size='sm'
                              />
                            </div>
                            <div>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-gray-500'>
                                  Budget
                                </span>
                                <span className='text-xs font-medium text-gray-700'>
                                  {result.budgetMatch}%
                                </span>
                              </div>
                              <ScoreProgress
                                score={result.budgetMatch}
                                showLabel={false}
                                size='sm'
                              />
                            </div>
                          </div>

                          {/* Skills */}
                          <div className='flex items-center gap-4'>
                            <div className='flex-1'>
                              <p className='text-xs text-gray-500 mb-1'>
                                Compétences matchées
                              </p>
                              <div className='flex flex-wrap gap-1'>
                                {result.matchedSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className='px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded'
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {result.missingSkills.length > 0 && (
                              <div className='flex-1'>
                                <p className='text-xs text-gray-500 mb-1'>
                                  Compétences manquantes
                                </p>
                                <div className='flex flex-wrap gap-1'>
                                  {result.missingSkills.map((skill) => (
                                    <span
                                      key={skill}
                                      className='px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded'
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors' />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pipeline Navigation */}
                {pipelineId && filteredResults.length > 0 && (
                  <div className='mt-8 pt-6 border-t border-gray-100 flex justify-end'>
                    <Button
                      className='bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2'
                      onClick={async () => {
                        const { advanceStep } = usePipelineStore.getState();
                        await advanceStep();
                        // Next step is Pre-Qualif (module 3)
                        // Pass the first selected candidate or top ranked candidate
                        const topCandidateId = filteredResults[0]?.candidateId;
                        // router is not available here, need to import it or use Link if possible but we need to run async function
                        // I should import router at component level.
                        // Wait, I imported router in AOReaderPage but not here.
                        // I need to add router to ScorePage.
                        window.location.href = `/modules/pre-qualif?pipeline=${pipelineId}&candidateId=${topCandidateId}`;
                      }}
                    >
                      <ChevronRight className='w-4 h-4' />
                      Étape suivante: Pré-Qualification
                    </Button>
                  </div>
                )}

                {filteredResults.length === 0 && (
                  <div className='bg-white rounded-2xl border border-gray-100 p-12 text-center'>
                    <p className='text-gray-500'>
                      Aucun résultat pour cette recherche
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={null}>
      <ScorePageContent />
    </Suspense>
  );
}
