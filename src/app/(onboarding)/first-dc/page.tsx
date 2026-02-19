'use client';

import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  FileUp,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

import { useOnboarding, useOnboardingStore } from '@/hooks/use-onboarding';
import { useResumes } from '@/hooks/useResumes';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Mode = 'choice' | 'upload' | 'manual';

export default function FirstDCPage() {
  const { prevStep, completeOnboarding } = useOnboarding();
  const { setStep } = useOnboardingStore();
  const [mode, setMode] = useState<Mode>('choice');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { parseCV } = useResumes();
  const isLoading = parseCV.isPending;

  // Set step on mount
  useEffect(() => {
    setStep(5);
  }, [setStep]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUploadAndCreate = async () => {
    if (!uploadedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    try {
      const data = await parseCV.mutateAsync(uploadedFile);

      if (!data.success) {
        throw new Error('Erreur lors du parsing');
      }

      toast.success('CV importé avec succès !');
      await completeOnboarding();
    } catch {
      toast.error("Erreur lors de l'import du CV");
    }
  };

  const handleSkipToExplore = async () => {
    await completeOnboarding();
  };

  // Choice mode
  if (mode === 'choice') {
    return (
      <div>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full'>
            <Sparkles className='w-8 h-8 text-purple-600' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Créez votre premier dossier
          </h1>
          <p className='text-gray-600'>Choisissez comment commencer</p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8 space-y-4'>
            {/* Import CV Option */}
            <button
              className='w-full p-6 text-left transition-all border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-300 hover:bg-blue-100'
              onClick={() => setMode('upload')}
            >
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-blue-100 rounded-xl'>
                  <FileUp className='w-6 h-6 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-blue-900'>
                      À partir d'un CV
                    </span>
                    <span className='px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full'>
                      Recommandé
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-blue-700'>
                    Importez un CV et l'IA extraira automatiquement les
                    informations
                  </p>
                </div>
                <ArrowRight className='w-5 h-5 text-blue-500' />
              </div>
            </button>

            {/* Manual Option */}
            <button
              className='w-full p-6 text-left transition-all border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50'
              onClick={() => setMode('manual')}
            >
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-100 rounded-xl'>
                  <Edit3 className='w-6 h-6 text-gray-600' />
                </div>
                <div className='flex-1'>
                  <span className='font-semibold text-gray-900'>
                    Saisie manuelle
                  </span>
                  <p className='mt-1 text-sm text-gray-600'>
                    Remplissez le formulaire étape par étape
                  </p>
                </div>
                <ArrowRight className='w-5 h-5 text-gray-400' />
              </div>
            </button>

            {/* Explore Option */}
            <button
              className='w-full p-6 text-left transition-all border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50'
              onClick={handleSkipToExplore}
            >
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-100 rounded-xl'>
                  <Eye className='w-6 h-6 text-gray-600' />
                </div>
                <div className='flex-1'>
                  <span className='font-semibold text-gray-900'>
                    Explorer d'abord
                  </span>
                  <p className='mt-1 text-sm text-gray-600'>
                    Découvrez l'application avant de créer un dossier
                  </p>
                </div>
                <ArrowRight className='w-5 h-5 text-gray-400' />
              </div>
            </button>

            {/* Back Button */}
            <div className='pt-4'>
              <Button
                type='button'
                variant='ghost'
                className='gap-2'
                onClick={prevStep}
              >
                <ArrowLeft className='w-4 h-4' />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upload mode
  if (mode === 'upload') {
    return (
      <div>
        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Importez un CV
          </h1>
          <p className='text-gray-600'>
            L'IA va extraire automatiquement les informations
          </p>
        </div>

        <Card className='border-gray-100 shadow-xl'>
          <CardContent className='p-8'>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`p-8 text-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />

              {uploadedFile ? (
                <div>
                  <div className='flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full'>
                    <FileUp className='w-6 h-6 text-green-600' />
                  </div>
                  <p className='font-medium text-green-700'>
                    {uploadedFile.name}
                  </p>
                  <p className='mt-1 text-sm text-green-600'>
                    Cliquez pour changer de fichier
                  </p>
                </div>
              ) : (
                <div>
                  <FileUp className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                  <p className='font-medium text-gray-700'>
                    {isDragActive
                      ? 'Déposez le fichier ici'
                      : 'Glissez un CV ici ou cliquez pour parcourir'}
                  </p>
                  <p className='mt-2 text-sm text-gray-500'>
                    Formats acceptés : PDF, Word (max 10 Mo)
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className='p-4 mt-6 bg-blue-50 rounded-xl'>
              <div className='flex items-start gap-3'>
                <Sparkles className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-blue-900'>
                    Extraction automatique
                  </p>
                  <ul className='mt-1 text-xs text-blue-700 space-y-0.5'>
                    <li>Informations personnelles</li>
                    <li>Expériences professionnelles</li>
                    <li>Compétences techniques</li>
                    <li>Formations et certifications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className='flex justify-between pt-6'>
              <Button
                type='button'
                variant='outline'
                className='gap-2 rounded-xl'
                onClick={() => setMode('choice')}
              >
                <ArrowLeft className='w-4 h-4' />
                Retour
              </Button>

              <Button
                className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
                onClick={handleUploadAndCreate}
                disabled={!uploadedFile || isLoading}
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <>
                    Créer le dossier
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual mode
  return (
    <div>
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Création manuelle
        </h1>
        <p className='text-gray-600'>
          Vous serez redirigé vers l'éditeur de dossier
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8 text-center'>
          <Edit3 className='w-12 h-12 mx-auto mb-4 text-gray-400' />
          <p className='mb-6 text-gray-600'>
            L'éditeur vous guidera pour créer votre dossier de compétences étape
            par étape.
          </p>

          <div className='flex justify-center gap-4'>
            <Button
              variant='outline'
              className='gap-2 rounded-xl'
              onClick={() => setMode('choice')}
            >
              <ArrowLeft className='w-4 h-4' />
              Retour
            </Button>

            <Link href='/cv-builder'>
              <Button
                className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
                onClick={completeOnboarding}
              >
                Ouvrir l'éditeur
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
