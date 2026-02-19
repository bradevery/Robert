'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  Copy,
  Download,
  FileCheck,
  FileText,
  Languages,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useFileExtraction } from '@/hooks/useFileExtraction';
import { useOrganization } from '@/hooks/useOrganization';
import { useReviewer, ReviewResult, RewriteResult } from '@/hooks/useReviewer';

import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

// Types
type InputType = 'text' | 'file';

// Reusable components matching Score/Pre-qualif style

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

// Reusable components matching Score/Pre-qualif style

// Main Component
export default function ReviewerPage() {
  const [mode, setMode] = useState<'audit' | 'rewrite'>('audit');

  // Hooks
  const { analyze, rewrite } = useReviewer();
  const extractFile = useFileExtraction();
  const { data: orgData } = useOrganization();

  // CV Input State
  const [cvInputType, setCvInputType] = useState<InputType>('file');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvContent, setCvContent] = useState('');

  // Job Offer Input State
  const [jobOfferInputType, setJobOfferInputType] = useState<InputType>('text');
  const [jobOfferFile, setJobOfferFile] = useState<File | null>(null);
  const [targetOffer, setTargetOffer] = useState('');

  // Results State
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'ats' | 'keywords' | 'impact'>(
    'ats'
  );

  const isProcessing = analyze.isPending || rewrite.isPending || extractFile.isPending;

  const handleProcess = useCallback(async () => {
    try {
      // 1. Get CV Content
      let finalCvText = cvContent;
      if (cvInputType === 'file') {
        if (!cvFile) {
          toast.error('Veuillez fournir un CV.');
          return;
        }
        try {
          finalCvText = await extractFile.mutateAsync(cvFile);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Erreur extraction CV');
          return;
        }
      } else if (!finalCvText.trim()) {
        toast.error('Veuillez coller le texte du CV.');
        return;
      }

      // 2. Get Job Offer Content (Optional for Audit, Mandatory for Rewrite)
      let finalJobText = targetOffer;
      if (jobOfferInputType === 'file' && jobOfferFile) {
        try {
          finalJobText = await extractFile.mutateAsync(jobOfferFile);
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : 'Erreur extraction Offre'
          );
          return;
        }
      }

      if (mode === 'rewrite' && !finalJobText.trim()) {
        toast.error("L'offre d'emploi est requise pour la réécriture.");
        return;
      }

      // 3. Process
      if (mode === 'audit') {
        const analysisResult = await analyze.mutateAsync({ content: finalCvText, targetOffer: finalJobText });
        setResult(analysisResult);
        toast.success('Audit terminé !');
      } else {
        const rewriteRes = await rewrite.mutateAsync({ cvText: finalCvText, jobDescription: finalJobText });
        setRewriteResult(rewriteRes);
        toast.success('Optimisation terminée !');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors du traitement.');
      console.error(error);
    }
  }, [
    cvContent,
    cvFile,
    cvInputType,
    jobOfferFile,
    jobOfferInputType,
    mode,
    targetOffer,
    extractFile,
    analyze,
    rewrite
  ]);

  const handleExportPPTX = useCallback(async () => {
    if (!rewriteResult) return;
    try {
      const { exportReviewToPPTX } = await import('@/lib/pptx/reviewer-export');
      await exportReviewToPPTX(rewriteResult, orgData);
      toast.success('Export PPTX réussi');
    } catch (e) {
      console.error(e);
      toast.error('Erreur export PPTX');
    }
  }, [rewriteResult, orgData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  // Helper stats
  const passCount = useMemo(
    () => result?.atsChecks?.filter((c) => c.status === 'pass').length || 0,
    [result]
  );
  const _warningCount = useMemo(
    () => result?.atsChecks?.filter((c) => c.status === 'warning').length || 0,
    [result]
  );
  const failCount = useMemo(
    () => result?.atsChecks?.filter((c) => c.status === 'fail').length || 0,
    [result]
  );
  const foundKeywords = useMemo(
    () => result?.keywords?.filter((k) => k.found).length || 0,
    [result]
  );

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 pb-0 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div
              className={`p-2 rounded-lg ${
                mode === 'audit'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-purple-50 text-purple-600'
              }`}
            >
              {mode === 'audit' ? (
                <FileCheck className='w-5 h-5' />
              ) : (
                <Sparkles className='w-5 h-5' />
              )}
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Robert Reviewer
              </h1>
              <p className='text-sm text-gray-500'>
                {mode === 'audit'
                  ? 'Audit et optimisation de CV'
                  : "Alignement sémantique avec l'offre"}
              </p>
            </div>
          </div>
        </div>
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setMode('audit')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'audit'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckSquare className='w-4 h-4' />
            Audit ATS
          </button>
          <button
            onClick={() => setMode('rewrite')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'rewrite'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Sparkles className='w-4 h-4' />
            Optimisation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8 max-w-5xl mx-auto space-y-8'>
        {/* INPUT SECTION */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* CV Input */}
          <div className='space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
            <div className='space-y-2'>
              <div className='text-sm font-medium text-gray-700'>
                1. Le CV (Candidat)
              </div>
              <InputTypeToggle
                value={cvInputType}
                onChange={setCvInputType}
                disabled={isProcessing}
              />
            </div>

            {cvInputType === 'file' ? (
              <FileDropzone
                file={cvFile}
                onFileChange={setCvFile}
                placeholder='Importer CV (PDF, DOCX, TXT)'
                disabled={isProcessing}
                accent='purple'
              />
            ) : (
              <Textarea
                placeholder='Collez le contenu du CV ici...'
                className='min-h-[140px] text-xs resize-none bg-gray-50 border-gray-200'
                value={cvContent}
                onChange={(e) => setCvContent(e.target.value)}
                disabled={isProcessing}
              />
            )}
          </div>

          {/* Job Offer Input */}
          <div className='space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm'>
            <div className='space-y-2'>
              <div className='text-sm font-medium text-gray-700'>
                2. L&apos;Offre (AO)
              </div>
              <InputTypeToggle
                value={jobOfferInputType}
                onChange={setJobOfferInputType}
                disabled={isProcessing}
              />
            </div>

            {jobOfferInputType === 'file' ? (
              <FileDropzone
                file={jobOfferFile}
                onFileChange={setJobOfferFile}
                placeholder="Importer l'Offre (PDF, DOCX, TXT)"
                disabled={isProcessing}
                accent='purple'
              />
            ) : (
              <Textarea
                placeholder="Collez l'offre d'emploi ici..."
                className='min-h-[140px] text-xs resize-none bg-gray-50 border-gray-200'
                value={targetOffer}
                onChange={(e) => setTargetOffer(e.target.value)}
                disabled={isProcessing}
              />
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className='flex justify-center'>
          <Button
            className={`w-full max-w-sm h-12 text-white gap-2 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] ${
              mode === 'audit'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-100'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-100'
            }`}
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className='w-5 h-5 animate-spin' />
                Traitement en cours...
              </>
            ) : mode === 'audit' ? (
              <>
                <Target className='w-5 h-5' /> Lancer l'Audit ATS
              </>
            ) : (
              <>
                <Sparkles className='w-5 h-5' /> Optimiser le CV
              </>
            )}
          </Button>
        </div>

        {/* RESULTS AREA */}

        {/* MODE AUDIT RESULT */}
        {mode === 'audit' && result && !isProcessing && (
          <div className='animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8'>
            {/* Score Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div
                className={`${getScoreBg(result.globalScore)} p-6 rounded-2xl`}
              >
                <div className='text-sm text-gray-600 mb-1'>Score Global</div>
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    result.globalScore
                  )}`}
                >
                  {result.globalScore}
                  <span className='text-lg'>/100</span>
                </div>
                <Progress value={result.globalScore} className='mt-2 h-2' />
              </div>
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-sm text-gray-600 mb-1'>
                  Compatibilité ATS
                </div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    result.atsScore
                  )}`}
                >
                  {result.atsScore}%
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {passCount} critères validés
                </div>
              </div>
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-sm text-gray-600 mb-1'>Lisibilité</div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    result.readabilityScore
                  )}`}
                >
                  {result.readabilityScore}%
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  Structure et clarté
                </div>
              </div>
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <div className='text-sm text-gray-600 mb-1'>Impact</div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(
                    result.impactScore
                  )}`}
                >
                  {result.impactScore}%
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {result.impact?.quantifiedResults ?? 0} résultats chiffrés
                </div>
              </div>
            </div>

            {/* Audit Details */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2'>
                <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm'>
                  <div className='flex border-b border-gray-100'>
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'ats'
                          ? 'bg-gray-50 text-gray-900 border-b-2 border-red-500'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('ats')}
                    >
                      Checklist ATS ({failCount} erreurs)
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'keywords'
                          ? 'bg-gray-50 text-gray-900 border-b-2 border-red-500'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('keywords')}
                    >
                      Mots-clés ({foundKeywords}/{result.keywords.length})
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'impact'
                          ? 'bg-gray-50 text-gray-900 border-b-2 border-red-500'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('impact')}
                    >
                      Impact & Verbes
                    </button>
                  </div>

                  <div className='p-6'>
                    {activeTab === 'ats' && (
                      <div className='space-y-3'>
                        {result.atsChecks.map((check) => (
                          <div
                            key={check.id}
                            className={`p-3 rounded-lg border flex items-start gap-3 ${
                              check.status === 'pass'
                                ? 'bg-green-50 border-green-100'
                                : check.status === 'warning'
                                ? 'bg-orange-50 border-orange-100'
                                : 'bg-red-50 border-red-100'
                            }`}
                          >
                            {check.status === 'pass' && (
                              <CheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
                            )}
                            {check.status === 'warning' && (
                              <AlertCircle className='w-5 h-5 text-orange-500 mt-0.5' />
                            )}
                            {check.status === 'fail' && (
                              <XCircle className='w-5 h-5 text-red-500 mt-0.5' />
                            )}
                            <div>
                              <div className='font-medium text-gray-900 text-sm'>
                                {check.label}
                              </div>
                              <div className='text-xs text-gray-600'>
                                {check.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'keywords' && (
                      <div className='grid grid-cols-2 gap-3'>
                        {result.keywords.map((kw) => (
                          <div
                            key={kw.keyword}
                            className={`p-3 rounded-lg border flex items-center justify-between ${
                              kw.found
                                ? 'bg-green-50 border-green-100'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className='flex items-center gap-2'>
                              {kw.found ? (
                                <CheckCircle className='w-4 h-4 text-green-600' />
                              ) : (
                                <XCircle className='w-4 h-4 text-gray-400' />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  kw.found ? 'text-green-900' : 'text-gray-500'
                                }`}
                              >
                                {kw.keyword}
                              </span>
                            </div>
                            <span className='text-[10px] bg-white px-2 py-0.5 rounded border'>
                              {kw.importance}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'impact' && (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-3 gap-3 text-center'>
                          <div className='p-3 bg-blue-50 rounded-xl'>
                            <div className='text-2xl font-bold text-blue-600'>
                              {result.impact?.actionVerbs ?? 0}
                            </div>
                            <div className='text-[10px] text-blue-800 uppercase font-bold'>
                              Verbes
                            </div>
                          </div>
                          <div className='p-3 bg-green-50 rounded-xl'>
                            <div className='text-2xl font-bold text-green-600'>
                              {result.impact?.quantifiedResults ?? 0}
                            </div>
                            <div className='text-[10px] text-green-800 uppercase font-bold'>
                              Chiffres
                            </div>
                          </div>
                          <div className='p-3 bg-orange-50 rounded-xl'>
                            <div className='text-2xl font-bold text-orange-600'>
                              {result.impact?.buzzwords ?? 0}
                            </div>
                            <div className='text-[10px] text-orange-800 uppercase font-bold'>
                              Buzzwords
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className='text-xs font-bold text-gray-500 uppercase mb-2'>
                            Suggestions
                          </h5>
                          <ul className='space-y-2'>
                            {result.impact?.suggestions?.map(
                              (suggestion, i) => (
                                <li
                                  key={i}
                                  className='flex gap-2 text-sm text-gray-600'
                                >
                                  <Lightbulb className='w-4 h-4 text-yellow-500 shrink-0' />
                                  {suggestion}
                                </li>
                              )
                            ) ?? (
                              <li className='text-sm text-gray-500'>
                                Aucune suggestion disponible.
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-sm'>
                  <div className='flex items-center gap-2 mb-4'>
                    <AlertTriangle className='w-5 h-5 text-orange-500' />
                    <h3 className='font-bold text-gray-900'>Améliorations</h3>
                  </div>
                  <div className='space-y-3'>
                    {result.improvements.map((improvement, i) => (
                      <div
                        key={i}
                        className='flex items-start gap-3 p-3 bg-orange-50 rounded-lg'
                      >
                        <span className='flex items-center justify-center w-5 h-5 bg-orange-200 text-orange-700 text-xs font-bold rounded-full flex-shrink-0'>
                          {i + 1}
                        </span>
                        <span className='text-xs text-gray-800 leading-relaxed'>
                          {improvement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE REWRITE RESULT */}
        {mode === 'rewrite' && rewriteResult && !isProcessing && (
          <div className='animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8'>
            {/* Header Result */}
            <div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100'>
              <div className='flex items-start gap-4'>
                <div className='p-3 bg-purple-100 text-purple-600 rounded-xl'>
                  <Sparkles className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900'>
                    CV Optimisé par Robert
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Langue détectée:{' '}
                    <span className='font-semibold uppercase text-purple-600'>
                      {rewriteResult.language}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Basics */}
            <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
              <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2'>
                En-tête & Résumé
              </h4>
              <div className='space-y-4'>
                <div>
                  <span className='text-[10px] text-purple-600 font-bold uppercase tracking-wide'>
                    Titre Proposé
                  </span>
                  <div className='text-xl font-bold text-gray-900 mt-1'>
                    {rewriteResult.basics.title}
                  </div>
                </div>
                <div>
                  <span className='text-[10px] text-purple-600 font-bold uppercase tracking-wide'>
                    Résumé Exécutif
                  </span>
                  <p className='text-sm text-gray-700 mt-1 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100'>
                    {rewriteResult.basics.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2'>
                  Hard Skills
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {rewriteResult.skills.technical.map((skill, i) => (
                    <span
                      key={i}
                      className='px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm'>
                <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2'>
                  Soft Skills
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {rewriteResult.skills.soft.map((skill, i) => (
                    <span
                      key={i}
                      className='px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md border border-green-100'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experiences */}
            <div className='space-y-4'>
              <h4 className='text-xs font-black text-gray-400 uppercase tracking-widest px-2'>
                Expériences Reformulées
              </h4>
              {rewriteResult.experiences.map((exp, i) => (
                <div
                  key={i}
                  className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group hover:border-purple-200 transition-all'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h5 className='font-bold text-gray-900 text-lg'>
                        {exp.role}
                      </h5>
                      <p className='text-sm text-gray-500 font-medium'>
                        {exp.company}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2'>
                      <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                        {exp.description}
                      </p>
                    </div>
                    <div className='bg-purple-50 rounded-xl p-4 h-fit'>
                      <div className='flex items-center gap-2 mb-2 text-[10px] font-bold text-purple-700 uppercase tracking-wide'>
                        <Lightbulb className='w-3 h-3' /> Améliorations
                        Apportées
                      </div>
                      <ul className='space-y-2'>
                        {exp.improvementsMade.map((imp, idx) => (
                          <li
                            key={idx}
                            className='text-xs text-purple-900 flex items-start gap-2'
                          >
                            <span className='mt-1.5 w-1 h-1 bg-purple-400 rounded-full flex-shrink-0' />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
              <Button
                variant='outline'
                className='rounded-xl gap-2'
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(rewriteResult, null, 2)
                  )
                }
              >
                <Copy className='w-4 h-4' /> Copier JSON
              </Button>
              <Button
                className='bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2'
                onClick={handleExportPPTX}
              >
                <Languages className='w-4 h-4' /> Export PPTX
              </Button>
              {/* Note: In a real app, generate a Word doc here */}
              <Button className='bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2'>
                <Download className='w-4 h-4' /> Exporter en Word
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
