'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  Upload,
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
}

export function SimpleAuthenticMatch() {
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

  const steps = [
    {
      id: 1,
      title: 'Téléchargement du CV',
      description: "Importez votre CV pour commencer l'analyse.",
      icon: <Upload className='w-5 h-5' />,
    },
    {
      id: 2,
      title: "Description de l'Offre d'Emploi",
      description: 'Collez la description du poste pour lequel vous postulez.',
      icon: <FileText className='w-5 h-5' />,
    },
    {
      id: 3,
      title: 'Analyse et Matching',
      description: "Le système analyse votre CV et l'offre d'emploi.",
      icon: <Target className='w-5 h-5' />,
    },
    {
      id: 4,
      title: 'Génération du CV Optimisé',
      description:
        "Recevez un CV sur mesure et des suggestions d'amélioration.",
      icon: <Sparkles className='w-5 h-5' />,
    },
  ];

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setCvFile(file);
        setError(null);
        setLoading(true);

        // Pour l'instant, garder la lecture locale pour TXT si on veut être rapide,
        // mais pour uniformiser, tout passer par l'API est plus sûr avec le nouveau backend robuste.
        // Sauf si c'est du pur texte, on peut le lire direct pour économiser un appel API.
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text && text.trim().length > 50) {
              setCvText(text);
              setCurrentStep(2);
              setLoading(false);
            } else {
              setError('Le fichier texte semble vide ou trop court.');
              setLoading(false);
            }
          };
          reader.onerror = () => {
            setError('Erreur de lecture du fichier.');
            setLoading(false);
          };
          reader.readAsText(file);
          return;
        }

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
              "Impossible d'extraire suffisamment de texte de ce fichier."
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
      // Step 1: Authentic Match Analysis
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

      // Step 2: CV Optimization
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
    <div className='container mx-auto p-4 max-w-4xl'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-2'>AUTHENTIC-MATCH 🇫🇷</h1>
        <p className='text-gray-600'>
          Système de matching authentique pour le marché français
        </p>
      </div>

      {/* Progress Bar */}
      <div className='mb-8'>
        <div className='flex justify-between text-sm text-gray-600 mb-2'>
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                currentStep >= step.id
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              {step.icon}
              <span className='mt-1'>{step.title}</span>
            </div>
          ))}
        </div>
        <Progress
          value={(currentStep / steps.length) * 100}
          className='w-full'
        />
      </div>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: CV Upload */}
      {currentStep === 1 && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5' />
              Étape 1: Téléchargement du CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
              <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <p className='text-lg font-medium mb-2'>Téléchargez votre CV</p>
              <p className='text-gray-600 mb-4'>
                Formats acceptés: PDF, DOC, DOCX, TXT
              </p>
              <input
                type='file'
                accept='.pdf,.doc,.docx,.txt'
                onChange={handleFileUpload}
                className='hidden'
                id='cv-upload'
              />
              <Button asChild>
                <label htmlFor='cv-upload' className='cursor-pointer'>
                  Choisir un fichier
                </label>
              </Button>
            </div>
            {cvFile && (
              <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                <p className='text-green-800 font-medium'>
                  ✓ Fichier sélectionné: {cvFile.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Job Description */}
      {currentStep === 2 && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Étape 2: Description de l'Offre d'Emploi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor='job-description' className='mb-2 block'>
              Collez la description de l'offre d'emploi ici:
            </Label>
            <Textarea
              id='job-description'
              placeholder='Ex: Nous recherchons un développeur Fullstack expérimenté en React et Node.js...'
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className='min-h-[200px]'
            />
            <div className='flex gap-4 mt-4'>
              <Button variant='outline' onClick={() => setCurrentStep(1)}>
                <ChevronLeft className='w-4 h-4 mr-2' />
                Retour
              </Button>
              <Button
                onClick={handleJobDescriptionSubmit}
                disabled={loading || !jobDescription.trim()}
                className='flex-1'
              >
                {loading ? 'Analyse en cours...' : 'Générer mon CV optimisé'}
                <ChevronRight className='w-4 h-4 ml-2' />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Matching Analysis */}
      {currentStep === 3 && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='w-5 h-5' />
              Étape 3: Analyse et Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8'>
                <RefreshCw className='w-8 h-8 animate-spin text-blue-500 mx-auto mb-4' />
                <p className='text-lg text-gray-700'>
                  Analyse en cours... Veuillez patienter.
                </p>
                <Progress value={progress} className='w-full mt-4' />
              </div>
            ) : matchingResult ? (
              <div>
                <div className='text-center mb-6'>
                  <div className='text-4xl font-bold text-blue-600 mb-2'>
                    {(matchingResult.overallScore * 100).toFixed(1)}%
                  </div>
                  <Badge variant='outline' className='text-lg'>
                    {matchingResult.matchLevel}
                  </Badge>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='text-lg font-semibold mb-3 text-green-600'>
                      ✓ Points Forts
                    </h4>
                    <ul className='space-y-2'>
                      {matchingResult.strengths.map((strength, i) => (
                        <li key={i} className='flex items-start gap-2'>
                          <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                          <span className='text-sm'>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className='text-lg font-semibold mb-3 text-orange-600'>
                      ⚠ Axes d'Amélioration
                    </h4>
                    <ul className='space-y-2'>
                      {matchingResult.improvements.map((improvement, i) => (
                        <li key={i} className='flex items-start gap-2'>
                          <AlertCircle className='w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0' />
                          <span className='text-sm'>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep(4)}
                  className='w-full mt-6'
                >
                  Voir le CV Optimisé
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              </div>
            ) : (
              <p className='text-center text-gray-600 py-8'>
                Aucun résultat de matching disponible.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Optimized CV Generation */}
      {currentStep === 4 && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='w-5 h-5' />
              Étape 4: Votre CV Optimisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='text-center py-8'>
                <RefreshCw className='w-8 h-8 animate-spin text-blue-500 mx-auto mb-4' />
                <p className='text-lg text-gray-700'>
                  Génération du CV optimisé en cours...
                </p>
                <Progress value={progress} className='w-full mt-4' />
              </div>
            ) : optimizedCv ? (
              <div>
                <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-green-800 font-medium'>
                    ✓ Votre CV a été optimisé avec succès !
                  </p>
                </div>

                <div className='mb-4'>
                  <Label htmlFor='optimized-cv' className='mb-2 block'>
                    CV Optimisé :
                  </Label>
                  <Textarea
                    id='optimized-cv'
                    value={optimizedCv}
                    rows={15}
                    readOnly
                    className='min-h-[300px] font-mono text-sm'
                  />
                </div>

                <div className='flex gap-4'>
                  <Button
                    onClick={handleDownloadOptimizedCv}
                    className='flex-1'
                  >
                    <Download className='w-4 h-4 mr-2' />
                    Télécharger le CV Optimisé
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleReset}
                    className='flex-1'
                  >
                    <RefreshCw className='w-4 h-4 mr-2' />
                    Recommencer
                  </Button>
                </div>
              </div>
            ) : (
              <p className='text-center text-gray-600 py-8'>
                Aucun CV optimisé disponible.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
