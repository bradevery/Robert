'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Check, Download, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  CVData,
  JobData,
  JobscanAnalysis,
  RecruiterTip,
  SearchabilityIssue,
  SkillComparison,
} from '@/types/cv-matcher';

export default function CVAnalysisPage() {
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [analysisResults, setAnalysisResults] =
    useState<JobscanAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_expandedSections, _setExpandedSections] = useState<Set<string>>(
    new Set([
      'searchability',
      'hardSkills',
      'softSkills',
      'recruiterTips',
      'formatting',
    ])
  );
  const [activeTab, setActiveTab] = useState<'resume' | 'job'>('resume');
  const [activeSkillsTab, setActiveSkillsTab] = useState<{
    [key: string]: 'comparison' | 'highlighted';
  }>({
    hardSkills: 'comparison',
    softSkills: 'comparison',
  });

  // Récupérer les données du localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('cv-analysis-data');

      if (!storedData) {
        router.push('/dashboard');
        return;
      }

      const {
        cvData: storedCvData,
        jobData: storedJobData,
        timestamp,
      } = JSON.parse(storedData);

      // Vérifier que les données ne sont pas trop anciennes (1 heure max)
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - timestamp > oneHour) {
        localStorage.removeItem('cv-analysis-data');
        router.push('/dashboard');
        return;
      }

      setCvData(storedCvData);
      setJobData(storedJobData);

      // Déclencher l'analyse automatiquement
      startAnalysis(storedCvData, storedJobData);
    } catch (error) {
      console.error('Erreur lecture des données:', error);
      localStorage.removeItem('cv-analysis-data');
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction pour lancer l'analyse
  const startAnalysis = async (cvData: CVData, jobData: JobData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/matching/jobscan-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          jobData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setAnalysisResults(result.data);
    } catch (error) {
      console.error('Erreur analyse:', error);
      setError(
        error instanceof Error ? error.message : "Erreur lors de l'analyse"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    // Smooth scroll vers la section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const getMatchRateColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchRateLevel = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const getStatusIcon = (status: 'error' | 'warning' | 'success') => {
    switch (status) {
      case 'error':
        return <X className='w-4 h-4 text-red-500' />;
      case 'warning':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case 'success':
        return <Check className='w-4 h-4 text-green-500' />;
    }
  };

  const highlightSkillsInText = (text: string, skills: SkillComparison[]) => {
    if (!text || !skills.length) return text;

    let highlightedText = text;

    // Sort skills by length (longest first) to avoid partial matches
    const sortedSkills = skills
      .map((s) => s.skill)
      .filter((skill) => skill.length > 2) // Filter out very short skills
      .sort((a, b) => b.length - a.length);

    sortedSkills.forEach((skill) => {
      // Escape special regex characters
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create case-insensitive regex with word boundaries
      const regex = new RegExp(`\\b(${escapedSkill})\\b`, 'gi');

      // Find skill in both resume and job data to determine color
      const skillData = skills.find(
        (s) => s.skill.toLowerCase() === skill.toLowerCase()
      );
      const isInResume = skillData?.inResume || false;
      const isInJob = skillData?.inJob || false;
      const importance = skillData?.importance || 'low';

      // Determine highlighting color based on match status
      let bgColor = 'bg-gray-200';
      let textColor = 'text-gray-700';

      if (isInResume && isInJob) {
        // Matching skill - green
        bgColor = importance === 'high' ? 'bg-green-300' : 'bg-green-200';
        textColor = 'text-green-900';
      } else if (isInJob && !isInResume) {
        // Missing skill - red
        bgColor = importance === 'high' ? 'bg-red-300' : 'bg-red-200';
        textColor = 'text-red-900';
      } else if (isInResume && !isInJob) {
        // Skill variation - yellow
        bgColor = 'bg-yellow-200';
        textColor = 'text-yellow-800';
      }

      // Apply highlighting
      highlightedText = highlightedText.replace(
        regex,
        `<span class="px-1 py-0.5 rounded ${bgColor} ${textColor} font-medium" title="Skill: ${skill} | Found in Resume: ${isInResume} | Required in Job: ${isInJob} | Importance: ${importance}">$1</span>`
      );
    });

    return highlightedText;
  };

  if (isAnalyzing) {
    return (
      <div className='container p-6'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className='w-16 h-16 mx-auto mb-6 border-4 border-blue-600 border-t-transparent rounded-full'
            />
            <h2 className='mb-2 text-2xl font-semibold text-gray-900'>
              Analyse en cours...
            </h2>
            <p className='text-gray-600'>
              Analyse détaillée de compatibilité entre votre CV et l'offre
              d'emploi
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysisResults) {
    return (
      <div className='container p-6'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <AlertCircle className='w-16 h-16 mx-auto mb-6 text-red-500' />
            <h2 className='mb-2 text-2xl font-semibold text-gray-900'>
              Erreur d'analyse
            </h2>
            <p className='mb-6 text-gray-600'>
              {error || "Une erreur est survenue lors de l'analyse de votre CV"}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Analyse CV - {jobData?.title || 'Poste'}
          </h1>
          <p className='text-gray-600'>
            Analyse détaillée de compatibilité avec l'offre d'emploi
          </p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={() => router.push('/dashboard')}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Retour
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            <Download className='w-4 h-4' />
            Télécharger l'analyse
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        {/* Left Sidebar - Match Rate & Sections */}
        <div className='space-y-6 lg:col-span-1'>
          {/* Match Rate */}
          <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
            <CardContent className='p-6 text-center'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Taux de Compatibilité
              </h3>
              <div className='relative inline-flex items-center justify-center w-32 h-32 mb-4'>
                <svg className='w-32 h-32 transform -rotate-90'>
                  <circle
                    cx='64'
                    cy='64'
                    r='56'
                    fill='none'
                    stroke='#e5e7eb'
                    strokeWidth='8'
                  />
                  <circle
                    cx='64'
                    cy='64'
                    r='56'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='8'
                    strokeDasharray={351.86}
                    strokeDashoffset={
                      351.86 - (351.86 * analysisResults.matchRate.score) / 100
                    }
                    className={getMatchRateColor(
                      analysisResults.matchRate.score
                    )}
                  />
                </svg>
                <div className='absolute text-center'>
                  <div
                    className={`text-2xl font-bold ${getMatchRateColor(
                      analysisResults.matchRate.score
                    )}`}
                  >
                    {analysisResults.matchRate.score}%
                  </div>
                  <div className='text-sm text-gray-600'>
                    Compatibilité{' '}
                    {getMatchRateLevel(analysisResults.matchRate.score) ===
                    'High'
                      ? 'Élevée'
                      : getMatchRateLevel(analysisResults.matchRate.score) ===
                        'Medium'
                      ? 'Moyenne'
                      : 'Faible'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload & Rescan Button */}
          <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
            <CardContent className='p-4'>
              <Button className='w-full bg-blue-600 hover:bg-blue-700 font-medium'>
                Analyser nouveau CV
              </Button>
            </CardContent>
          </Card>

          {/* Power Edit Button */}
          <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
            <CardContent className='p-4'>
              <Button variant='outline' className='w-full font-medium'>
                <Zap className='w-4 h-4 mr-2' />
                Optimisation IA
              </Button>
            </CardContent>
          </Card>

          {/* Progress Bars Navigation */}
          <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
            <CardContent className='p-0'>
              {Object.entries(analysisResults.sections).map(
                ([sectionId, section]) => {
                  const issuesCount =
                    'issues' in section
                      ? section.issues.length
                      : 'tips' in section
                      ? section.tips.length
                      : 0;
                  const score = 'score' in section ? section.score : 0;

                  return (
                    <button
                      key={sectionId}
                      onClick={() => toggleSection(sectionId)}
                      className='w-full p-4 text-left transition-colors hover:bg-gray-50 border-b last:border-b-0'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <span className='font-medium text-gray-900'>
                          {sectionId === 'searchability' && 'Lisibilité ATS'}
                          {sectionId === 'hardSkills' &&
                            'Compétences Techniques'}
                          {sectionId === 'softSkills' &&
                            'Compétences Comportementales'}
                          {sectionId === 'recruiterTips' &&
                            'Conseils Recruteur'}
                          {sectionId === 'formatting' && 'Formatage'}
                        </span>
                        <span className='text-sm text-blue-600 font-medium'>
                          {issuesCount} points à améliorer
                        </span>
                      </div>
                      <div className='w-full h-2 bg-gray-200 rounded-full'>
                        <div
                          className='h-2 bg-blue-500 rounded-full transition-all duration-300'
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </button>
                  );
                }
              )}
            </CardContent>
          </Card>

          {/* Guide Me */}
          <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
            <CardContent className='p-4 text-center'>
              <Button
                variant='ghost'
                className='w-full font-medium text-blue-600'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                    clipRule='evenodd'
                  ></path>
                </svg>
                Guide d'optimisation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resume vs Job Description Tabs */}
        <div className='space-y-8 lg:col-span-3'>
          {/* Tab Group */}
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'resume'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mon CV
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'job'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Offre d'Emploi
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'resume' ? (
            <>
              {/* Section Details - Resume View */}
              {Object.entries(analysisResults.sections).map(
                ([sectionId, section]) => {
                  return (
                    <Card
                      key={sectionId}
                      id={sectionId}
                      className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-center justify-between mb-6'>
                          <div className='flex items-center gap-3'>
                            <h2 className='text-xl font-semibold text-gray-900'>
                              {sectionId === 'searchability' &&
                                'Lisibilité ATS'}
                              {sectionId === 'hardSkills' &&
                                'Compétences Techniques'}
                              {sectionId === 'softSkills' &&
                                'Compétences Comportementales'}
                              {sectionId === 'recruiterTips' &&
                                'Conseils Recruteur'}
                              {sectionId === 'formatting' && 'Formatage'}
                            </h2>
                            <span className='px-3 py-1 text-xs font-medium text-white bg-gray-700 rounded-full uppercase'>
                              {sectionId === 'searchability' && 'Essentiel'}
                              {sectionId === 'hardSkills' && 'Impact Élevé'}
                              {sectionId === 'softSkills' && 'Impact Moyen'}
                              {sectionId === 'recruiterTips' && 'Recommandé'}
                              {sectionId === 'formatting' &&
                                'Compatibilité ATS'}
                            </span>
                          </div>
                        </div>

                        {/* Section Description */}
                        <div className='mb-6 text-gray-700'>
                          {sectionId === 'searchability' && (
                            <div>
                              <p className='mb-3'>
                                Un ATS (Applicant Tracking System) est un
                                logiciel utilisé par 90% des entreprises et
                                recruteurs pour rechercher des CV et gérer le
                                processus de recrutement. Voici comment votre CV
                                apparaît dans un ATS et une recherche de
                                recruteur.
                              </p>
                              <p>
                                <strong>Conseil :</strong> Corrigez les croix
                                rouges pour vous assurer que votre CV est
                                facilement trouvable par les recruteurs et
                                correctement analysé par l'ATS.
                              </p>
                            </div>
                          )}
                          {sectionId === 'hardSkills' && (
                            <div>
                              <p className='mb-3'>
                                Les compétences techniques vous permettent
                                d'exercer des fonctions et responsabilités
                                spécifiques au poste. Vous pouvez acquérir ces
                                compétences en formation, cours ou sur le
                                terrain. Ces compétences se concentrent sur des
                                tâches enseignables et des capacités mesurables
                                comme l'utilisation d'outils, équipements ou
                                logiciels. Les compétences techniques ont un
                                impact élevé sur votre score de compatibilité.
                              </p>
                              <p>
                                <strong>Conseil :</strong> Faites correspondre
                                les compétences de votre CV à l'orthographe
                                exacte de l'offre d'emploi. Priorisez les
                                compétences qui apparaissent le plus fréquemment
                                dans la description du poste.
                              </p>
                            </div>
                          )}
                          {sectionId === 'softSkills' && (
                            <div>
                              <p className='mb-3'>
                                Les compétences comportementales sont vos traits
                                et capacités qui ne sont pas spécifiques à un
                                emploi particulier. Ces compétences font partie
                                de votre personnalité et peuvent également être
                                développées. Ce sont les qualités qui font
                                généralement de vous un bon employé pour toute
                                entreprise, comme la gestion du temps et la
                                communication. Les compétences comportementales
                                ont un impact moyen sur votre score de
                                compatibilité.
                              </p>
                              <p>
                                <strong>Conseil :</strong> Priorisez les
                                compétences techniques dans votre CV pour
                                obtenir des entretiens, puis mettez en valeur
                                vos compétences comportementales lors de
                                l'entretien pour décrocher le poste.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Searchability Section */}
                        {sectionId === 'searchability' &&
                          'issues' in section && (
                            <div className='space-y-4'>
                              {(section.issues as SearchabilityIssue[]).map(
                                (issue, index) => (
                                  <div
                                    key={index}
                                    className='flex items-start gap-3 p-4 border border-gray-200 rounded-lg'
                                  >
                                    {getStatusIcon(issue.status)}
                                    <div className='flex-1'>
                                      <h4 className='font-medium text-gray-900'>
                                        {issue.title}
                                      </h4>
                                      <p className='text-sm text-gray-600 mb-2'>
                                        {issue.description}
                                      </p>
                                      <p className='text-sm font-medium text-blue-600'>
                                        {issue.suggestion}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* Skills Sections */}
                        {(sectionId === 'hardSkills' ||
                          sectionId === 'softSkills') &&
                          'comparison' in section && (
                            <div className='space-y-6'>
                              {/* Skills Tabs */}
                              <div className='flex border-b border-gray-200'>
                                <button
                                  onClick={() =>
                                    setActiveSkillsTab((prev) => ({
                                      ...prev,
                                      [sectionId]: 'comparison',
                                    }))
                                  }
                                  className={`px-4 py-2 text-sm font-medium ${
                                    activeSkillsTab[sectionId] === 'comparison'
                                      ? 'text-blue-600 border-b-2 border-blue-600'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  Comparaison Compétences
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveSkillsTab((prev) => ({
                                      ...prev,
                                      [sectionId]: 'highlighted',
                                    }))
                                  }
                                  className={`px-4 py-2 text-sm font-medium ${
                                    activeSkillsTab[sectionId] === 'highlighted'
                                      ? 'text-blue-600 border-b-2 border-blue-600'
                                      : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  Compétences Surlignées
                                </button>
                              </div>

                              {/* Tab Content */}
                              {activeSkillsTab[sectionId] === 'comparison' ? (
                                <>
                                  {/* Missing Skills Cloud */}
                                  <div className='p-6 bg-red-50 rounded-lg'>
                                    <h4 className='mb-3 font-medium text-red-900'>
                                      Compétences Manquantes de l'Offre d'Emploi
                                    </h4>
                                    <div className='flex flex-wrap gap-2'>
                                      {(section.comparison as SkillComparison[])
                                        .filter(
                                          (skill) =>
                                            skill.inJob && !skill.inResume
                                        )
                                        .slice(0, 8)
                                        .map((skill, index) => (
                                          <span
                                            key={index}
                                            className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full'
                                          >
                                            {skill.skill}
                                          </span>
                                        ))}
                                    </div>
                                  </div>

                                  {/* Skills Comparison Table */}
                                  <div className='overflow-hidden border border-gray-200 rounded-lg'>
                                    <div className='grid grid-cols-3 gap-0 bg-gray-50'>
                                      <div className='p-3 font-medium text-gray-900 flex items-center gap-2'>
                                        Compétence
                                        <button className='text-xs text-blue-600 flex items-center gap-1'>
                                          <svg
                                            className='w-3 h-3'
                                            fill='currentColor'
                                            viewBox='0 0 20 20'
                                          >
                                            <path d='M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z'></path>
                                          </svg>
                                          Tout Copier
                                        </button>
                                      </div>
                                      <div className='p-3 font-medium text-center text-gray-900'>
                                        Mon CV
                                      </div>
                                      <div className='p-3 font-medium text-center text-gray-900'>
                                        Offre d'Emploi
                                      </div>
                                    </div>
                                    {(section.comparison as SkillComparison[])
                                      .slice(0, 15)
                                      .map((skill, index) => (
                                        <div
                                          key={index}
                                          className='grid grid-cols-3 gap-0 border-t border-gray-200 hover:bg-gray-50'
                                        >
                                          <div className='p-3 flex items-center justify-between'>
                                            <span
                                              className={`${
                                                skill.importance === 'high'
                                                  ? 'font-medium'
                                                  : ''
                                              }`}
                                            >
                                              {skill.skill}
                                            </span>
                                            <div className='flex gap-1'>
                                              <button className='text-xs text-blue-600'>
                                                <svg
                                                  className='w-3 h-3'
                                                  fill='currentColor'
                                                  viewBox='0 0 20 20'
                                                >
                                                  <path d='M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z'></path>
                                                </svg>
                                              </button>
                                              <button className='text-xs text-red-600'>
                                                <svg
                                                  className='w-3 h-3'
                                                  fill='currentColor'
                                                  viewBox='0 0 20 20'
                                                >
                                                  <path
                                                    fillRule='evenodd'
                                                    d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                                                    clipRule='evenodd'
                                                  ></path>
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                          <div className='flex justify-center items-center p-3'>
                                            {skill.inResume ? (
                                              <Check className='w-4 h-4 text-green-500' />
                                            ) : (
                                              <X className='w-4 h-4 text-red-500' />
                                            )}
                                          </div>
                                          <div className='flex justify-center items-center p-3'>
                                            <span
                                              className={`${
                                                skill.frequency > 2
                                                  ? 'font-medium text-blue-600'
                                                  : ''
                                              }`}
                                            >
                                              {skill.inJob
                                                ? skill.frequency
                                                : 0}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* Highlighted Skills View */}
                                  <div className='space-y-6'>
                                    {/* Skills Word Cloud */}
                                    <div>
                                      <h4 className='mb-3 font-medium text-gray-900'>
                                        Compétences Clés de l'Offre d'Emploi
                                      </h4>
                                      <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100'>
                                        <div className='flex flex-wrap gap-3 items-center justify-center'>
                                          {(
                                            section.comparison as SkillComparison[]
                                          )
                                            .filter((skill) => skill.inJob)
                                            .sort(
                                              (a, b) =>
                                                b.frequency - a.frequency
                                            )
                                            .slice(0, 15)
                                            .map((skill, index) => {
                                              const isMatched = skill.inResume;
                                              const frequency = skill.frequency;

                                              // Dynamic sizing based on frequency
                                              let sizeClass =
                                                'text-sm px-3 py-1';
                                              let colorClass =
                                                'bg-gray-200 text-gray-700';

                                              if (frequency >= 4) {
                                                sizeClass =
                                                  'text-2xl px-6 py-3 font-bold';
                                                colorClass = isMatched
                                                  ? 'bg-green-200 text-green-900'
                                                  : 'bg-red-200 text-red-900';
                                              } else if (frequency >= 3) {
                                                sizeClass =
                                                  'text-xl px-5 py-2 font-semibold';
                                                colorClass = isMatched
                                                  ? 'bg-green-150 text-green-800'
                                                  : 'bg-red-150 text-red-800';
                                              } else if (frequency >= 2) {
                                                sizeClass =
                                                  'text-lg px-4 py-2 font-medium';
                                                colorClass = isMatched
                                                  ? 'bg-yellow-200 text-yellow-800'
                                                  : 'bg-orange-200 text-orange-800';
                                              } else {
                                                sizeClass = 'text-sm px-3 py-1';
                                                colorClass = isMatched
                                                  ? 'bg-blue-100 text-blue-700'
                                                  : 'bg-gray-200 text-gray-600';
                                              }

                                              return (
                                                <motion.span
                                                  key={index}
                                                  initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                  }}
                                                  transition={{
                                                    delay: index * 0.1,
                                                  }}
                                                  className={`
                                                ${sizeClass} ${colorClass} 
                                                rounded-full cursor-pointer transition-all duration-300 
                                                hover:scale-110 hover:shadow-lg relative
                                                ${
                                                  skill.importance === 'high'
                                                    ? 'ring-2 ring-blue-400'
                                                    : ''
                                                }
                                              `}
                                                  title={`Fréquence: ${frequency} fois | ${
                                                    isMatched
                                                      ? 'Trouvé dans le CV'
                                                      : 'Manquant du CV'
                                                  } | Importance: ${
                                                    skill.importance
                                                  }`}
                                                >
                                                  {skill.skill}
                                                  {skill.importance ===
                                                    'high' && (
                                                    <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold'>
                                                      !
                                                    </span>
                                                  )}
                                                </motion.span>
                                              );
                                            })}
                                        </div>

                                        {/* Word Cloud Legend */}
                                        <div className='mt-4 pt-4 border-t border-blue-200'>
                                          <div className='flex flex-wrap gap-4 text-xs text-gray-600'>
                                            <div className='flex items-center gap-1'>
                                              <div className='w-3 h-3 bg-green-200 rounded-full'></div>
                                              <span>Trouvé dans le CV</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                              <div className='w-3 h-3 bg-red-200 rounded-full'></div>
                                              <span>Manquant du CV</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                              <div className='w-3 h-3 bg-blue-400 rounded-full ring-1 ring-blue-400'></div>
                                              <span>Haute Importance</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                              <span className='text-lg font-bold'>
                                                Aa
                                              </span>
                                              <span>Taille = Fréquence</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Side by Side Comparison */}
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                      {/* Resume Column */}
                                      <div>
                                        <div className='mb-3 flex items-center justify-between'>
                                          <h4 className='font-medium text-gray-900'>
                                            Mon CV :
                                          </h4>
                                          <span className='text-sm text-gray-600'>
                                            {
                                              (
                                                section.comparison as SkillComparison[]
                                              ).filter((s) => s.inResume).length
                                            }{' '}
                                            compétences trouvées
                                          </span>
                                        </div>
                                        <div className='p-4 bg-white border rounded-lg max-h-80 overflow-y-auto'>
                                          <div
                                            className='text-sm text-gray-700 leading-relaxed'
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                highlightSkillsInText(
                                                  cvData?.raw_text.substring(
                                                    0,
                                                    1200
                                                  ) || '',
                                                  (
                                                    section.comparison as SkillComparison[]
                                                  ).filter((s) => s.inResume)
                                                ) + '...',
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {/* Job Description Column */}
                                      <div>
                                        <div className='mb-3 flex items-center justify-between'>
                                          <h4 className='font-medium text-gray-900'>
                                            Offre d'Emploi :
                                          </h4>
                                          <span className='text-sm text-gray-600'>
                                            {
                                              (
                                                section.comparison as SkillComparison[]
                                              ).filter((s) => s.inJob).length
                                            }{' '}
                                            compétences requises
                                          </span>
                                        </div>
                                        <div className='p-4 bg-white border rounded-lg max-h-80 overflow-y-auto'>
                                          <div
                                            className='text-sm text-gray-700 leading-relaxed'
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                highlightSkillsInText(
                                                  jobData?.description.substring(
                                                    0,
                                                    1200
                                                  ) || '',
                                                  (
                                                    section.comparison as SkillComparison[]
                                                  ).filter((s) => s.inJob)
                                                ) + '...',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Skills Legend */}
                                    <div className='space-y-3'>
                                      <h4 className='font-medium text-gray-900'>
                                        Légende du Surlignage :
                                      </h4>
                                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border'>
                                        <div className='flex items-center gap-3'>
                                          <span className='px-2 py-1 bg-green-200 text-green-900 rounded font-medium text-sm'>
                                            React
                                          </span>
                                          <span className='text-sm text-gray-700'>
                                            <strong>
                                              Compétence Correspondante :
                                            </strong>{' '}
                                            Trouvée dans le CV et l'offre
                                            d'emploi
                                          </span>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                          <span className='px-2 py-1 bg-yellow-200 text-yellow-800 rounded font-medium text-sm'>
                                            Python
                                          </span>
                                          <span className='text-sm text-gray-700'>
                                            <strong>
                                              Variante de Compétence :
                                            </strong>{' '}
                                            Trouvée dans le CV, pas dans l'offre
                                          </span>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                          <span className='px-2 py-1 bg-red-200 text-red-900 rounded font-medium text-sm'>
                                            Docker
                                          </span>
                                          <span className='text-sm text-gray-700'>
                                            <strong>
                                              Compétence Manquante :
                                            </strong>{' '}
                                            Requise dans l'offre, absente du CV
                                          </span>
                                        </div>
                                      </div>

                                      <div className='text-xs text-gray-500 bg-blue-50 p-3 rounded border-l-4 border-blue-200'>
                                        💡 <strong>Conseil :</strong> Survolez
                                        les compétences surlignées dans le texte
                                        ci-dessus pour voir des informations
                                        détaillées sur la fréquence et
                                        l'importance.
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Add Custom Skills */}
                              <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                                <span className='text-sm font-medium text-gray-700'>
                                  Vous ne voyez pas de compétences de l'offre
                                  d'emploi ?
                                </span>
                                <Button variant='outline' size='sm'>
                                  <svg
                                    className='w-4 h-4 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                  >
                                    <path
                                      fillRule='evenodd'
                                      d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                                      clipRule='evenodd'
                                    ></path>
                                  </svg>
                                  Ajouter Compétence
                                </Button>
                              </div>
                            </div>
                          )}

                        {/* Recruiter Tips Section */}
                        {sectionId === 'recruiterTips' && 'tips' in section && (
                          <div className='space-y-4'>
                            {(section.tips as RecruiterTip[]).map(
                              (tip, index) => (
                                <div
                                  key={index}
                                  className='flex items-start gap-3 p-4 border border-gray-200 rounded-lg'
                                >
                                  {getStatusIcon(tip.status)}
                                  <div className='flex-1'>
                                    <h4 className='font-medium text-gray-900'>
                                      {tip.title}
                                    </h4>
                                    <p className='text-sm text-gray-600 mb-2'>
                                      {tip.description}
                                    </p>
                                    <p className='text-sm font-medium text-blue-600'>
                                      {tip.suggestion}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Formatting Section */}
                        {sectionId === 'formatting' && 'layout' in section && (
                          <div className='space-y-4'>
                            <div className='p-4 border border-gray-200 rounded-lg'>
                              <h4 className='font-medium text-gray-900 mb-2'>
                                Mise en Page
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {section.layout.message}
                              </p>
                            </div>
                            <div className='p-4 border border-gray-200 rounded-lg'>
                              <h4 className='font-medium text-gray-900 mb-2'>
                                Vérification Police
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {section.fontCheck.message}
                              </p>
                            </div>
                            <div className='p-4 border border-gray-200 rounded-lg'>
                              <h4 className='font-medium text-gray-900 mb-2'>
                                Configuration Page
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {section.pageSetup.message}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </>
          ) : (
            <>
              {/* Job Description View */}
              <Card className='border-0 shadow-lg bg-white/90 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Analyse de l'Offre d'Emploi
                    </h2>
                  </div>

                  {/* Job Details */}
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-lg font-medium text-gray-900 mb-3'>
                        Poste : {jobData?.title}
                      </h3>
                      {jobData?.company && (
                        <p className='text-gray-600 mb-3'>
                          Entreprise : {jobData.company}
                        </p>
                      )}
                    </div>

                    {/* Full Job Description */}
                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Description Complète du Poste
                      </h4>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <pre className='whitespace-pre-wrap text-sm text-gray-700 font-sans'>
                          {jobData?.description}
                        </pre>
                      </div>
                    </div>

                    {/* Extracted Keywords */}
                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Exigences Clés
                      </h4>
                      <div className='flex flex-wrap gap-2 mb-4'>
                        {jobData?.extractedKeywords
                          .slice(0, 20)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full'
                            >
                              {keyword}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Parsed Requirements */}
                    {jobData?.parsed && (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <h4 className='font-medium text-gray-900 mb-3'>
                            Qualifications Requises
                          </h4>
                          <ul className='space-y-2'>
                            {jobData.parsed.qualifications.required.map(
                              (req, index) => (
                                <li
                                  key={index}
                                  className='flex items-start gap-2 text-sm text-gray-700'
                                >
                                  <span className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></span>
                                  {req}
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className='font-medium text-gray-900 mb-3'>
                            Qualifications Souhaitées
                          </h4>
                          <ul className='space-y-2'>
                            {jobData.parsed.qualifications.preferred.map(
                              (pref, index) => (
                                <li
                                  key={index}
                                  className='flex items-start gap-2 text-sm text-gray-700'
                                >
                                  <span className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></span>
                                  {pref}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Key Skills Highlighted */}
                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Compétences Clés Requises
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {jobData?.parsed?.skills.map((skill, index) => (
                          <span
                            key={index}
                            className='px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience Required */}
                    {jobData?.parsed?.experience_required && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-3'>
                          Expérience Requise
                        </h4>
                        <p className='text-gray-700 bg-purple-50 p-3 rounded-lg'>
                          {jobData.parsed.experience_required}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
