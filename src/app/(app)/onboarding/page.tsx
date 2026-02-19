'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle,
  FileText,
  Loader2,
  Palette,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Input } from '@/components/ui/input';

import { useResumeStore } from '@/stores/resume-simple';

import { CVData } from '@/types/cv-matcher';

// --- Types ---

type Step = 'branding' | 'upload' | 'magic' | 'success';

interface BrandingData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

// --- Component ---

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('branding');
  const [isProcessing, setIsProcessing] = useState(false);

  // Branding State
  const [branding, setBranding] = useState<BrandingData>({
    name: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
  });

  // Upload State
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Store access
  const { setValue, resume } = useResumeStore();

  // --- Handlers ---

  const handleBrandingSubmit = async () => {
    if (!branding.name.trim()) {
      toast.error("Le nom de l'entreprise est requis");
      return;
    }

    setIsProcessing(true);
    try {
      // Save branding to Organization (via API)
      await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: branding.name,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          // logoUrl is skipped for MVP simplicity unless we implement upload here
        }),
      });
      setStep('upload');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    setCvFile(file);
    // Auto-advance
  };

  const handleMagicGeneration = async () => {
    if (!cvFile) return;

    setStep('magic');
    setIsProcessing(true);

    try {
      // 1. Parse CV
      const formData = new FormData();
      formData.append('file', cvFile);

      const parseRes = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      if (!parseRes.ok) throw new Error("Erreur lors de l'analyse du CV");
      const parseData = await parseRes.json();
      const cvData = parseData.data as CVData;

      // 2. Apply to Store (Harmonization)
      applyCvDataToResume(cvData);

      // 3. Fake "Magic" Delay for UX
      await new Promise((r) => setTimeout(r, 1500));

      setStep('success');
    } catch (error) {
      console.error(error);
      toast.error('Échec de la génération magique');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCvDataToResume = useCallback(
    (cvData: CVData) => {
      // Basic Info
      setValue('data.basics.name', cvData.content.personalInfo.fullName || '');
      setValue('data.basics.email', cvData.content.personalInfo.email || '');
      setValue('data.basics.phone', cvData.content.personalInfo.phone || '');
      setValue('data.basics.summary', cvData.content.summary || '');

      // Experience
      const experiences = cvData.content.experiences.map((exp, index) => ({
        id: `exp-${index + 1}`,
        position: exp.title || 'Consultant',
        company: exp.company || 'Confidentiel',
        description: exp.description || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        highlights: exp.skills || [],
      }));
      setValue('data.sections.experience.items', experiences);

      // Skills
      const skills = cvData.content.skills.map((skill, index) => ({
        id: `skill-${index + 1}`,
        name: skill.name,
      }));
      setValue('data.sections.skills.items', skills);

      // Education
      const education = cvData.content.education.map((edu, index) => ({
        id: `edu-${index + 1}`,
        degree: edu.degree,
        institution: edu.school,
        startDate: edu.startDate,
        endDate: edu.endDate,
      }));
      setValue('data.sections.education.items', education);
    },
    [setValue]
  );

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const { exportToPPTX } = await import('@/lib/pptx/export');
      await exportToPPTX(resume, {
        name: branding.name,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
      });
      toast.success('Dossier téléchargé !');
    } catch (e) {
      toast.error('Erreur export');
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  // --- Render Steps ---

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100'>
        {/* Progress Header */}
        <div className='bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'branding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              1
            </div>
            <div
              className={`h-1 w-8 rounded-full ${
                step === 'upload' || step === 'magic' || step === 'success'
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'upload'
                  ? 'bg-blue-600 text-white'
                  : step === 'magic' || step === 'success'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <div
              className={`h-1 w-8 rounded-full ${
                step === 'success' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </div>
          </div>
          <div className='text-sm font-medium text-gray-500'>
            {step === 'branding' && 'Identité ESN'}
            {step === 'upload' && 'Import CV'}
            {step === 'magic' && 'Génération'}
            {step === 'success' && 'Terminé !'}
          </div>
        </div>

        <div className='p-8 min-h-[400px] flex flex-col'>
          <AnimatePresence mode='wait'>
            {/* STEP 1: BRANDING */}
            {step === 'branding' && (
              <motion.div
                key='branding'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='space-y-6 flex-1'
              >
                <div className='text-center'>
                  <div className='w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                    <Palette className='w-8 h-8' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Configurez votre identité
                  </h2>
                  <p className='text-gray-500'>
                    Personnalisez Robert à vos couleurs en 10 secondes.
                  </p>
                </div>

                <div className='space-y-4 max-w-sm mx-auto'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom de l&apos;ESN
                    </label>
                    <div className='relative'>
                      <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <Input
                        className='pl-10'
                        placeholder='Ex: Tech Consulting'
                        value={branding.name}
                        onChange={(e) =>
                          setBranding({ ...branding, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Couleur Principale
                      </label>
                      <div className='flex gap-2'>
                        <div className='w-10 h-10 rounded-lg border border-gray-200 overflow-hidden shrink-0'>
                          <input
                            type='color'
                            className='w-[150%] h-[150%] -m-[25%] cursor-pointer'
                            value={branding.primaryColor}
                            onChange={(e) =>
                              setBranding({
                                ...branding,
                                primaryColor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Input
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding({
                              ...branding,
                              primaryColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Couleur Secondaire
                      </label>
                      <div className='flex gap-2'>
                        <div className='w-10 h-10 rounded-lg border border-gray-200 overflow-hidden shrink-0'>
                          <input
                            type='color'
                            className='w-[150%] h-[150%] -m-[25%] cursor-pointer'
                            value={branding.secondaryColor}
                            onChange={(e) =>
                              setBranding({
                                ...branding,
                                secondaryColor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Input
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding({
                              ...branding,
                              secondaryColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-4 text-center'>
                  <Button
                    onClick={handleBrandingSubmit}
                    disabled={isProcessing}
                    className='w-full max-w-sm rounded-xl h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    {isProcessing ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      'Continuer'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: UPLOAD */}
            {step === 'upload' && (
              <motion.div
                key='upload'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='space-y-6 flex-1'
              >
                <div className='text-center'>
                  <div className='w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                    <UploadCloud className='w-8 h-8' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Importez un CV
                  </h2>
                  <p className='text-gray-500'>
                    Même mal formaté, Robert va le sublimer.
                  </p>
                </div>

                <div className='max-w-md mx-auto'>
                  <FileDropzone
                    file={cvFile}
                    onFileChange={handleCVUpload}
                    placeholder='Glissez le CV ici (PDF, DOCX)'
                    accent='purple'
                  />
                </div>

                <div className='pt-4 text-center'>
                  <Button
                    onClick={handleMagicGeneration}
                    disabled={!cvFile || isProcessing}
                    className='w-full max-w-sm rounded-xl h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white'
                  >
                    {isProcessing ? (
                      <Loader2 className='animate-spin' />
                    ) : (
                      'Générer mon Dossier Magique ✨'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: MAGIC PROCESSING */}
            {step === 'magic' && (
              <motion.div
                key='magic'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='flex-1 flex flex-col items-center justify-center text-center space-y-8'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse' />
                  <Sparkles className='w-20 h-20 text-blue-600 relative z-10 animate-bounce' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    La magie opère...
                  </h2>
                  <div className='space-y-2 text-gray-500 text-sm'>
                    <p className='animate-fade-in'>Lecture du CV...</p>
                    <p className='animate-fade-in delay-150'>
                      Harmonisation des compétences...
                    </p>
                    <p className='animate-fade-in delay-300'>
                      Application de votre charte graphique...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <motion.div
                key='success'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='space-y-6 flex-1 text-center'
              >
                <div className='w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <CheckCircle className='w-10 h-10' />
                </div>

                <div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                    C&apos;est prêt !
                  </h2>
                  <p className='text-gray-500'>
                    Votre premier Dossier de Compétences est généré.
                  </p>
                </div>

                <div className='p-6 bg-gray-50 rounded-2xl border border-gray-100 max-w-sm mx-auto'>
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    {branding.name}
                  </h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Dossier de compétences - {resume?.data.basics.name}
                  </p>
                  <Button
                    onClick={handleDownload}
                    className='w-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm'
                  >
                    <FileText className='w-4 h-4 mr-2' />
                    Télécharger (PPTX)
                  </Button>
                </div>

                <div className='pt-4'>
                  <Button
                    onClick={handleFinish}
                    className='w-full max-w-sm rounded-xl h-12 text-lg bg-black hover:bg-gray-800 text-white'
                  >
                    Accéder au Dashboard <ArrowRight className='w-5 h-5 ml-2' />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
