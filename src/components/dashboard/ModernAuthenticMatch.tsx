'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  Brain,
  CheckCircle,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface MatchingResult {
  overallScore: number;
  matchLevel: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  breakdown: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
    cultural: number;
  };
}

export function ModernAuthenticMatch() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [optimizedCv, setOptimizedCv] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setCvFile(file);
        setError(null);

        // Simuler une extraction basique pour les fichiers TXT
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text && text.trim().length > 50) {
              setCvText(text);
              setCurrentStep(2);
              setError(null);
            } else {
              setError(
                'Le fichier semble vide ou trop court. Veuillez coller le contenu de votre CV ci-dessous.'
              );
            }
          };
          reader.onerror = () => {
            setError(
              'Erreur lors de la lecture du fichier. Veuillez coller le contenu de votre CV ci-dessous.'
            );
          };
          reader.readAsText(file);
        } else {
          // Pour PDF/DOC/DOCX, utiliser l'API d'extraction
          setLoading(true);
          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch('/api/files/extract-text', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || "Erreur lors de l'extraction du texte"
              );
            }

            const data = await response.json();
            if (data.text && data.text.trim().length > 50) {
              setCvText(data.text);
              setCurrentStep(2);
            } else {
              setError(
                "Impossible d'extraire suffisamment de texte de ce fichier. Veuillez copier-coller le contenu."
              );
            }
          } catch (err: any) {
            console.error('Erreur extraction:', err);
            setError(
              err.message ||
                "Une erreur est survenue lors de l'analyse du fichier."
            );
          } finally {
            setLoading(false);
          }
        }
      }
    },
    []
  );

  const handleJobDescriptionSubmit = () => {
    if (jobDescription.trim()) {
      setCurrentStep(3);
      performMatching();
    } else {
      setError("Veuillez entrer une description d'offre d'emploi.");
    }
  };

  const performMatching = async () => {
    setLoading(true);
    setError(null);
    setMatchingResult(null);
    setOptimizedCv(null);
    setProgress(0);

    try {
      setProgress(25);
      const matchResponse = await fetch('/api/authentic-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobText: jobDescription }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(
          errorData.error || "Erreur lors de l'analyse de matching"
        );
      }
      const matchData = await matchResponse.json();
      setMatchingResult(matchData.data.summary);
      setProgress(50);

      setProgress(75);
      const optimizeResponse = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobText: jobDescription,
          matchResult: matchData.data.summary,
        }),
      });

      if (!optimizeResponse.ok) {
        const errorData = await optimizeResponse.json();
        throw new Error(
          errorData.error || "Erreur lors de l'optimisation du CV"
        );
      }
      const optimizeData = await optimizeResponse.json();
      setOptimizedCv(optimizeData.data.optimizedCv);
      setProgress(100);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOptimizedCv = () => {
    if (optimizedCv) {
      const blob = new Blob([optimizedCv], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv_optimise.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCvFile(null);
    setCvText('');
    setJobDescription('');
    setMatchingResult(null);
    setOptimizedCv(null);
    setLoading(false);
    setError(null);
    setProgress(0);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex items-center justify-center mb-4'>
              <Sparkles className='w-8 h-8 mr-2' />
              <h1 className='text-4xl font-bold'>AUTHENTIC-MATCH 🇫🇷</h1>
            </div>
            <p className='text-xl text-blue-100 max-w-2xl mx-auto'>
              Optimisez votre CV automatiquement avec l'IA pour le marché
              français
            </p>
          </motion.div>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 py-8'>
        {/* Progress Steps */}
        <div className='mb-12'>
          <div className='flex justify-between items-center relative'>
            <div className='absolute top-5 left-0 right-0 h-1 bg-gray-200'>
              <motion.div
                className='h-full bg-gradient-to-r from-blue-600 to-purple-600'
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {[
              { num: 1, label: 'Télécharger CV', icon: Upload },
              { num: 2, label: "Offre d'emploi", icon: FileText },
              { num: 3, label: 'Analyse', icon: Target },
              { num: 4, label: 'CV Optimisé', icon: Sparkles },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div
                  key={step.num}
                  className='flex flex-col items-center relative z-10'
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: step.num * 0.1 }}
                  >
                    {isActive && currentStep > step.num ? (
                      <CheckCircle className='w-6 h-6' />
                    ) : (
                      <Icon className='w-6 h-6' />
                    )}
                  </motion.div>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <Alert variant='destructive' className='bg-red-50 border-red-200'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <AnimatePresence mode='wait'>
          {/* Step 1: CV Upload */}
          {currentStep === 1 && (
            <motion.div
              key='step1'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className='shadow-xl border-0 bg-white/80 backdrop-blur'>
                <CardHeader className='border-b bg-gradient-to-r from-blue-50 to-purple-50'>
                  <CardTitle className='flex items-center gap-2 text-2xl'>
                    <Upload className='w-6 h-6 text-blue-600' />
                    Téléchargez votre CV
                  </CardTitle>
                  <p className='text-gray-600 mt-2'>
                    Commencez par importer votre CV actuel ou collez directement
                    le texte ci-dessous.
                  </p>
                </CardHeader>
                <CardContent className='p-8'>
                  <div className='space-y-6'>
                    <div className='border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-400 transition-all duration-300'>
                      <input
                        type='file'
                        accept='.pdf,.doc,.docx,.txt'
                        onChange={handleFileUpload}
                        className='hidden'
                        id='cv-upload'
                        disabled={loading}
                      />
                      <label
                        htmlFor='cv-upload'
                        className={`cursor-pointer block ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className='w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                          {loading ? (
                            <RefreshCw className='w-10 h-10 text-white animate-spin' />
                          ) : (
                            <Upload className='w-10 h-10 text-white' />
                          )}
                        </div>
                        <h3 className='text-xl font-semibold mb-2'>
                          {loading
                            ? 'Analyse du fichier en cours...'
                            : 'Cliquez pour télécharger'}
                        </h3>
                        <p className='text-gray-600 mb-4'>
                          {loading
                            ? 'Veuillez patienter...'
                            : 'ou glissez-déposez votre fichier'}
                        </p>
                        {!loading && (
                          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
                            <FileCheck className='w-4 h-4' />
                            <span>PDF, DOC, DOCX, TXT (Max 10 MB)</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {cvFile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3'
                      >
                        <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                          <CheckCircle className='w-6 h-6 text-green-600' />
                        </div>
                        <div>
                          <p className='font-medium text-green-800'>
                            Fichier téléchargé avec succès
                          </p>
                          <p className='text-sm text-green-600'>
                            {cvFile.name}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-gray-300'></div>
                      </div>
                      <div className='relative flex justify-center text-sm'>
                        <span className='px-2 bg-white text-gray-500'>OU</span>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor='cv-text'
                        className='text-lg font-medium mb-3 block'
                      >
                        Collez le contenu de votre CV
                      </Label>
                      <Textarea
                        id='cv-text'
                        placeholder="Collez ici le texte complet de votre CV...

Exemple:
Développeur Fullstack
5 ans d'expérience en React et Node.js

Expériences:
• Développeur Senior chez...
• ..."
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        rows={12}
                        className='min-h-[250px] text-base border-2 focus:border-blue-500 rounded-xl'
                      />
                      <div className='flex justify-between mt-2 text-sm text-gray-500'>
                        <span>{cvText.length} caractères</span>
                        <span>
                          {cvText.split(' ').filter((w) => w).length} mots
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (cvText.trim().length > 50) {
                          setCurrentStep(2);
                          setError(null);
                        } else {
                          setError(
                            'Veuillez entrer au moins 50 caractères de votre CV.'
                          );
                        }
                      }}
                      disabled={cvText.trim().length < 50}
                      className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg'
                    >
                      Continuer
                      <ChevronRight className='w-5 h-5 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Job Description */}
          {currentStep === 2 && (
            <motion.div
              key='step2'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className='shadow-xl border-0 bg-white/80 backdrop-blur'>
                <CardHeader className='border-b bg-gradient-to-r from-blue-50 to-purple-50'>
                  <CardTitle className='flex items-center gap-2 text-2xl'>
                    <FileText className='w-6 h-6 text-blue-600' />
                    Description de l'offre d'emploi
                  </CardTitle>
                  <p className='text-gray-600 mt-2'>
                    Collez l'annonce complète pour une analyse précise et une
                    optimisation ciblée.
                  </p>
                </CardHeader>
                <CardContent className='p-8'>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
                      <Lightbulb className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                      <div className='text-sm text-blue-800'>
                        <p className='font-medium mb-1'>Conseil Pro</p>
                        <p>
                          Incluez toutes les sections : missions, compétences
                          requises, profil recherché, et avantages.
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor='job-description'
                        className='text-lg font-medium mb-3 block'
                      >
                        Offre d'emploi
                      </Label>
                      <Textarea
                        id='job-description'
                        placeholder="Exemple : 
Nous recherchons un Développeur Full Stack passionné...

Missions :
• Développer et maintenir des applications web
• Collaborer avec l'équipe produit
• ...

Compétences requises :
• React, Node.js, PostgreSQL
• ..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={12}
                        className='min-h-[300px] text-base border-2 focus:border-blue-500 rounded-xl'
                      />
                      <div className='flex justify-between mt-2 text-sm text-gray-500'>
                        <span>{jobDescription.length} caractères</span>
                        <span>
                          {jobDescription.split(' ').filter((w) => w).length}{' '}
                          mots
                        </span>
                      </div>
                    </div>

                    <div className='flex gap-4 pt-4'>
                      <Button
                        variant='outline'
                        onClick={() => setCurrentStep(1)}
                        className='flex-1'
                      >
                        <ChevronRight className='w-4 h-4 mr-2 rotate-180' />
                        Retour
                      </Button>
                      <Button
                        onClick={handleJobDescriptionSubmit}
                        disabled={loading || !jobDescription.trim()}
                        className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      >
                        {loading ? (
                          <>
                            <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className='w-4 h-4 mr-2' />
                            Générer mon CV optimisé
                            <ChevronRight className='w-4 h-4 ml-2' />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Matching Analysis */}
          {currentStep === 3 && (
            <motion.div
              key='step3'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className='shadow-xl border-0 bg-white/80 backdrop-blur'>
                <CardHeader className='border-b bg-gradient-to-r from-blue-50 to-purple-50'>
                  <CardTitle className='flex items-center gap-2 text-2xl'>
                    <Target className='w-6 h-6 text-blue-600' />
                    Analyse en cours
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-8'>
                  {loading ? (
                    <div className='text-center py-12'>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className='w-20 h-20 mx-auto mb-6'
                      >
                        <div className='w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600'></div>
                      </motion.div>
                      <h3 className='text-2xl font-semibold mb-2'>
                        Analyse de votre profil...
                      </h3>
                      <p className='text-gray-600 mb-6'>
                        Notre IA analyse votre CV et l'offre d'emploi
                      </p>
                      <Progress
                        value={progress}
                        className='w-full max-w-md mx-auto h-3'
                      />
                      <p className='text-sm text-gray-500 mt-4'>
                        {progress}% complété
                      </p>
                    </div>
                  ) : matchingResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='space-y-6'
                    >
                      {/* Score Card */}
                      <div className='text-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white'>
                        <div className='text-6xl font-bold mb-2'>
                          {(matchingResult.overallScore * 100).toFixed(0)}%
                        </div>
                        <Badge
                          variant='secondary'
                          className='text-lg px-4 py-2'
                        >
                          {matchingResult.matchLevel}
                        </Badge>
                        <p className='mt-4 text-blue-100'>
                          Score de compatibilité globale
                        </p>
                      </div>

                      {/* Breakdown */}
                      {matchingResult.breakdown && (
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                          {Object.entries(matchingResult.breakdown).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className='p-4 bg-gray-50 rounded-xl'
                              >
                                <div className='flex items-center justify-between mb-2'>
                                  <span className='text-sm font-medium text-gray-600 capitalize'>
                                    {key === 'technical'
                                      ? 'Technique'
                                      : key === 'experience'
                                      ? 'Expérience'
                                      : key === 'education'
                                      ? 'Formation'
                                      : key === 'softSkills'
                                      ? 'Soft Skills'
                                      : 'Culture'}
                                  </span>
                                  <span className='text-sm font-bold text-gray-900'>
                                    {(value * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <Progress value={value * 100} className='h-2' />
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Strengths and Improvements */}
                      <div className='grid md:grid-cols-2 gap-6'>
                        <div className='p-6 bg-green-50 border border-green-200 rounded-xl'>
                          <div className='flex items-center gap-2 mb-4'>
                            <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                              <CheckCircle className='w-6 h-6 text-green-600' />
                            </div>
                            <h4 className='text-lg font-semibold text-green-800'>
                              Points Forts
                            </h4>
                          </div>
                          <ul className='space-y-3'>
                            {matchingResult.strengths.map((strength, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className='flex items-start gap-2 text-green-700'
                              >
                                <CheckCircle className='w-5 h-5 mt-0.5 flex-shrink-0' />
                                <span>{strength}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        <div className='p-6 bg-orange-50 border border-orange-200 rounded-xl'>
                          <div className='flex items-center gap-2 mb-4'>
                            <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                              <TrendingUp className='w-6 h-6 text-orange-600' />
                            </div>
                            <h4 className='text-lg font-semibold text-orange-800'>
                              À Améliorer
                            </h4>
                          </div>
                          <ul className='space-y-3'>
                            {matchingResult.improvements.map(
                              (improvement, i) => (
                                <motion.li
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className='flex items-start gap-2 text-orange-700'
                                >
                                  <AlertCircle className='w-5 h-5 mt-0.5 flex-shrink-0' />
                                  <span>{improvement}</span>
                                </motion.li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      <Button
                        onClick={() => setCurrentStep(4)}
                        className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg'
                      >
                        <Sparkles className='w-5 h-5 mr-2' />
                        Voir mon CV optimisé
                        <ChevronRight className='w-5 h-5 ml-2' />
                      </Button>
                    </motion.div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Optimized CV */}
          {currentStep === 4 && (
            <motion.div
              key='step4'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className='shadow-xl border-0 bg-white/80 backdrop-blur'>
                <CardHeader className='border-b bg-gradient-to-r from-blue-50 to-purple-50'>
                  <CardTitle className='flex items-center gap-2 text-2xl'>
                    <Sparkles className='w-6 h-6 text-blue-600' />
                    Votre CV Optimisé
                  </CardTitle>
                  <p className='text-gray-600 mt-2'>
                    Votre CV a été optimisé pour maximiser vos chances de succès
                    !
                  </p>
                </CardHeader>
                <CardContent className='p-8'>
                  {loading ? (
                    <div className='text-center py-12'>
                      <RefreshCw className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
                      <p className='text-lg text-gray-700'>
                        Génération du CV optimisé en cours...
                      </p>
                    </div>
                  ) : optimizedCv ? (
                    <div className='space-y-6'>
                      <div className='p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center'>
                            <CheckCircle className='w-7 h-7 text-white' />
                          </div>
                          <div>
                            <h3 className='text-xl font-semibold text-green-800'>
                              CV optimisé avec succès !
                            </h3>
                            <p className='text-green-700'>
                              Votre CV est maintenant parfaitement adapté à
                              l'offre
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor='optimized-cv'
                          className='text-lg font-medium mb-3 block'
                        >
                          Aperçu du CV optimisé :
                        </Label>
                        <Textarea
                          id='optimized-cv'
                          value={optimizedCv}
                          rows={15}
                          readOnly
                          className='min-h-[400px] font-mono text-sm bg-gray-50 border-2'
                        />
                      </div>

                      <div className='grid md:grid-cols-2 gap-4'>
                        <Button
                          onClick={handleDownloadOptimizedCv}
                          className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6'
                        >
                          <Download className='w-5 h-5 mr-2' />
                          Télécharger le CV optimisé
                        </Button>
                        <Button
                          variant='outline'
                          onClick={handleReset}
                          className='py-6'
                        >
                          <RefreshCw className='w-5 h-5 mr-2' />
                          Optimiser un autre CV
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-12 grid md:grid-cols-3 gap-6'
          >
            {[
              {
                icon: Brain,
                title: 'IA Avancée',
                description:
                  'Analyse contextuelle avec Mistral AI pour le marché français',
                color: 'blue',
              },
              {
                icon: Award,
                title: 'Matching Authentique',
                description:
                  'Score multi-dimensionnel basé sur 6 critères clés',
                color: 'purple',
              },
              {
                icon: Zap,
                title: 'Optimisation Rapide',
                description: 'Génération en moins de 2 minutes',
                color: 'green',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className='p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow'
                >
                  <div
                    className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 text-sm'>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
