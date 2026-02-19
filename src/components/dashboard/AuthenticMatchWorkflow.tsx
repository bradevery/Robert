'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AlertCircle,
  CheckCircle,
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
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface MatchingResult {
  overallScore: number;
  matchLevel: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  authenticity: {
    globalScore: number;
    issues: string[];
    recommendations: string[];
  };
  breakdown: {
    technical: number;
    experience: number;
    education: number;
    softSkills: number;
    cultural: number;
  };
}

interface OptimizedCV {
  content: string;
  improvements: string[];
  score: number;
}

export function AuthenticMatchWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(
    null
  );
  const [optimizedCV, setOptimizedCV] = useState<OptimizedCV | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Upload CV',
      description: 'Téléchargez votre CV pour analyse',
      icon: <Upload className='w-5 h-5' />,
      status:
        currentStep === 1
          ? 'current'
          : currentStep > 1
          ? 'completed'
          : 'pending',
    },
    {
      id: 2,
      title: "Offre d'emploi",
      description: 'Saisissez la description du poste',
      icon: <Target className='w-5 h-5' />,
      status:
        currentStep === 2
          ? 'current'
          : currentStep > 2
          ? 'completed'
          : 'pending',
    },
    {
      id: 3,
      title: 'Analyse & Matching',
      description: 'Analyse authentique et matching',
      icon: <FileText className='w-5 h-5' />,
      status:
        currentStep === 3
          ? 'current'
          : currentStep > 3
          ? 'completed'
          : 'pending',
    },
    {
      id: 4,
      title: 'CV Optimisé',
      description: 'Génération du CV optimisé',
      icon: <Sparkles className='w-5 h-5' />,
      status:
        currentStep === 4
          ? 'current'
          : currentStep > 4
          ? 'completed'
          : 'pending',
    },
  ];

  const handleFileUpload = useCallback((file: File) => {
    setCvFile(file);
    // Simuler l'extraction du texte du CV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCvText(text);
      setCurrentStep(2);
    };
    reader.readAsText(file);
  }, []);

  const handleJobDescriptionSubmit = () => {
    if (jobDescription.trim()) {
      setCurrentStep(3);
      performMatching();
    }
  };

  const performMatching = async () => {
    setLoading(true);
    setError(null);

    try {
      // Appel à l'API de matching authentique
      const response = await fetch('/api/authentic-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText,
          jobText: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse de matching");
      }

      const data = await response.json();
      setMatchingResult(data.data.summary);
      setCurrentStep(4);

      // Générer le CV optimisé
      await generateOptimizedCV();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const generateOptimizedCV = async () => {
    try {
      // Appel à l'API de génération de CV optimisé
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalCV: cvText,
          jobDescription,
          matchingResult,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du CV optimisé');
      }

      const data = await response.json();
      setOptimizedCV(data.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const _resetWorkflow = () => {
    setCurrentStep(1);
    setCvFile(null);
    setCvText('');
    setJobDescription('');
    setMatchingResult(null);
    setOptimizedCV(null);
    setError(null);
  };

  const downloadOptimizedCV = () => {
    if (optimizedCV) {
      const blob = new Blob([optimizedCV.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv-optimise.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-2'>AUTHENTIC-MATCH Workflow 🇫🇷</h1>
        <p className='text-muted-foreground'>
          Analysez et optimisez votre CV avec notre système de matching
          authentique
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${
                    step.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : step.status === 'error'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }
                `}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : step.status === 'error' ? (
                    <AlertCircle className='w-5 h-5' />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className='ml-3'>
                  <p
                    className={`font-medium ${
                      step.status === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className='text-sm text-gray-500'>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className='flex-1 h-0.5 bg-gray-200 mx-4' />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: CV Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5' />
              Étape 1: Téléchargement du CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileDropzone
              file={cvFile}
              onFileChange={(file) => file && handleFileUpload(file)}
              accept='.pdf,.doc,.docx,.txt'
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Job Description */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='w-5 h-5' />
              Étape 2: Description du poste
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='job-description'>
                Description de l'offre d'emploi
              </Label>
              <Textarea
                id='job-description'
                placeholder='Collez ici la description complète du poste que vous visez...'
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className='mt-2'
              />
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={handleJobDescriptionSubmit}
                disabled={!jobDescription.trim()}
              >
                <FileText className='w-4 h-4 mr-2' />
                Analyser le Matching
              </Button>
              <Button variant='outline' onClick={() => setCurrentStep(1)}>
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Matching Analysis */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Étape 3: Analyse en cours...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <RefreshCw className='w-12 h-12 mx-auto text-blue-500 animate-spin mb-4' />
              <p className='text-lg font-medium mb-2'>
                Analyse authentique en cours
              </p>
              <p className='text-gray-500 mb-4'>
                Notre IA analyse votre CV et l'offre d'emploi...
              </p>
              <Progress
                value={loading ? 50 : 100}
                className='w-full max-w-md mx-auto'
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results & Optimized CV */}
      {currentStep === 4 && matchingResult && (
        <div className='space-y-6'>
          {/* Matching Results */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='w-5 h-5 text-green-500' />
                Résultats du Matching Authentique
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Overall Score */}
              <div className='text-center'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>
                  {(matchingResult.overallScore * 100).toFixed(1)}%
                </div>
                <Badge variant='outline' className='text-lg px-4 py-2'>
                  {matchingResult.matchLevel}
                </Badge>
              </div>

              {/* Breakdown */}
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {(matchingResult.breakdown.technical * 100).toFixed(0)}%
                  </div>
                  <p className='text-sm text-gray-600'>Technique</p>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {(matchingResult.breakdown.experience * 100).toFixed(0)}%
                  </div>
                  <p className='text-sm text-gray-600'>Expérience</p>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {(matchingResult.breakdown.education * 100).toFixed(0)}%
                  </div>
                  <p className='text-sm text-gray-600'>Formation</p>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {(matchingResult.breakdown.softSkills * 100).toFixed(0)}%
                  </div>
                  <p className='text-sm text-gray-600'>Soft Skills</p>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-pink-600'>
                    {(matchingResult.breakdown.cultural * 100).toFixed(0)}%
                  </div>
                  <p className='text-sm text-gray-600'>Culture</p>
                </div>
              </div>

              {/* Authenticity Score */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold mb-2'>Score d'Authenticité</h3>
                <div className='flex items-center gap-2'>
                  <Progress
                    value={matchingResult.authenticity.globalScore * 100}
                    className='flex-1'
                  />
                  <span className='text-sm font-medium'>
                    {(matchingResult.authenticity.globalScore * 100).toFixed(0)}
                    %
                  </span>
                </div>
                {matchingResult.authenticity.issues.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-sm text-red-600 font-medium'>
                      Points d'attention:
                    </p>
                    <ul className='text-sm text-red-600 list-disc list-inside'>
                      {matchingResult.authenticity.issues.map(
                        (issue, index) => (
                          <li key={index}>{issue}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Strengths */}
              <div>
                <h3 className='font-semibold mb-2 text-green-600'>
                  Points Forts
                </h3>
                <ul className='list-disc list-inside text-sm text-gray-700'>
                  {matchingResult.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h3 className='font-semibold mb-2 text-orange-600'>
                  Axes d'Amélioration
                </h3>
                <ul className='list-disc list-inside text-sm text-gray-700'>
                  {matchingResult.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Optimized CV */}
          {optimizedCV && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Sparkles className='w-5 h-5 text-purple-500' />
                  CV Optimisé Généré
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckCircle className='w-5 h-5 text-green-500' />
                    <span className='font-semibold text-green-700'>
                      Score d'amélioration: +
                      {(optimizedCV.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className='text-sm text-green-600'>
                    Votre CV a été optimisé pour mieux correspondre à l'offre
                    d'emploi
                  </p>
                </div>

                <div className='space-y-2'>
                  <h3 className='font-semibold'>Améliorations apportées:</h3>
                  <ul className='list-disc list-inside text-sm text-gray-700'>
                    {optimizedCV.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>

                <div className='flex gap-2'>
                  <Button onClick={downloadOptimizedCV}>
                    <Download className='w-4 h-4 mr-2' />
                    Télécharger le CV optimisé
                  </Button>
                  <Button variant='outline' onClick={() => setCurrentStep(1)}>
                    <RefreshCw className='w-4 h-4 mr-2' />
                    Nouvelle analyse
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
