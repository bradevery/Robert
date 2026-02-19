'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = 'force-dynamic';

import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Link as LinkIcon, UploadCloud } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { downloadPDF } from '@/lib/pdf/export';

import { CVTemplateWithEditing } from '@/components/cv-builder/CVTemplateWithEditing';
// Section Editors
import { EnhanceCVSidebar } from '@/components/layout/EnhanceCVSidebar';
import { TemplateDesignSidebar } from '@/components/layout/TemplateDesignSidebar';
import { FieldVisibilityModal } from '@/components/modals/FieldVisibilityModal';
import { PhotoUploadModal } from '@/components/modals/PhotoUploadModal';
import { RearrangeSectionsModal } from '@/components/modals/RearrangeSectionsModal';
// Modal Components
import { SectionSelectorModal } from '@/components/modals/SectionSelectorModal';
// Template Components
import { TemplateType } from '@/components/templates/TemplateSelector';
import { Button } from '@/components/ui/button';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
import { OptionsMenu } from '@/components/ui/OptionsMenu';

import { useResumes } from '@/hooks/useResumes';
import { useOrganization } from '@/hooks/useOrganization';
import { useShare } from '@/hooks/useShare';

import { useResumeStore } from '@/stores/resume-simple';

import { CVData } from '@/types/cv-matcher';

function CVBuilderContent() {
  const { resume, setValue } = useResumeStore();

  // Hooks
  const { parseCV, parseLinkedIn } = useResumes();
  const { data: orgData } = useOrganization();
  const { createShare } = useShare();

  // Modal states
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);
  const [showTemplateDesignSidebar, setShowTemplateDesignSidebar] =
    useState(false);
  const [templateDesignActiveSection, setTemplateDesignActiveSection] =
    useState<'templates' | 'design'>('templates');

  // Template state
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>('layout1');

  // Design settings state
  const [designSettings, setDesignSettings] = useState({
    fontSize: 12,
    lineSpacing: 1.4,
    margins: 20,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
    layout: 'single-column',
    borderRadius: 6,
    shadowIntensity: 20,
  });

  // Editing state
  const [_isEditingCV, setIsEditingCV] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showFieldVisibilityModal, setShowFieldVisibilityModal] =
    useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [optionsMenuPosition, setOptionsMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedSection, setSelectedSection] = useState<string>('');

  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [textErrorsCount] = useState(3); // Mock errors count
  const [brandingEnabled, setBrandingEnabled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedLinkedInUrl, setImportedLinkedInUrl] = useState('');

  const importing = parseCV.isPending || parseLinkedIn.isPending;

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('modal') === 'import') {
      setShowImportModal(true);
    }
  }, [searchParams]);

  // Ref for PDF export
  const cvRef = useRef<HTMLDivElement>(null);

  // Update resume field function
  const updateResumeField = useCallback(
    (field: string, value: string) => {
      console.log('🔄 Updating field:', field, 'with value:', value);

      if (!resume) return;

      // Use setValue directly with the correct path
      // field is relative to data, so prepend 'data.'
      const fullPath = `data.${field}`;
      setValue(fullPath, value);
    },
    [resume, setValue]
  );

  // Sidebar action handlers
  const handleOpenSectionSelector = useCallback(() => {
    setShowSectionSelector(true);
  }, []);

  const handleRearrangeSections = useCallback(() => {
    setShowRearrangeModal(true);
  }, []);

  const handleSelectTemplate = useCallback(() => {
    setTemplateDesignActiveSection('templates');
    setShowTemplateDesignSidebar(true);
  }, []);

  const handleDesignSettings = useCallback(() => {
    setTemplateDesignActiveSection('design');
    setShowTemplateDesignSidebar(true);
  }, []);

  const handleDesignChange = useCallback((settings: any) => {
    console.log('Design settings changed:', settings);
    setDesignSettings(settings);
  }, []);

  const handlePhotoUpload = useCallback(
    (photoUrl: string, shape?: 'round' | 'rectangle') => {
      console.log('Photo uploaded:', photoUrl, 'Shape:', shape);
      // Implement photo upload to resume
      updateResumeField('basics.photo', photoUrl);
      if (shape) {
        updateResumeField('basics.photoShape', shape);
      }
    },
    [updateResumeField]
  );

  const handleTextReview = useCallback(() => {
    // Implement text review functionality
    console.log('Opening text review...');
  }, []);

  const handleATSCheck = useCallback(() => {
    // Implement ATS check functionality
    console.log('Running ATS check...');
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cvRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const candidateName = resume?.data?.basics?.name || 'CV';
      const filename = `${candidateName.replace(/\s+/g, '_')}_CV.pdf`;

      await downloadPDF(cvRef.current, {
        filename,
        format: 'a4',
        orientation: 'portrait',
        quality: 2,
        margin: 0,
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
    } finally {
      setIsExporting(false);
    }
  }, [resume, isExporting]);

  const handleDownloadPPTX = useCallback(async () => {
    if (!resume) return;

    setIsExporting(true);
    try {
      const { exportToPPTX } = await import('@/lib/pptx/export');
      await exportToPPTX(resume, orgData);
    } catch (error) {
      console.error('Error downloading PPTX:', error);
      alert("Erreur lors de l'export PPTX");
    } finally {
      setIsExporting(false);
    }
  }, [resume, orgData]);

  const handleShare = useCallback(async () => {
    if (!resume?.id) {
      console.error('No resume ID available');
      return;
    }

    try {
      const data = await createShare.mutateAsync({
        documentId: resume.id,
        documentType: 'cv',
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      alert(`Lien copié ! Valide pendant 7 jours.\n${data.shareUrl}`);
    } catch (error) {
      console.error('Error sharing CV:', error);
      alert('Erreur lors du partage du CV');
    }
  }, [resume, createShare]);

  const handleHistory = useCallback(() => {
    // Implement history functionality
    console.log('Opening history...');
  }, []);

  const handleBrandingToggle = useCallback((enabled: boolean) => {
    setBrandingEnabled(enabled);
  }, []);

  const handlePreviewToggle = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  // Get existing sections from resume
  const getExistingSections = useCallback(() => {
    if (!resume?.data?.sections) return [];
    // Retourner toutes les sections qui existent, peu importe leur visibilité
    return Object.keys(resume.data.sections);
  }, [resume]);

  // Handle adding a new section
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAddSection = useCallback(
    (sectionType: string) => {
      if (!resume) return;

      console.log('Adding section:', sectionType);

      // Create section based on type
      const newSection = {
        id: sectionType,
        name: getSectionName(sectionType),
        type: sectionType,
        visible: true,
        items: getDefaultSectionItems(sectionType),
      };

      // Update resume sections
      setValue(`data.sections.${sectionType}`, newSection);

      console.log('Section added successfully:', newSection);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resume, setValue]
  );

  // Helper function to get section display name
  const getSectionName = (sectionType: string): string => {
    const sectionNames: Record<string, string> = {
      profil: 'Profil',
      experience: 'Expérience professionnelle',
      education: 'Formation',
      skills: 'Compétences',
      projects: 'Projets',
      languages: 'Langues',
      certifications: 'Certifications',
      volunteer: 'Bénévolat',
      awards: 'Récompenses',
      publications: 'Publications',
      references: 'Références',
      interests: "Centres d'intérêt",
      links: 'Liens',
      quote: 'Citation',
      portfolio: 'Portfolio',
      training: 'Formation / Cours',
      achievements: 'Réalisations clés',
      summary: 'Résumé professionnel',
      custom: 'Section personnalisée',
    };
    return sectionNames[sectionType] || sectionType;
  };

  // Helper function to get default items for a section
  const getDefaultSectionItems = (sectionType: string): any[] => {
    switch (sectionType) {
      case 'experience':
        return [
          {
            id: 'exp-' + Date.now(),
            position: '',
            company: '',
            startDate: '',
            endDate: '',
            location: '',
            summary: '',
          },
        ];
      case 'education':
        return [
          {
            id: 'edu-' + Date.now(),
            studyType: '',
            area: '',
            institution: '',
            startDate: '',
            endDate: '',
            score: '',
          },
        ];
      case 'skills':
        return [
          {
            id: 'skill-' + Date.now(),
            name: '',
            level: '',
            keywords: [],
          },
        ];
      case 'projects':
        return [
          {
            id: 'proj-' + Date.now(),
            name: '',
            description: '',
            url: '',
            startDate: '',
            endDate: '',
            highlights: [],
          },
        ];
      case 'languages':
        return [
          {
            id: 'lang-' + Date.now(),
            language: '',
            fluency: '',
          },
        ];
      case 'certifications':
        return [
          {
            id: 'cert-' + Date.now(),
            name: '',
            issuer: '',
            date: '',
            url: '',
          },
        ];
      case 'interests':
        return [
          {
            id: 'int-' + Date.now(),
            name: '',
            keywords: [],
          },
        ];
      case 'profil':
        // For profil, create a content-based section like summary
        return [
          {
            id: 'profil-' + Date.now(),
            content: '',
          },
        ];
      case 'summary':
        // For summary, we update the basics instead of creating items
        setValue('data.basics.summary', '');
        return [];
      default:
        return [
          {
            id: sectionType + '-' + Date.now(),
            title: '',
            description: '',
          },
        ];
    }
  };

  // Right-click context menu handler (for CV-wide actions)
  const handleCVRightClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Context menu triggered on right-click');
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setShowContextMenu(true);
  }, []);

  // This handler is being called on left-click from the template - let's make it work for options menu
  const handleItemContextMenu = useCallback(
    (event: React.MouseEvent, itemId: string) => {
      event.preventDefault();
      event.stopPropagation();

      console.log('Section left-clicked for:', itemId, 'Button:', event.button);

      // This is actually being called on left-click, so let's use it for the options menu
      setOptionsMenuPosition({ x: event.clientX, y: event.clientY });
      setShowOptionsMenu(true);
      setSelectedSection(itemId);
    },
    []
  );

  const handleCopyCV = useCallback(() => {
    console.log('Copying CV...');
    // Implement CV copy functionality
  }, []);

  const handleAdaptForJob = useCallback(() => {
    console.log('Adapting CV for job...');
    // Implement job adaptation functionality
  }, []);

  const handleTranslateCV = useCallback(() => {
    console.log('Translating CV...');
    // Implement translation functionality
  }, []);

  const handleEditCV = useCallback(() => {
    console.log('Editing CV...');
    // Implement CV editing functionality
  }, []);

  const handleNewCoverLetter = useCallback(() => {
    console.log('Creating new cover letter...');
    // Implement cover letter creation functionality
  }, []);

  // Field visibility handlers
  const handleFieldVisibilityUpdate = useCallback(
    (fieldVisibility: Record<string, boolean>) => {
      console.log('Field visibility updated:', fieldVisibility);
      // Implement field visibility update
    },
    []
  );

  // Options menu handlers
  const handleOptionsMenuClose = useCallback(() => {
    setShowOptionsMenu(false);
  }, []);

  const handleAddEntry = useCallback(() => {
    console.log('Add entry to section:', selectedSection);
    // Implement add entry logic
  }, [selectedSection]);

  const handleAddDate = useCallback(() => {
    console.log('Add date to section:', selectedSection);
    // Implement add date logic
  }, [selectedSection]);

  const handleDuplicate = useCallback(() => {
    console.log('Duplicate section:', selectedSection);
    // Implement duplicate section logic
  }, [selectedSection]);

  const handleMoveUp = useCallback(() => {
    console.log('Move up section:', selectedSection);
    // Implement move up logic
  }, [selectedSection]);

  const handleMoveDown = useCallback(() => {
    console.log('Move down section:', selectedSection);
    // Implement move down logic
  }, [selectedSection]);

  const handleDeleteSection = useCallback(() => {
    console.log('Delete section:', selectedSection);
    // Implement delete section logic
  }, [selectedSection]);

  const applyCvDataToResume = useCallback(
    (cvData: CVData) => {
      setValue('data.basics.name', cvData.content.personalInfo.fullName || '');
      setValue('data.basics.email', cvData.content.personalInfo.email || '');
      setValue('data.basics.phone', cvData.content.personalInfo.phone || '');
      setValue('data.basics.summary', cvData.content.summary || '');
      setValue(
        'data.basics.link',
        cvData.content.personalInfo.urls?.[0]?.url || ''
      );

      if (cvData.content.personalInfo.location) {
        setValue(
          'data.basics.location.city',
          cvData.content.personalInfo.location.city || ''
        );
        setValue(
          'data.basics.location.country',
          cvData.content.personalInfo.location.country || ''
        );
      }

      const experiences = cvData.content.experiences.map((exp, index) => ({
        id: `exp-${index + 1}`,
        position: exp.title || '',
        workplace: exp.company || '',
        description: exp.description || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        link: '',
        highlights: exp.achievements?.length
          ? exp.achievements
          : exp.skills?.length
          ? exp.skills
          : [''],
        companyLogo: '',
      }));

      const education = cvData.content.education.map((edu, index) => ({
        id: `edu-${index + 1}`,
        degree: edu.degree || '',
        institution: edu.school || '',
        location: edu.location || '',
        gpa: '',
        maxGpa: '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        bullets: edu.description ? [edu.description] : [''],
      }));

      const skills = cvData.content.skills.map((skill, index) => ({
        id: `skill-${index + 1}`,
        name: skill.name,
      }));

      if (experiences.length > 0) {
        setValue('data.sections.experience.items', experiences);
      }
      if (education.length > 0) {
        setValue('data.sections.education.items', education);
      }
      if (skills.length > 0) {
        setValue('data.sections.skills.items', skills);
      }
    },
    [setValue]
  );

  const handleImportCvFile = useCallback(
    async (file: File) => {
      setImportError(null);
      try {
        const data = await parseCV.mutateAsync(file);
        if (!data.success) {
          throw new Error(data.message || "Erreur lors de l'import du CV");
        }
        applyCvDataToResume(data.data as CVData);
        setShowImportModal(false);
      } catch (error) {
        setImportError(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'import du CV"
        );
      }
    },
    [applyCvDataToResume, parseCV]
  );

  const handleImportLinkedIn = useCallback(async () => {
    if (!importedLinkedInUrl.trim()) {
      setImportError('Ajoutez une URL LinkedIn valide.');
      return;
    }
    setImportError(null);
    try {
      const data = await parseLinkedIn.mutateAsync(importedLinkedInUrl);
      if (!data.success) {
        throw new Error(data.message || "Erreur lors de l'import LinkedIn");
      }
      applyCvDataToResume(data.data as CVData);
      setShowImportModal(false);
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'import LinkedIn"
      );
    }
  }, [applyCvDataToResume, importedLinkedInUrl, parseLinkedIn]);

  if (!resume) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin'></div>
          <p className='text-gray-600'>Chargement du CV...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* EnhanceCV Floating Sidebar */}
      <EnhanceCVSidebar
        onAddSection={handleOpenSectionSelector}
        onRearrangeSections={handleRearrangeSections}
        onSelectTemplate={handleSelectTemplate}
        onDesignSettings={handleDesignSettings}
        onTextReview={handleTextReview}
        onATSCheck={handleATSCheck}
        onDownload={handleDownload}
        onDownloadPPTX={handleDownloadPPTX}
        onShare={handleShare}
        onHistory={handleHistory}
        onBrandingToggle={handleBrandingToggle}
        textErrorsCount={textErrorsCount}
        brandingEnabled={brandingEnabled}
        canUndo={false}
        canRedo={false}
      />

      {/* Template & Design Sidebar */}
      <TemplateDesignSidebar
        isOpen={showTemplateDesignSidebar}
        onClose={() => setShowTemplateDesignSidebar(false)}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        onDesignChange={handleDesignChange}
        defaultActiveSection={templateDesignActiveSection}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 bg-gray-50 transition-all duration-300 ${
          showTemplateDesignSidebar ? 'mr-96' : 'mr-0'
        }`}
      >
        <div className='flex flex-col items-center justify-center h-full p-8 gap-6'>
          <div className='flex w-full max-w-4xl items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Générateur de CV
              </h2>
              <p className='text-sm text-gray-500'>
                Importez un CV ou un LinkedIn pour pré-remplir le dossier.
              </p>
            </div>
            <Button
              onClick={() => setShowImportModal(true)}
              className='gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700'
            >
              <UploadCloud className='h-4 w-4' />
              Importer un CV
            </Button>
          </div>

          {/* CV Direct Integration */}
          <div className='relative w-full max-w-4xl'>
            {/* Preview Button (attached to CV) */}
            <motion.button
              onClick={handlePreviewToggle}
              className='absolute z-30 p-2 transition-all bg-white border border-gray-200 rounded-full shadow-lg -top-3 -right-3 hover:shadow-xl'
              title='Aperçu du Document'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ right: '-40px', top: '0px' }}
            >
              <Eye className='w-4 h-4 text-gray-600' />
            </motion.button>
            <div
              className='relative overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-xl'
              onContextMenu={handleCVRightClick}
            >
              {/* CV Template Direct Render */}
              <div ref={cvRef} className='p-8 min-h-[900px]'>
                {resume && (
                  <CVTemplateWithEditing
                    resume={resume}
                    onUpdate={updateResumeField}
                    onEditingStateChange={setIsEditingCV}
                    onContextMenu={handleItemContextMenu}
                    selectedTemplate={selectedTemplate}
                    designSettings={designSettings}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title='Importer un CV'
        size='lg'
      >
        <div className='p-6 space-y-6'>
          <div className='space-y-2'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Importer un fichier
            </h3>
            <label className='flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-gray-300'>
              <span className='flex items-center gap-2'>
                <UploadCloud className='h-4 w-4' />
                Choisir un CV (PDF/DOCX)
              </span>
              <input
                type='file'
                className='hidden'
                accept='.pdf,.doc,.docx'
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleImportCvFile(file);
                  }
                }}
              />
            </label>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Importer depuis LinkedIn
            </h3>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Input
                placeholder='https://www.linkedin.com/in/...'
                value={importedLinkedInUrl}
                onChange={(event) => setImportedLinkedInUrl(event.target.value)}
              />
              <Button
                variant='outline'
                onClick={handleImportLinkedIn}
                disabled={importing}
                className='gap-2'
              >
                <LinkIcon className='h-4 w-4' />
                Importer
              </Button>
            </div>
          </div>

          {importError && (
            <div className='rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600'>
              {importError}
            </div>
          )}

          {importing && (
            <div className='rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-600'>
              Import en cours...
            </div>
          )}

          <div className='text-xs text-gray-500'>
            Les données importées pré-remplissent le dossier de compétences et
            restent éditables.
          </div>
        </div>
      </Modal>

      {/* Modals */}
      <AnimatePresence>
        {showSectionSelector && (
          <SectionSelectorModal
            isOpen={showSectionSelector}
            onClose={() => setShowSectionSelector(false)}
            onAddSection={handleAddSection}
            existingSections={getExistingSections()}
          />
        )}

        {showRearrangeModal && (
          <RearrangeSectionsModal
            isOpen={showRearrangeModal}
            onClose={() => setShowRearrangeModal(false)}
          />
        )}

        {showPhotoModal && (
          <PhotoUploadModal
            isOpen={showPhotoModal}
            onClose={() => setShowPhotoModal(false)}
            onPhotoUpload={handlePhotoUpload}
            currentPhoto={resume?.data?.basics?.photo}
            currentShape={resume?.data?.basics?.photoShape || 'round'}
          />
        )}

        {showFieldVisibilityModal && (
          <FieldVisibilityModal
            isOpen={showFieldVisibilityModal}
            onClose={() => setShowFieldVisibilityModal(false)}
            sectionType={selectedSection}
            sectionTitle={`Section ${selectedSection}`}
            onUpdateVisibility={handleFieldVisibilityUpdate}
          />
        )}

        {showContextMenu && (
          <ContextMenu
            isOpen={showContextMenu}
            onClose={() => setShowContextMenu(false)}
            onCopy={handleCopyCV}
            onAdaptForJob={handleAdaptForJob}
            onTranslate={handleTranslateCV}
            onEdit={handleEditCV}
            onNewCover={handleNewCoverLetter}
            position={contextMenuPosition}
          />
        )}

        {showOptionsMenu && (
          <OptionsMenu
            isOpen={showOptionsMenu}
            onClose={handleOptionsMenuClose}
            onAddEntry={handleAddEntry}
            onAddDate={handleAddDate}
            onDelete={handleDeleteSection}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            position={optionsMenuPosition}
            sectionType={selectedSection}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function CVBuilderEnhanceCVPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CVBuilderContent />
    </Suspense>
  );
}
