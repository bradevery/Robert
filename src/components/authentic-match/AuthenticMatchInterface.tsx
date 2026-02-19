'use client';

import {
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Info,
  Lightbulb,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface AuthenticMatchResult {
  score: {
    overall: number;
    breakdown: {
      technical: {
        score: number;
        exact: string[];
        similar: Array<{ cv: string; job: string; similarity: number }>;
        transferable: Array<{ cv: string; job: string; reason: string }>;
        missing: string[];
        extra: string[];
      };
      experience: {
        score: number;
        cvYears: number;
        requiredYears: { min: number; max: number };
        relevantYears: number;
        seniorityMatch: number;
        companyTypeMatch: number;
      };
      education: {
        score: number;
        cvDiploma: string;
        requiredDiploma: string;
        isEquivalent: boolean;
        explanation: string;
        equivalences: string[];
      };
      softSkills: {
        score: number;
        matched: string[];
        missing: string[];
        transferable: string[];
      };
      cultural: {
        score: number;
        valuesMatch: number;
        environmentMatch: number;
        aspirationsMatch: number;
      };
      authenticity: number;
    };
    adaptiveWeights: Record<string, number>;
    recommendations: Array<{
      type: string;
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      impact: number;
      isNatural: boolean;
    }>;
  };
  authenticity: {
    globalScore: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
    recommendations: string[];
    breakdown: {
      naturalLanguage: number;
      temporalCoherence: number;
      personality: number;
      keywordDensity: number;
      uniqueness: number;
    };
  };
  suggestions: Array<{
    id: string;
    type: 'improvement' | 'addition' | 'reformulation' | 'structure';
    section: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    example: string;
    impact: number;
    isNatural: boolean;
    preservesAuthenticity: boolean;
  }>;
  summary: {
    overallScore: number;
    matchLevel: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

export default function AuthenticMatchInterface() {
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuthenticMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!cvText.trim() || !jobText.trim()) {
      setError("Veuillez saisir le texte du CV et de l'offre d'emploi");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/authentic-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText: cvText.trim(),
          jobText: jobText.trim(),
          useCache: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-gray-900'>
          🎯 Matching Authentique CV-Emploi
        </h1>
        <p className='text-gray-600'>
          Le système de matching le plus avancé pour le marché français
        </p>
      </div>

      {/* Formulaire de saisie */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5' />
            Analyse de Matching
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Texte du CV</label>
              <Textarea
                placeholder='Collez ici le texte de votre CV...'
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={8}
                className='resize-none'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Offre d'emploi</label>
              <Textarea
                placeholder="Collez ici le texte de l'offre d'emploi..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={8}
                className='resize-none'
              />
            </div>
          </div>

          {error && (
            <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center gap-2 text-red-800'>
                <AlertCircle className='h-4 w-4' />
                <span className='font-medium'>Erreur</span>
              </div>
              <p className='text-red-700 mt-1'>{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !cvText.trim() || !jobText.trim()}
            className='w-full'
          >
            {isLoading ? (
              <>
                <Clock className='h-4 w-4 mr-2 animate-spin' />
                Analyse en cours...
              </>
            ) : (
              <>
                <Target className='h-4 w-4 mr-2' />
                Analyser le Matching
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {result && (
        <div className='space-y-6'>
          {/* Résumé global */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Résumé du Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-blue-600'>
                    {Math.round(result.summary.overallScore * 100)}%
                  </div>
                  <div className='text-sm text-gray-600'>Score Global</div>
                  <Badge
                    className={`mt-2 ${getScoreBadgeColor(
                      result.summary.overallScore
                    )}`}
                  >
                    {result.summary.matchLevel}
                  </Badge>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-green-600'>
                    {Math.round(result.authenticity.globalScore * 100)}%
                  </div>
                  <div className='text-sm text-gray-600'>Authenticité</div>
                  <Badge
                    className={`mt-2 ${getScoreBadgeColor(
                      result.authenticity.globalScore
                    )}`}
                  >
                    {result.authenticity.globalScore >= 0.8
                      ? 'Excellent'
                      : result.authenticity.globalScore >= 0.6
                      ? 'Bon'
                      : 'À améliorer'}
                  </Badge>
                </div>
                <div className='text-center'>
                  <div className='text-3xl font-bold text-purple-600'>
                    {result.suggestions.length}
                  </div>
                  <div className='text-sm text-gray-600'>Suggestions</div>
                  <Badge className='mt-2 bg-purple-100 text-purple-800'>
                    {result.suggestions.filter((s) => s.isNatural).length}{' '}
                    naturelles
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails du matching */}
          <Tabs defaultValue='scores' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='scores'>Scores</TabsTrigger>
              <TabsTrigger value='authenticity'>Authenticité</TabsTrigger>
              <TabsTrigger value='suggestions'>Suggestions</TabsTrigger>
              <TabsTrigger value='details'>Détails</TabsTrigger>
            </TabsList>

            <TabsContent value='scores' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Compétences techniques */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>
                      Compétences Techniques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Score</span>
                      <span
                        className={`font-bold ${getScoreColor(
                          result.score.breakdown.technical.score
                        )}`}
                      >
                        {Math.round(
                          result.score.breakdown.technical.score * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={result.score.breakdown.technical.score * 100}
                    />

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span>Exactes:</span>
                        <Badge variant='outline'>
                          {result.score.breakdown.technical.exact.length}
                        </Badge>
                      </div>
                      <div className='flex justify-between'>
                        <span>Similaires:</span>
                        <Badge variant='outline'>
                          {result.score.breakdown.technical.similar.length}
                        </Badge>
                      </div>
                      <div className='flex justify-between'>
                        <span>Transférables:</span>
                        <Badge variant='outline'>
                          {result.score.breakdown.technical.transferable.length}
                        </Badge>
                      </div>
                      <div className='flex justify-between'>
                        <span>Manquantes:</span>
                        <Badge variant='outline' className='text-red-600'>
                          {result.score.breakdown.technical.missing.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expérience */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Expérience</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Score</span>
                      <span
                        className={`font-bold ${getScoreColor(
                          result.score.breakdown.experience.score
                        )}`}
                      >
                        {Math.round(
                          result.score.breakdown.experience.score * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={result.score.breakdown.experience.score * 100}
                    />

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span>Années CV:</span>
                        <span className='font-medium'>
                          {result.score.breakdown.experience.cvYears}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Requis:</span>
                        <span className='font-medium'>
                          {result.score.breakdown.experience.requiredYears.min}-
                          {result.score.breakdown.experience.requiredYears.max}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Pertinentes:</span>
                        <span className='font-medium'>
                          {result.score.breakdown.experience.relevantYears}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formation */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Formation</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Score</span>
                      <span
                        className={`font-bold ${getScoreColor(
                          result.score.breakdown.education.score
                        )}`}
                      >
                        {Math.round(
                          result.score.breakdown.education.score * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={result.score.breakdown.education.score * 100}
                    />

                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center gap-2'>
                        <span>Équivalent:</span>
                        {result.score.breakdown.education.isEquivalent ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <AlertCircle className='h-4 w-4 text-red-600' />
                        )}
                      </div>
                      <div className='text-xs text-gray-600'>
                        {result.score.breakdown.education.explanation}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='authenticity' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5' />
                    Analyse d'Authenticité
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {Object.entries(result.authenticity.breakdown).map(
                      ([key, value]) => (
                        <div key={key} className='text-center'>
                          <div className='text-2xl font-bold text-blue-600'>
                            {Math.round(value * 100)}%
                          </div>
                          <div className='text-sm text-gray-600 capitalize'>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <Progress value={value * 100} className='mt-2' />
                        </div>
                      )
                    )}
                  </div>

                  {result.authenticity.issues.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='font-medium'>Problèmes détectés:</h4>
                      {result.authenticity.issues.map((issue, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 p-2 bg-yellow-50 rounded'
                        >
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <span className='text-sm'>{issue.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.authenticity.recommendations.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='font-medium'>Recommandations:</h4>
                      {result.authenticity.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className='flex items-start gap-2 p-2 bg-blue-50 rounded'
                        >
                          <Info className='h-4 w-4 text-blue-600 mt-0.5' />
                          <span className='text-sm'>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='suggestions' className='space-y-4'>
              <div className='space-y-4'>
                {result.suggestions
                  .filter((s) => s.isNatural && s.preservesAuthenticity)
                  .sort((a, b) => b.impact - a.impact)
                  .map((suggestion, _index) => (
                    <Card key={suggestion.id}>
                      <CardContent className='pt-6'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                className={getPriorityColor(
                                  suggestion.priority
                                )}
                              >
                                {suggestion.priority}
                              </Badge>
                              <Badge variant='outline'>
                                {suggestion.section}
                              </Badge>
                              <span className='text-sm text-gray-600'>
                                Impact: {suggestion.impact}/10
                              </span>
                            </div>
                            <p className='font-medium'>
                              {suggestion.suggestion}
                            </p>
                            {suggestion.example && (
                              <div className='p-3 bg-gray-50 rounded text-sm'>
                                <strong>Exemple:</strong> {suggestion.example}
                              </div>
                            )}
                          </div>
                          <Lightbulb className='h-5 w-5 text-yellow-500' />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value='details' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Points Forts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {result.summary.strengths.map((strength, index) => (
                        <li key={index} className='flex items-center gap-2'>
                          <CheckCircle className='h-4 w-4 text-green-600' />
                          <span className='text-sm'>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Axes d'Amélioration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {result.summary.improvements.map((improvement, index) => (
                        <li key={index} className='flex items-center gap-2'>
                          <AlertCircle className='h-4 w-4 text-yellow-600' />
                          <span className='text-sm'>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Prochaines Étapes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className='space-y-2'>
                    {result.summary.nextSteps.map((step, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium'>
                          {index + 1}
                        </span>
                        <span className='text-sm'>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
