'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  LinkIcon,
  UploadCloudIcon,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// import { Button } from 'Reactive-Resume/libs/ui/src';
import { useHeader } from '@/contexts/HeaderContext';

export default function DropZoneSection() {
  const [isTextMode, setIsTextMode] = useState(false);
  const [isLinkedInMode, setIsLinkedInMode] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isJobLinkedInMode, setIsJobLinkedInMode] = useState(false);
  const [jobLinkedInUrl, setJobLinkedInUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [cvText, setCvText] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { hideHeader, showHeader } = useHeader();

  // Désactiver le scroll quand un modal est ouvert
  useEffect(() => {
    if (previewTemplate || showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurer le scroll quand le composant est démonté
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewTemplate, showLoginModal]);

  // Gestion du scroll horizontal sur le carrousel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        carouselRef.current &&
        carouselRef.current.contains(e.target as Node)
      ) {
        e.preventDefault();
        // Multiplier par 8 pour plus de sensibilité et fluidité
        const scrollAmount = e.deltaY * 8;
        carouselRef.current.scrollLeft += scrollAmount;
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Fonction pour naviguer vers une étape
  const navigateToStep = (stepNumber: number) => {
    // On peut seulement naviguer vers des étapes déjà complétées ou l'étape courante
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  // Fonction pour marquer une étape comme complétée et passer à la suivante
  const completeStepAndAdvance = (stepNumber: number, nextStep: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps((prev) => [...prev, stepNumber]);
    }
    setCurrentStep(nextStep);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('templates-carousel-step3');
    if (carousel) {
      const scrollAmount = 260; // Width of one template card + gap (220 + 40 gap)
      const newScrollLeft =
        direction === 'left'
          ? carousel.scrollLeft - scrollAmount
          : carousel.scrollLeft + scrollAmount;

      carousel.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const templates = [
    {
      id: 'modern',
      title: 'Modern',
      description: 'Design épuré et professionnel',
      badge: { text: 'Populaire', className: 'text-blue-800 bg-blue-100' },
      hoverColor: 'bg-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
      blueEffect: 'shadow-blue-200/50 ring-1 ring-blue-100/50',
    },
    {
      id: 'classic',
      title: 'Classic',
      description: 'Traditionnel et intemporel',
      hoverColor: 'bg-gray-600',
      bgGradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50',
      blueEffect: 'shadow-slate-200/50 ring-1 ring-blue-100/30',
    },
    {
      id: 'creative',
      title: 'Creative',
      description: 'Pour les profils créatifs',
      badge: { text: 'Nouveau', className: 'text-purple-800 bg-purple-100' },
      hoverColor: 'bg-purple-600',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      blueEffect: 'shadow-purple-200/50 ring-1 ring-blue-100/40',
    },
    {
      id: 'minimal',
      title: 'Minimal',
      description: 'Simple et efficace',
      hoverColor: 'bg-green-600',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50',
      blueEffect: 'shadow-emerald-200/50 ring-1 ring-blue-100/40',
    },
    {
      id: 'executive',
      title: 'Executive',
      description: 'Pour les postes de direction',
      badge: { text: 'Premium', className: 'text-slate-800 bg-slate-100' },
      hoverColor: 'bg-slate-600',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50',
      blueEffect: 'shadow-amber-200/50 ring-1 ring-blue-100/40',
    },
  ];

  const handleDragEnter = (e: React.DragEvent) => {
    if (isTextMode || isLinkedInMode) return; // Ne pas permettre le drag & drop en mode texte ou LinkedIn
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isTextMode || isLinkedInMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isTextMode || isLinkedInMode) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isTextMode || isLinkedInMode) return; // Ne pas permettre le drag & drop en mode texte ou LinkedIn
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
    // Vérifier la taille (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux. Taille maximale autorisée : 5MB.';
    }

    // Vérifier le type de fichier
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

  const handleFileUpload = (file: File) => {
    // Réinitialiser l'erreur
    setFileError('');

    // Valider le fichier
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    // Stocker le fichier téléchargé
    setUploadedFile(file);

    // Simulate file processing and text extraction
    const reader = new FileReader();
    reader.onload = () => {
      setCvText(
        `Contenu extrait de ${file.name}:\n\nNom: John Doe\nTitre: Développeur Frontend\nExpérience: 5 ans en React, TypeScript...`
      );
      // Advance automatically to step 2 after file import
      setTimeout(() => {
        completeStepAndAdvance(1, 2);
      }, 1000); // Small delay to show the file upload success
    };
    reader.readAsText(file);
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

  const validateLinkedInUrl = (url: string): boolean => {
    const linkedInRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedInRegex.test(url);
  };

  const validateLinkedInJobUrl = (url: string): boolean => {
    const linkedInJobRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/jobs\/view\/\d+\/?.*$/;
    return linkedInJobRegex.test(url);
  };

  const handleLinkedInImport = () => {
    setFileError('');

    if (!linkedInUrl.trim()) {
      setFileError('Veuillez entrer une URL LinkedIn valide.');
      return;
    }

    if (!validateLinkedInUrl(linkedInUrl)) {
      setFileError(
        "Format d'URL LinkedIn invalide. Exemple: https://linkedin.com/in/votre-profil"
      );
      return;
    }

    // Simulate LinkedIn import
    setCvText(
      `Profil LinkedIn importé de: ${linkedInUrl}\n\nNom: John Doe\nTitre: Développeur Frontend\nLocalisation: Paris, France\nExpérience: 5 ans en React, TypeScript, JavaScript...`
    );

    setTimeout(() => {
      completeStepAndAdvance(1, 2);
    }, 1000);
  };

  const handleJobLinkedInImport = () => {
    setFileError('');

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

    // Simulate LinkedIn job import
    setJobOffer(
      `Offre d'emploi LinkedIn importée de: ${jobLinkedInUrl}\n\nTitre: Développeur Frontend Senior\nEntreprise: TechCorp\nLocalisation: Paris, France\nType: CDI\n\nDescription:\nNous recherchons un développeur frontend senior pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant React, TypeScript et les dernières technologies web.\n\nRequis:\n- 5+ ans d'expérience en développement frontend\n- Maîtrise de React, TypeScript, JavaScript\n- Expérience avec les outils de build modernes\n- Connaissance des bonnes pratiques UX/UI`
    );

    setTimeout(() => {
      completeStepAndAdvance(2, 3);
    }, 1000);
  };

  const handleContinueToJobOffer = () => {
    const minCvLength = 500; // Minimum 500 caractères pour le CV
    setFileError(''); // Réinitialiser les erreurs précédentes
    if (cvText.trim().length >= minCvLength) {
      completeStepAndAdvance(1, 2);
    } else {
      setFileError(
        `Votre CV doit contenir au moins ${minCvLength} caractères. Actuellement : ${
          cvText.trim().length
        } caractères.`
      );
    }
  };

  const handleJobOfferContinue = () => {
    const minJobOfferLength = 300; // Minimum 200 caractères pour l'offre d'emploi
    setFileError(''); // Réinitialiser les erreurs précédentes
    if (jobOffer.trim().length >= minJobOfferLength) {
      completeStepAndAdvance(2, 3);
    } else {
      setFileError(
        `L'offre d'emploi doit contenir au moins ${minJobOfferLength} caractères. Actuellement : ${
          jobOffer.trim().length
        } caractères.`
      );
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

  return (
    <>
      <section id='ameliorer-cv' className='px-6 py-12 lg:py-20 '>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-6 text-center lg:mb-12'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
              Améliorez votre CV maintenant
            </h2>
            <p className='max-w-2xl mx-auto text-xl text-gray-600'>
              Déposez votre CV actuel et laissez notre IA l'optimiser
              automatiquement pour maximiser vos chances
            </p>

            {/* Simple numbered steps */}
            <div className='flex flex-col items-center justify-center gap-2 mt-8 text-sm sm:flex-row sm:gap-6'>
              <motion.span
                className={`flex items-center gap-2 font-semibold cursor-pointer transition-all ${
                  currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
                } ${
                  currentStep === 1 || completedSteps.includes(1)
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50'
                }`}
                animate={{
                  scale: currentStep === 1 ? 1.05 : 1,
                  color: currentStep >= 1 ? '#2563eb' : '#9ca3af',
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onClick={() => navigateToStep(1)}
              >
                <motion.span
                  className={`flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full ${
                    completedSteps.includes(1)
                      ? 'bg-green-500 ring-2 ring-green-200'
                      : currentStep >= 1
                      ? 'bg-blue-500 ring-2 ring-blue-200'
                      : 'bg-white'
                  }`}
                  animate={{
                    scale: currentStep === 1 ? 1.15 : 1,
                    backgroundColor: completedSteps.includes(1)
                      ? '#10b981'
                      : currentStep >= 1
                      ? '#3b82f6'
                      : '#e5e7eb',
                    boxShadow:
                      currentStep === 1
                        ? '0 0 0 4px rgba(59, 130, 246, 0.2)'
                        : '0 0 0 0px rgba(59, 130, 246, 0.2)',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {completedSteps.includes(1) ? '✓' : '1'}
                </motion.span>
                <span
                  className={` 
                    ${
                      completedSteps.includes(1)
                        ? 'text-green-500 '
                        : currentStep >= 1
                        ? 'text-blue-500 '
                        : 'text-white'
                    }`}
                >
                  Importer votre CV
                </span>
              </motion.span>
              <motion.span
                className='hidden sm:block'
                animate={{
                  opacity: currentStep >= 2 ? 1 : 0.3,
                  scale: currentStep >= 2 ? 1.1 : 1,
                  color: currentStep >= 2 ? '#3b82f6' : '#d1d5db',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                →
              </motion.span>
              <motion.span
                className={`flex items-center gap-2 font-semibold cursor-pointer transition-all ${
                  currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
                } ${
                  currentStep === 2 ||
                  completedSteps.includes(2) ||
                  currentStep > 2
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50'
                }`}
                animate={{
                  scale: currentStep === 2 ? 1.05 : 1,
                  color: currentStep >= 2 ? '#2563eb' : '#9ca3af',
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onClick={() => navigateToStep(2)}
              >
                <motion.span
                  className={`flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                    completedSteps.includes(2)
                      ? 'bg-green-500 text-white ring-2 ring-green-200'
                      : currentStep >= 2
                      ? 'bg-blue-500 text-white ring-2 ring-blue-200'
                      : 'bg-white'
                  }`}
                  animate={{
                    scale: currentStep === 2 ? 1.15 : 1,
                    backgroundColor: completedSteps.includes(2)
                      ? '#10b981'
                      : currentStep >= 2
                      ? '#3b82f6'
                      : '#e5e7eb',
                    color: currentStep >= 2 ? '#ffffff' : '#9ca3af',
                    boxShadow:
                      currentStep === 2
                        ? '0 0 0 4px rgba(59, 130, 246, 0.2)'
                        : '0 0 0 0px rgba(59, 130, 246, 0.2)',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {completedSteps.includes(2) ? '✓' : '2'}
                </motion.span>
                <span
                  className={`${
                    completedSteps.includes(2)
                      ? 'text-green-500'
                      : currentStep >= 2
                      ? 'text-blue-500 '
                      : 'text-grey'
                  }`}
                >
                  Ajouter l'offre d'emploi
                </span>
              </motion.span>
              <motion.span
                className='hidden sm:block'
                animate={{
                  opacity: currentStep >= 3 ? 1 : 0.3,
                  scale: currentStep >= 3 ? 1.1 : 1,
                  color: currentStep >= 3 ? '#3b82f6' : '#d1d5db',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                →
              </motion.span>
              <motion.span
                className={`flex items-center gap-2 font-semibold cursor-pointer transition-all ${
                  currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'
                } ${
                  currentStep === 3 ||
                  completedSteps.includes(3) ||
                  currentStep > 3
                    ? 'hover:scale-105'
                    : 'cursor-not-allowed opacity-50'
                }`}
                animate={{
                  scale: currentStep === 3 ? 1.05 : 1,
                  color: currentStep >= 3 ? '#2563eb' : '#9ca3af',
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onClick={() => navigateToStep(3)}
              >
                <motion.span
                  className={`flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                    completedSteps.includes(3)
                      ? 'bg-green-500 text-white ring-2 ring-green-200'
                      : currentStep >= 3
                      ? 'bg-blue-500 text-white ring-2 ring-blue-200'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  animate={{
                    scale: currentStep === 3 ? 1.15 : 1,
                    backgroundColor: completedSteps.includes(3)
                      ? '#10b981'
                      : currentStep >= 3
                      ? '#3b82f6'
                      : '#e5e7eb',
                    color: currentStep >= 3 ? '#ffffff' : '#9ca3af',
                    boxShadow:
                      currentStep === 3
                        ? '0 0 0 4px rgba(59, 130, 246, 0.2)'
                        : '0 0 0 0px rgba(59, 130, 246, 0.2)',
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  {completedSteps.includes(3) ? '✓' : '3'}
                </motion.span>
                Choisir un Modéle
              </motion.span>
            </div>
          </div>

          <div
            className={`p-8 transition-all duration-200 bg-white shadow-lg rounded-2xl ${
              !isTextMode &&
              !isLinkedInMode &&
              currentStep === 1 &&
              !uploadedFile
                ? 'cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400'
                : 'border border-solid border-gray-200'
            } ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : ''}`}
            onDragEnter={
              !isTextMode && !isLinkedInMode && !uploadedFile
                ? handleDragEnter
                : undefined
            }
            onDragOver={
              !isTextMode && !isLinkedInMode && !uploadedFile
                ? handleDragOver
                : undefined
            }
            onDragLeave={
              !isTextMode && !isLinkedInMode && !uploadedFile
                ? handleDragLeave
                : undefined
            }
            onDrop={
              !isTextMode && !isLinkedInMode && !uploadedFile
                ? handleDrop
                : undefined
            }
            onClick={
              currentStep === 1 &&
              !isTextMode &&
              !isLinkedInMode &&
              !uploadedFile
                ? handleFileSelect
                : undefined
            }
          >
            <div className='text-center'>
              <AnimatePresence mode='wait'>
                {/* Étape 1: Upload CV */}
                {currentStep === 1 && (
                  <motion.div
                    key='step1'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
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
                      {!isTextMode && !isLinkedInMode
                        ? 'Formats acceptés: PDF, DOC, DOCX (max 5MB)'
                        : isLinkedInMode
                        ? 'Importez directement depuis votre profil LinkedIn'
                        : 'Copiez et collez le contenu de votre CV dans le champ ci-dessous'}
                    </p>

                    {/* Format Toggle Switch */}
                    <div className='mb-6'>
                      <div className='inline-flex items-center p-1 bg-gray-100 rounded-lg'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTextMode(false);
                            setIsLinkedInMode(false);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
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
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                            isTextMode
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
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                            isLinkedInMode
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <LinkIcon className='w-4 h-4' />
                          LinkedIn
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-col items-center justify-center w-full gap-4'>
                      {!isTextMode && !isLinkedInMode ? (
                        <>
                          <input
                            ref={fileInputRef}
                            type='file'
                            accept='.pdf,.doc,.docx'
                            onChange={handleFileChange}
                            className='hidden'
                          />
                          {uploadedFile ? (
                            // Affichage des informations du fichier uploadé
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
                                    <span>
                                      {getFileTypeLabel(uploadedFile.type)}
                                    </span>
                                    <span>
                                      {formatFileSize(uploadedFile.size)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className='flex justify-center mt-4'>
                                <button
                                  size='lg'
                                  className='font-bold'
                                  onClick={() => completeStepAndAdvance(1, 2)}
                                >
                                  Continuer
                                  <ChevronRight className='w-5 h-5 ml-2' />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              size='lg'
                              className='font-bold'
                              onClick={handleFileSelect}
                            >
                              <UploadCloudIcon className='w-5 h-5 mr-2' />
                              Parcourir mes fichiers
                            </button>
                          )}
                        </>
                      ) : isLinkedInMode ? (
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
                            <button
                              size='lg'
                              className='font-bold'
                              onClick={handleLinkedInImport}
                              disabled={!linkedInUrl.trim()}
                            >
                              Importer depuis LinkedIn
                              <ChevronRight className='w-5 h-5 ml-2' />
                            </button>
                          </div>
                        </div>
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
                            <button
                              size='lg'
                              className='font-bold'
                              onClick={handleContinueToJobOffer}
                              disabled={cvText.trim().length < 500}
                            >
                              Continuer
                              <ChevronRight className='w-5 h-5 ' />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Message d'erreur toujours affiché, peu importe le mode */}
                      {fileError && (
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
                          {fileError}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Étape 2: Offre d'emploi */}
                {currentStep === 2 && (
                  <motion.div
                    key='step2'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className='flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full'>
                      <svg
                        className='w-8 h-8 text-purple-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>

                    <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
                      Ajoutez l'offre d'emploi
                    </h3>
                    <p className='mb-6 text-gray-600'>
                      {!isJobLinkedInMode
                        ? "Collez l'annonce pour que l'IA adapte parfaitement votre CV"
                        : 'Importez directement depuis une offre LinkedIn'}
                    </p>

                    {/* Job Format Toggle Switch */}
                    <div className='mb-6'>
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
                          <LinkIcon className='w-4 h-4' />
                          LinkedIn
                        </button>
                      </div>
                    </div>

                    <div className='w-full max-w-2xl mx-auto'>
                      {!isJobLinkedInMode ? (
                        <>
                          <div className='relative'>
                            <textarea
                              placeholder='Collez ici l&#39;offre d&#39;emploi complète...'
                              className='w-full h-40 p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                              value={jobOffer}
                              onChange={(e) => setJobOffer(e.target.value)}
                            />
                            <div className='absolute text-xs text-gray-500 bottom-2 right-2'>
                              {jobOffer.trim().length}/300 min
                            </div>
                          </div>
                          <div className='flex flex-wrap justify-center gap-4 mt-4'>
                            <button
                              variant='outline'
                              size='lg'
                              onClick={() => navigateToStep(1)}
                            >
                              <ChevronLeft className='w-5 h-5' />
                              Retour
                            </button>
                            <button
                              size='lg'
                              className='font-bold'
                              onClick={handleJobOfferContinue}
                              disabled={jobOffer.trim().length < 300}
                            >
                              Continuer
                              <ChevronRight className='w-5 h-5 ' />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='relative'>
                            <input
                              type='url'
                              placeholder='https://linkedin.com/jobs/view/123456789'
                              className='w-full p-4 text-sm transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                              value={jobLinkedInUrl}
                              onChange={(e) =>
                                setJobLinkedInUrl(e.target.value)
                              }
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
                          <div className='flex flex-wrap justify-center gap-4 mt-4'>
                            <button
                              variant='outline'
                              size='lg'
                              onClick={() => navigateToStep(1)}
                            >
                              <ChevronLeft className='w-5 h-5' />
                              Retour
                            </button>
                            <button
                              size='lg'
                              className='font-bold'
                              onClick={handleJobLinkedInImport}
                              disabled={!jobLinkedInUrl.trim()}
                            >
                              Importer depuis LinkedIn
                              <ChevronRight className='w-5 h-5 ml-2' />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Étape 3: Choix de template */}
                {currentStep === 3 && (
                  <motion.div
                    key='step3'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
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
                          d='M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
                        />
                      </svg>
                    </div>

                    <h3 className='mb-2 text-2xl font-semibold text-gray-900'>
                      Choisissez votre modéle
                    </h3>
                    <p className='mb-6 text-gray-600'>
                      Sélectionnez le design qui correspond le mieux à votre
                      profil
                    </p>

                    <div className='relative mb-8'>
                      {/* Carousel Navigation */}
                      <div className='absolute z-40 hidden transform -translate-y-1/2 left-4 top-1/2 md:block'>
                        <button
                          onClick={() => scrollCarousel('left')}
                          className='flex items-center justify-center w-12 h-12 transition-colors bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50'
                        >
                          <ChevronLeft className='w-6 h-6 text-gray-600' />
                        </button>
                      </div>
                      <div className='absolute z-40 hidden transform -translate-y-1/2 right-4 top-1/2 md:block'>
                        <button
                          onClick={() => scrollCarousel('right')}
                          className='flex items-center justify-center w-12 h-12 transition-colors bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50'
                        >
                          <ChevronRight className='w-6 h-6 text-gray-600' />
                        </button>
                      </div>

                      {/* Mobile scroll indicator */}
                      <div className='mb-4 text-center md:hidden'>
                        <p className='text-sm text-gray-500'>
                          Faites défiler horizontalement pour voir plus de
                          modèles →
                        </p>
                      </div>

                      {/* Carousel Container */}
                      <div
                        ref={carouselRef}
                        id='templates-carousel-step3'
                        className='flex gap-6 px-4 py-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory'
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}
                      >
                        <style jsx>{`
                          .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                          }
                        `}</style>

                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className='relative flex-shrink-0 cursor-pointer group snap-center'
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <div className='relative group/template'>
                              <Image
                                src='/images/cv1.png'
                                alt={`Template ${template.title}`}
                                width={220}
                                height={280}
                                className={`object-contain transition-all duration-300 group-hover:scale-105 shadow-lg rounded-lg ${
                                  selectedTemplate === template.id
                                    ? 'scale-105 ring-4 ring-blue-200 shadow-xl'
                                    : 'hover:shadow-xl'
                                }`}
                                sizes='220px'
                              />

                              {/* Bouton Voir - visible au hover seulement si pas sélectionné */}
                              {selectedTemplate !== template.id && (
                                <div className='absolute inset-0 flex items-center justify-center transition-opacity duration-300 rounded-lg opacity-0 z-25 bg-black/20 group-hover/template:opacity-100'>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewTemplate(template.id);
                                      hideHeader();
                                    }}
                                    className='flex items-center justify-center w-12 h-12 transition-all duration-200 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110'
                                  >
                                    <Eye className='w-6 h-6 text-white' />
                                  </button>
                                </div>
                              )}

                              {template.badge && (
                                <div className='absolute z-20 top-2 right-2'>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${template.badge.className} shadow-sm`}
                                  >
                                    {template.badge.text}
                                  </span>
                                </div>
                              )}

                              {selectedTemplate === template.id && (
                                <div className='absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-blue-600/20'>
                                  <div className='flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full shadow-lg'>
                                    <svg
                                      className='w-6 h-6 text-white'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={3}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className='mt-3 text-center'>
                              <h4
                                className={`text-lg font-semibold transition-colors ${
                                  selectedTemplate === template.id
                                    ? 'text-blue-600'
                                    : 'text-gray-900'
                                }`}
                              >
                                {template.title}
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {template.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-4'>
                      <button
                        variant='outline'
                        size='lg'
                        onClick={() => navigateToStep(2)}
                      >
                        <svg
                          className='w-5 h-5 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                        Retour
                      </button>
                      <button
                        size='lg'
                        className='font-bold'
                        onClick={() => {
                          setShowLoginModal(true);
                          hideHeader();
                        }}
                        disabled={!selectedTemplate}
                      >
                        <svg
                          className='w-5 h-5 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        Générer mon CV
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal de prévisualisation via Portal */}
              {previewTemplate &&
                typeof window !== 'undefined' &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className='fixed inset-0 z-[99999999] flex items-center justify-center'
                    style={{
                      zIndex: 2147483647,
                      background: 'rgba(0, 0, 0, 0.7)',
                    }}
                    onClick={() => {
                      setPreviewTemplate(null);
                      showHeader();
                    }}
                  >
                    {/* Background overlay avec effet de flou moderne */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className='absolute inset-0 bg-gradient-to-br from-blue-900/5 via-gray-900/10 to-black/15'
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className='relative z-10 flex flex-col items-center w-full max-w-5xl max-h-[95vh] p-4 sm:p-6 md:p-8 overflow-hidden mx-4'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Bouton de fermeture */}
                      <button
                        onClick={() => {
                          setPreviewTemplate(null);
                          showHeader();
                        }}
                        className='absolute z-20 p-2 text-white transition-all duration-200 rounded-full sm:p-3 top-2 right-2 sm:top-4 sm:right-4 bg-black/30 backdrop-blur-sm hover:bg-black/50 hover:scale-110'
                      >
                        <X className='w-5 h-5 sm:w-6 sm:h-6' />
                      </button>

                      {/* Titre */}
                      <div className='px-2 mb-4 text-center sm:mb-6'>
                        <h3 className='mb-2 text-xl font-bold text-white sm:text-2xl md:text-3xl'>
                          {
                            templates.find((t) => t.id === previewTemplate)
                              ?.title
                          }{' '}
                          Template
                        </h3>
                        <p className='text-sm text-gray-200 sm:text-base md:text-lg'>
                          {
                            templates.find((t) => t.id === previewTemplate)
                              ?.description
                          }
                        </p>
                      </div>

                      {/* CV en format A4 */}
                      <div className='relative flex justify-center mb-4 sm:mb-6'>
                        <div
                          className='relative overflow-hidden bg-white rounded-lg shadow-2xl w-72 sm:w-80 md:w-96 lg:w-[420px]'
                          style={{ aspectRatio: '210/297' }}
                        >
                          <Image
                            src='/images/cv1.png'
                            alt={`Template ${
                              templates.find((t) => t.id === previewTemplate)
                                ?.title
                            }`}
                            fill
                            className='object-cover'
                            sizes='(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 384px, 420px'
                          />
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className='flex flex-col justify-center w-full gap-3 px-4 sm:flex-row sm:gap-4'>
                        <button
                          variant='outline'
                          size='lg'
                          onClick={() => {
                            setPreviewTemplate(null);
                            showHeader();
                          }}
                          className='w-full text-sm text-white sm:w-auto bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 sm:text-base'
                        >
                          Fermer
                        </button>
                        <button
                          size='lg'
                          onClick={() => {
                            setSelectedTemplate(previewTemplate);
                            setPreviewTemplate(null);
                            showHeader();
                          }}
                          className='w-full text-sm font-bold text-white bg-blue-600 shadow-lg sm:w-auto hover:bg-blue-700 sm:text-base'
                        >
                          Sélectionner ce template
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}

              {/* Modal de connexion via Portal */}
              {showLoginModal &&
                typeof window !== 'undefined' &&
                createPortal(
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className='fixed inset-0 z-[9999999] flex items-center justify-center'
                    style={{
                      zIndex: 2147483647,
                      background: 'rgba(0, 0, 0, 0.7)',
                    }}
                    onClick={() => {
                      setShowLoginModal(false);
                      showHeader();
                    }}
                  >
                    {/* Background overlay avec effet de flou moderne */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      className='absolute inset-0 bg-gradient-to-br from-blue-900/5 via-gray-900/10 to-black/15'
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className='relative z-10 w-full max-w-lg p-10 mx-4 border shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl border-white/20'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Bouton de fermeture */}
                      <button
                        onClick={() => {
                          setShowLoginModal(false);
                          showHeader();
                        }}
                        className='absolute p-3 text-gray-400 transition-all duration-200 rounded-full top-4 right-4 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-110'
                      >
                        <X className='w-6 h-6' />
                      </button>

                      {/* Contenu du modal */}
                      <div className='text-center'>
                        {/* Icône avec gradient */}
                        <div className='relative flex items-center justify-center w-20 h-20 mx-auto mb-8'>
                          <div className='absolute inset-0 rounded-full shadow-lg bg-gradient-to-br from-blue-100 to-blue-200'></div>
                          <svg
                            className='relative w-10 h-10 text-blue-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            />
                          </svg>
                        </div>

                        <h3 className='mb-3 text-3xl text-gray-900 font-blac'>
                          Connectez-vous pour Continuer
                        </h3>
                        <p className='mb-8 leading-relaxed text-gray-600 text-meduim'>
                          Pour générer votre CV optimisé, créez votre compte
                          gratuit en quelques secondes
                        </p>

                        <div className='space-y-4'>
                          <Link href='/cv-builder-enhancecv'>
                            <button
                              size='lg'
                              className='w-full h-12 text-lg font-bold transition-all duration-200 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
                            >
                              Générer mon CV optimisé
                            </button>
                          </Link>
                          <div className='pt-2'>
                            <button
                              onClick={() => {
                                setShowLoginModal(false);
                                showHeader();
                              }}
                              className='text-sm text-gray-500 underline transition-colors duration-200 hover:text-gray-700 decoration-dotted underline-offset-4'
                            >
                              Plus tard
                            </button>
                          </div>
                        </div>

                        {/* Features badges */}
                        <div className='flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-500'>
                          <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span>Aucune carte de crédit requise</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            <span>Gratuit</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                            <span>Sécurisé</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>,
                  document.body
                )}

              {currentStep === 1 && (
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
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
