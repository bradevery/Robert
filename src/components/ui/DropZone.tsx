'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Axe,
  Check,
  Edit3,
  FileText,
  Link,
  Search,
  UploadCloudIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

import { useCVMatcher } from '@/hooks/useCVMatcher';

import { Button } from '@/components/ui/button';

interface DropZoneProps {
  onFileUpload?: (file: File) => void;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFileUpload,
  className = '',
}) => {
  const router = useRouter();
  const {
    state,
    uploadProgress,
    isLoading,
    parseCVFromFile,
    parseCVFromLinkedIn,
    parseJobDescription,
    updateCVData,
    clearError,
  } = useCVMatcher();

  const [isTextMode, setIsTextMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cvText, setCvText] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isLinkedInMode, setIsLinkedInMode] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isJobLinkedInMode, setIsJobLinkedInMode] = useState(false);
  const [jobLinkedInUrl, setJobLinkedInUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Étapes d'animation avec leurs icônes et labels
  const animationSteps = [
    {
      icon: Axe,
      label: 'Extraction des textes',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: Search,
      label: 'Analyse',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Check,
      label: 'Finalisation',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  // Effet pour progression séquentielle des étapes
  React.useEffect(() => {
    if (uploadProgress && !hasStarted) {
      setHasStarted(true);
      setCurrentStep(0); // Commencer par Extraction des textes

      // Passer à Analyse après 2.5 secondes
      const timer1 = setTimeout(() => {
        setCurrentStep(1);
      }, 2500);

      // Passer à Finalisation après 5 secondes ou quand le processus est terminé
      const timer2 = setTimeout(() => {
        setCurrentStep(2);
      }, 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (!uploadProgress) {
      setCurrentStep(0);
      setHasStarted(false);
    }
  }, [uploadProgress, hasStarted]);

  // Vérifier si le processus est terminé pour passer directement à Finalisation
  React.useEffect(() => {
    if (uploadProgress) {
      const isComplete =
        uploadProgress.progress >= 95 ||
        uploadProgress.stage?.toLowerCase().includes('finalisation') ||
        uploadProgress.stage?.toLowerCase().includes('terminé') ||
        uploadProgress.stage?.toLowerCase().includes('complete');
      if (isComplete && currentStep < 2) {
        setCurrentStep(2);
      }
    }
  }, [uploadProgress, currentStep]);

  const handleDragEnter = (e: React.DragEvent) => {
    if (isTextMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isTextMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isTextMode) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isTextMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.includes('document')) {
        handleFileUpload(file);
      }
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux. Taille maximale autorisée : 5MB.';
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Format de fichier non supporté. Veuillez utiliser un fichier PDF, DOC ou DOCX.';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setFileError('');
    clearError();

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setUploadedFile(file);

    // Utiliser l'API Hrflow pour parser le CV
    const cvData = await parseCVFromFile(file);
    if (cvData) {
      setShowJobDescription(true);
    } else if (state.error) {
      setFileError(state.error);
    }

    if (onFileUpload) {
      onFileUpload(file);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string): string => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'Word';
    return 'Fichier';
  };

  const handleAnalyzeCV = async () => {
    setFileError('');
    clearError();

    if (isLinkedInMode) {
      // Importer depuis LinkedIn
      if (!linkedInUrl.trim() || !linkedInUrl.includes('linkedin.com')) {
        setFileError('Veuillez entrer une URL LinkedIn valide');
        return;
      }

      const cvData = await parseCVFromLinkedIn(linkedInUrl);
      if (cvData) {
        setShowJobDescription(true);
      } else if (state.error) {
        setFileError(state.error);
      }
    } else if (isTextMode) {
      // Mode texte - créer un CV à partir du texte
      if (cvText.trim().length < 500) {
        setFileError('Votre CV doit contenir au moins 500 caractères');
        return;
      }

      // Créer un CVData à partir du texte
      const cvData = {
        id: `text_${Date.now()}`,
        name: 'CV depuis texte',
        source: 'text' as const,
        content: {
          personalInfo: {
            fullName: 'Utilisateur',
            firstName: '',
            lastName: '',
          },
          experiences: [],
          education: [],
          skills: [],
          summary: cvText,
          extractedKeywords: [],
        },
        raw_text: cvText,
        processed_at: new Date().toISOString(),
      };

      updateCVData(cvData);
      setShowJobDescription(true);
    } else {
      // Mode fichier - juste passer à l'étape suivante
      setShowJobDescription(true);
    }
  };

  const validateLinkedInJobUrl = (url: string): boolean => {
    const linkedInJobRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+\/?.*$/;
    return linkedInJobRegex.test(url);
  };

  const _handleJobLinkedInImport = async () => {
    if (!jobLinkedInUrl.trim()) {
      setFileError("Veuillez entrer une URL d'offre LinkedIn valide.");
      return;
    }

    if (!validateLinkedInJobUrl(jobLinkedInUrl)) {
      setFileError(
        "Format d'URL d'offre LinkedIn invalide. Exemple: https://linkedin.com/jobs/view/123456789"
      );
      return;
    }

    setFileError('');
    clearError();

    // Pour l'instant, on utilise l'URL comme description de base
    // En production, vous pourriez parser l'URL LinkedIn
    const jobText = `Offre d'emploi LinkedIn: ${jobLinkedInUrl}\n\nVeuillez copier-coller le contenu complet de l'offre ci-dessous pour une meilleure analyse.`;
    setJobDescription(jobText);
  };

  const handleOptimizeCV = async () => {
    console.log('🚀 Starting CV optimization process');
    console.log('📊 Current state:', {
      cvData: state.cvData,
      jobDescription: jobDescription.trim().length,
    });

    if (!state.cvData || !jobDescription.trim()) {
      const errorMsg = "CV et description du poste requis pour l'optimisation";
      console.error('❌ Validation failed:', errorMsg);
      setFileError(errorMsg);
      return;
    }

    setFileError('');
    clearError();

    try {
      console.log('🔄 Parsing job description...');
      // Parser la description du poste
      const jobData = await parseJobDescription(jobDescription);
      if (!jobData) {
        const errorMsg =
          state.error || "Erreur lors de l'analyse de l'offre d'emploi";
        console.error('❌ Job parsing failed:', errorMsg);
        setFileError(errorMsg);
        return;
      }
      console.log('✅ Job description parsed successfully');

      console.log('🔄 Calling matching analysis API...');
      // Utiliser le nouveau système de matching avancé avec embeddings
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      const matchingResponse = await fetch('/api/matching/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: state.cvData,
          jobDescription: jobDescription,
          analysisType: 'complete',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Matching API response status:', matchingResponse.status);

      if (!matchingResponse.ok) {
        const errorText = await matchingResponse.text();
        console.error(
          '❌ Matching API failed:',
          matchingResponse.status,
          errorText
        );
        throw new Error(`API Error: ${matchingResponse.status} - ${errorText}`);
      }

      const matchingResult = await matchingResponse.json();
      console.log('📊 Matching result:', matchingResult);

      if (!matchingResult.success) {
        console.error('❌ Matching analysis failed:', matchingResult.message);
        throw new Error(matchingResult.message);
      }

      console.log('🔄 Calling CV generation API...');
      // Générer aussi le CV optimisé avec l'ancien système comme fallback
      const optimizeResponse = await fetch('/api/cv/generate-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: state.cvData,
          jobData: jobData,
        }),
      });

      console.log(
        '📡 CV generation API response status:',
        optimizeResponse.status
      );

      let optimizeResult = null;
      if (optimizeResponse.ok) {
        optimizeResult = await optimizeResponse.json();
        console.log('📄 CV generation result:', optimizeResult);
      } else {
        console.warn(
          '⚠️ CV generation API failed, continuing without optimized CV'
        );
      }

      console.log('💾 Storing data in localStorage...');
      // Stocker les données dans le localStorage pour le builder
      const dataToStore = {
        cvData: state.cvData,
        jobData: jobData,
        matchingAnalysis: matchingResult.data, // Nouveau système de matching
        optimizedCV: optimizeResult?.success ? optimizeResult.data : null, // Ancien système comme fallback
        timestamp: Date.now(),
      };

      localStorage.setItem('cv-builder-data', JSON.stringify(dataToStore));
      console.log('✅ Data stored successfully');

      console.log('🚀 Navigating to CV builder...');
      // Rediriger vers le builder EnhanceCV
      router.push('/cv-builder-enhancecv');
      console.log('✅ Navigation initiated');
    } catch (error) {
      console.error('❌ Error in CV optimization:', error);
      let errorMessage = "Erreur lors de l'optimisation du CV";

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'La requête a expiré. Veuillez réessayer.';
        } else {
          errorMessage = error.message;
        }
      }

      setFileError(errorMessage);
    }
  };

  // Afficher les progrès d'upload si en cours
  if (uploadProgress) {
    return (
      <div className={`w-full ${className}`}>
        <div className='p-8 transition-all duration-200 bg-white border border-gray-200 border-solid shadow-lg rounded-2xl'>
          <div className='text-center'>
            <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <UploadCloudIcon className='w-8 h-8 text-blue-600' />
              </motion.div>
            </div>

            <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
              {uploadProgress.message}
            </h3>
            <p className='mb-6 text-gray-600'>Analyse en cours avec l'IA...</p>

            <div className='flex items-center justify-center mb-6'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8, y: 15 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      duration: 0.8,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    y: -15,
                    transition: {
                      duration: 0.5,
                      ease: 'easeInOut',
                    },
                  }}
                  className='flex flex-col items-center gap-3'
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${animationSteps[currentStep].color}`}
                  >
                    <motion.div
                      initial={{ y: 0, scale: 1, rotate: 0 }}
                      animate={
                        currentStep === 0
                          ? {
                              // Animation de creusement pour la hache
                              y: [0, -8, 6, -4, 2, 0],
                              rotate: [0, -15, 15, -10, 5, 0],
                              scale: [1, 1.2, 1.1, 1.15, 1.05, 1],
                            }
                          : {
                              // Animation bounce normale pour les autres
                              y: [0, -12, 0],
                              scale: [1, 1.25, 1],
                              rotate: 0,
                            }
                      }
                      transition={{
                        duration: currentStep === 0 ? 1.2 : 0.8,
                        ease: currentStep === 0 ? 'easeInOut' : 'easeInOut',
                        delay: 0.4,
                      }}
                    >
                      {React.createElement(animationSteps[currentStep].icon, {
                        className: `w-8 h-8 ${animationSteps[currentStep].iconColor}`,
                      })}
                    </motion.div>
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    {animationSteps[currentStep].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className='text-sm text-gray-500'>{uploadProgress.stage}</div>
          </div>
        </div>
      </div>
    );
  }

  if (showJobDescription && state.cvData) {
    return (
      <div className={`w-full ${className}`}>
        <div className='p-8 transition-all duration-200 bg-white border border-gray-200 border-solid shadow-lg rounded-2xl'>
          <div className='text-center'>
            <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full'>
              <svg
                className='w-8 h-8 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>

            <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
              CV analysé avec succès !
            </h3>
            <p className='mb-8 text-gray-600'>
              {!isJobLinkedInMode
                ? 'Maintenant, ajoutez la description du poste pour personnaliser votre CV'
                : "Importez directement une offre d'emploi depuis LinkedIn"}
            </p>

            <div className='w-full max-w-4xl mx-auto'>
              <div className='mb-6 text-left'>
                <label className='block mb-2 text-sm font-medium text-gray-700'>
                  Description du poste ou offre d'emploi
                </label>

                {/* Job Format Toggle Switch */}
                <div className='mb-4'>
                  <div className='inline-flex items-center p-1 bg-gray-100 rounded-lg'>
                    <button
                      onClick={() => setIsJobLinkedInMode(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                        !isJobLinkedInMode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className='w-4 h-4' />
                      Texte
                    </button>
                    <button
                      onClick={() => setIsJobLinkedInMode(true)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                        isJobLinkedInMode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Link className='w-4 h-4' />
                      LinkedIn
                    </button>
                  </div>
                </div>

                <div className='relative'>
                  {!isJobLinkedInMode ? (
                    <>
                      <textarea
                        placeholder='Copiez et collez ici la description complète du poste, les compétences requises, les responsabilités, etc. Plus vous ajoutez de détails, plus votre CV sera personnalisé et optimisé pour ce poste spécifique.'
                        className='w-full h-56 p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      <div className='absolute text-xs text-gray-500 bottom-2 right-2'>
                        {jobDescription.trim().length} caractères
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='space-y-4 '>
                        <div className='relative'>
                          <input
                            type='url'
                            placeholder='https://linkedin.com/jobs/view/123456789)'
                            className='w-full p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={jobLinkedInUrl}
                            onChange={(e) => setJobLinkedInUrl(e.target.value)}
                          />
                          <div className='absolute inset-y-0 right-0 flex items-center pr-4'>
                            <svg
                              className='w-5 h-5 text-blue-600'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                            >
                              <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                            </svg>
                          </div>
                        </div>

                        <div className='flex '></div>
                      </div>
                      {jobDescription && (
                        <div className='p-4 mt-4 border border-green-200 rounded-lg bg-green-50'>
                          <h4 className='mb-2 font-medium text-green-800'>
                            Offre importée :
                          </h4>
                          <div className='overflow-y-auto text-sm text-green-700 max-h-32'>
                            {jobDescription.substring(0, 200)}...
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    setShowJobDescription(false);
                    setJobDescription('');
                  }}
                  className='font-medium'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Revenir en arrière
                </Button>
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
                  disabled={jobDescription.trim().length < 50}
                  onClick={handleOptimizeCV}
                >
                  Générer mon CV optimisé
                </Button>
              </div>

              {jobDescription.trim().length > 0 &&
                jobDescription.trim().length < 50 && (
                  <p className='mt-3 text-sm text-center text-gray-500'>
                    Ajoutez au moins 50 caractères pour une meilleure
                    optimisation
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le chargement si en cours
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className='p-8 transition-all duration-200 bg-white border border-gray-200 border-solid shadow-lg rounded-2xl'>
          <div className='text-center'>
            <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Search className='w-8 h-8 text-blue-600' />
              </motion.div>
            </div>

            <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
              Traitement en cours...
            </h3>
            <p className='mb-6 text-gray-600'>
              Analyse et traitement de vos données avec l'IA
            </p>

            <div className='w-full max-w-md mx-auto'>
              <div className='w-full h-3 bg-gray-200 rounded-full'>
                <motion.div
                  className='h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600'
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          p-8 transition-all duration-200 bg-white shadow-lg rounded-2xl
          ${
            !isTextMode && !uploadedFile
              ? 'cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400'
              : 'border border-solid border-gray-200'
          } 
          ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : ''}
        `}
        onDragEnter={!isTextMode && !uploadedFile ? handleDragEnter : undefined}
        onDragOver={!isTextMode && !uploadedFile ? handleDragOver : undefined}
        onDragLeave={!isTextMode && !uploadedFile ? handleDragLeave : undefined}
        onDrop={!isTextMode && !uploadedFile ? handleDrop : undefined}
        onClick={!isTextMode && !uploadedFile ? handleFileSelect : undefined}
      >
        <div className='text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full'>
            <svg
              className='w-8 h-8 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
          </div>

          <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
            Glissez-déposez votre CV ici
          </h3>
          <p className='mb-6 text-gray-600'>
            {isLinkedInMode
              ? 'Importez votre CV directement depuis votre profil LinkedIn'
              : !isTextMode
              ? 'Formats acceptés: PDF, DOC, DOCX (max 5MB)'
              : 'Copiez et collez le contenu de votre CV dans le champ ci-dessous'}
          </p>

          <div className='mb-6'>
            <div className='inline-flex items-center p-1 bg-gray-100 rounded-lg'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTextMode(false);
                  setIsLinkedInMode(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  !isTextMode && !isLinkedInMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UploadCloudIcon className='w-4 h-4' />
                Fichier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTextMode(true);
                  setIsLinkedInMode(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  isTextMode && !isLinkedInMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className='w-4 h-4' />
                Texte
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTextMode(false);
                  setIsLinkedInMode(true);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                  isLinkedInMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Link className='w-4 h-4' />
                LinkedIn
              </button>
            </div>
          </div>

          <div className='flex flex-col items-center justify-center w-full gap-4'>
            {isLinkedInMode ? (
              <div className='w-full max-w-2xl'>
                <div className='relative'>
                  <input
                    type='url'
                    placeholder='https://linkedin.com/in/votreprofil'
                    className='w-full p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-4'>
                    <svg
                      className='w-5 h-5 text-blue-600'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                    </svg>
                  </div>
                </div>
                <div className='flex justify-center mt-4'>
                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
                    disabled={
                      !linkedInUrl.trim() ||
                      !linkedInUrl.includes('linkedin.com')
                    }
                    onClick={handleAnalyzeCV}
                  >
                    <Link className='w-5 h-5 mr-2' />
                    Importer depuis LinkedIn
                  </Button>
                </div>
                {linkedInUrl.trim() &&
                  !linkedInUrl.includes('linkedin.com') && (
                    <p className='mt-3 text-sm text-center text-red-500'>
                      Veuillez entrer une URL LinkedIn valide
                    </p>
                  )}
              </div>
            ) : !isTextMode ? (
              <>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={handleFileChange}
                  className='hidden'
                />
                {uploadedFile ? (
                  <div className='relative w-full max-w-2xl p-6 border border-green-200 rounded-lg bg-green-50'>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setCvText('');
                        handleFileSelect();
                      }}
                      className='absolute p-2 text-green-600 transition-all duration-200 bg-white border border-green-200 rounded-full shadow-sm top-3 right-3 hover:bg-green-100 hover:scale-110'
                    >
                      <Edit3 className='w-4 h-4' />
                    </button>
                    <div className='flex items-center gap-4'>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-green-900'>
                          Fichier téléchargé avec succès
                        </h4>
                        <p className='text-sm text-green-700'>
                          {uploadedFile.name}
                        </p>
                        <div className='flex items-center justify-center gap-4 mt-1 text-xs text-green-600'>
                          <span>{getFileTypeLabel(uploadedFile.type)}</span>
                          <span>{formatFileSize(uploadedFile.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-center mt-4'>
                      <Button
                        size='lg'
                        className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
                        onClick={handleAnalyzeCV}
                      >
                        Analyser mon CV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
                    onClick={handleFileSelect}
                  >
                    <UploadCloudIcon className='w-5 h-5 mr-2' />
                    Parcourir mes fichiers
                  </Button>
                )}
              </>
            ) : (
              <div className='w-full max-w-2xl'>
                <div className='relative'>
                  <textarea
                    placeholder='Collez ici le contenu de votre CV (texte brut)...'
                    className='w-full h-40 p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                  />
                  <div className='absolute text-xs text-gray-500 bottom-2 right-2'>
                    {cvText.trim().length}/500 min
                  </div>
                </div>
                <div className='flex justify-center mt-4'>
                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] hover:from-[#11689e] hover:to-[#174ca3] font-bold'
                    disabled={cvText.trim().length < 500}
                    onClick={handleAnalyzeCV}
                  >
                    Analyser mon CV
                  </Button>
                </div>
              </div>
            )}

            {(fileError || state.error) && (
              <div className='w-full max-w-2xl p-3 mt-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50'>
                <svg
                  className='inline-block w-4 h-4 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                {fileError || state.error}
              </div>
            )}
          </div>

          <div className='mt-6 space-y-2'>
            <div className='flex items-center justify-center gap-6 text-xs text-gray-600'>
              <span className='flex items-center gap-1'>
                ✨ Amélioration instantanée par l'IA
              </span>
              <span className='flex items-center gap-1'>
                🎯 Optimisé pour les logiciels ATS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
