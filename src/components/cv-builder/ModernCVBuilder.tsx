'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Languages,
  Layers,
  Maximize2,
  Minimize2,
  Palette,
  Rocket,
  Save,
  Share2,
  Star,
  Trophy,
  Unlock,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { useCVStore } from '@/stores/cv-store-unified';

import { AchievementEditor } from './AchievementEditor';
import { ActivityEditor } from './ActivityEditor';
import { AIEnhancementPanel } from './AIEnhancementPanel';
import { CertificationsEditorUnified } from './CertificationsEditorUnified';
import { CourseEditor } from './CourseEditor';
import { EducationEditorUnified } from './EducationEditorUnified';
import { LanguagesEditor } from './LanguagesEditor';
import { MissionEditor } from './MissionEditor';
import { PassionEditor } from './PassionEditor';
import { PersonalNotes } from './PersonalNotes';
import { SharingPanel } from './SharingPanel';
import { TalentEditor } from './TalentEditor';
import { TechnologyEditor } from './TechnologyEditor';
import { DossierTemplate } from './templates/DossierTemplate';
import {
  UndoRedoButtons,
  UndoRedoProvider,
  useUndoRedoKeyboard,
} from './UndoRedoProvider';
import { UnifiedEditor } from './UnifiedEditor';

interface ModernCVBuilderProps {
  onBack?: () => void;
  className?: string;
}

export const ModernCVBuilder: React.FC<ModernCVBuilderProps> = ({
  onBack,
  className = '',
}) => {
  const [activePanel, setActivePanel] = useState<
    'content' | 'design' | 'ai' | 'share' | 'notes'
  >('content');
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [_showMobileMenu, _setShowMobileMenu] = useState(false);

  const {
    cv,
    loading,
    error,
    selectedSection,
    isDirty,
    setSelectedSection,
    createNewCV,
    updateBasics,
    updateCompany,
    reorderItems,
    updateTheme,
    updateNotes,
    saveCV,
    exportCV,
    setError,
  } = useCVStore();

  // Initialiser un CV si nécessaire
  useEffect(() => {
    if (!cv) {
      createNewCV();
    }
  }, [cv, createNewCV]);

  // Gestion des raccourcis clavier
  useUndoRedoKeyboard();

  // Auto-sauvegarde
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        saveCV();
      }, 2000); // Auto-sauvegarde après 2 secondes d'inactivité

      return () => clearTimeout(timer);
    }
  }, [isDirty, saveCV]);

  // Configuration des sections
  const sections = [
    { id: 'company', name: 'Entreprise (ESN)', icon: Building2 }, // En-tête entreprise
    { id: 'basics', name: 'Infos & Synthèse', icon: Users },
    { id: 'experience', name: 'Missions & Expérience', icon: Briefcase },
    { id: 'education', name: 'Formation', icon: GraduationCap },
    { id: 'technology', name: 'Compétences Techniques', icon: Layers },
    { id: 'certifications', name: 'Certifications', icon: Award },
    { id: 'languages', name: 'Langues', icon: Languages },
    { id: 'projects', name: 'Projets Personnels', icon: Rocket },
    { id: 'talent', name: 'Soft Skills', icon: Star },
    { id: 'achievement', name: 'Réalisations', icon: Trophy },
    { id: 'courses', name: 'Cours', icon: BookOpen },
    { id: 'interests', name: "Centres d'intérêt", icon: Heart },
    { id: 'passion', name: 'Passions', icon: Heart },
    { id: 'awards', name: 'Récompenses', icon: Trophy },
    { id: 'volunteer', name: 'Bénévolat', icon: Globe },
  ];

  // Configuration des éditeurs génériques
  const getEditorConfig = (sectionId: string) => {
    const configs = {
      education: {
        title: 'Formation',
        icon: GraduationCap,
        fields: [
          {
            key: 'degree',
            label: 'Diplôme',
            type: 'text' as const,
            required: true,
          },
          {
            key: 'institution',
            label: 'Établissement',
            type: 'text' as const,
            required: true,
          },
          { key: 'location', label: 'Lieu', type: 'text' as const },
          {
            key: 'startDate',
            label: 'Date de début',
            type: 'date' as const,
            required: true,
          },
          { key: 'endDate', label: 'Date de fin', type: 'date' as const },
          { key: 'summary', label: 'Description', type: 'textarea' as const },
        ],
        createNew: () => ({
          id: `edu_${Date.now()}`,
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          summary: '',
          visible: true,
        }),
        getDisplayText: (item: any) => `${item.degree} - ${item.institution}`,
        getKey: (item: any) => item.id,
      },
      // ... autres configs génériques si besoin
    };

    return configs[sectionId as keyof typeof configs];
  };

  const handleSectionUpdate = useCallback(
    (sectionId: string, items: any[]) => {
      if (cv?.data.sections[sectionId]) {
        reorderItems(sectionId, items);
      }
    },
    [cv, reorderItems]
  );

  const renderContentPanel = () => {
    // Section Entreprise (ESN)
    if (selectedSection === 'company') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='w-5 h-5' />
              Informations Entreprise (ESN)
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Ces informations apparaîtront en en-tête du dossier de compétences
            </p>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Logo Upload */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                Logo & Identité
              </h3>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0'>
                  {cv?.company.logo ? (
                    <div className='relative group'>
                      <img
                        src={cv.company.logo}
                        alt='Logo entreprise'
                        className='w-24 h-24 object-contain border border-gray-200 rounded-lg bg-white p-2'
                      />
                      <button
                        onClick={() => updateCompany({ logo: '' })}
                        className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className='w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors'>
                      <Upload className='w-6 h-6 text-gray-400' />
                      <span className='text-xs text-gray-500 mt-1'>Logo</span>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateCompany({ logo: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className='flex-1 space-y-3'>
                  <div>
                    <label className='text-sm font-medium'>
                      Nom de l'entreprise *
                    </label>
                    <input
                      type='text'
                      value={cv?.company.name || ''}
                      onChange={(e) => updateCompany({ name: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold'
                      placeholder='Ex: Capgemini, Sopra Steria, Alten...'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium'>
                      Slogan / Baseline
                    </label>
                    <input
                      type='text'
                      value={cv?.company.tagline || ''}
                      onChange={(e) =>
                        updateCompany({ tagline: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Ex: Expert en transformation digitale'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                Coordonnées
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Site web</label>
                  <input
                    type='url'
                    value={cv?.company.website || ''}
                    onChange={(e) => updateCompany({ website: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='https://www.entreprise.com'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Email commercial
                  </label>
                  <input
                    type='email'
                    value={cv?.company.email || ''}
                    onChange={(e) => updateCompany({ email: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='contact@entreprise.com'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Téléphone</label>
                  <input
                    type='tel'
                    value={cv?.company.phone || ''}
                    onChange={(e) => updateCompany({ phone: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='+33 1 23 45 67 89'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Adresse</label>
                  <input
                    type='text'
                    value={cv?.company.address || ''}
                    onChange={(e) => updateCompany({ address: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='123 rue de Paris, 75001 Paris'
                  />
                </div>
              </div>
            </div>

            {/* Options d'affichage */}
            <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                Options d'affichage
              </h3>
              <div className='flex flex-col gap-3'>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={cv?.company.showInHeader ?? true}
                    onChange={(e) =>
                      updateCompany({ showInHeader: e.target.checked })
                    }
                    className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm'>
                    Afficher dans l'en-tête du dossier
                  </span>
                </label>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={cv?.company.showInFooter ?? false}
                    onChange={(e) =>
                      updateCompany({ showInFooter: e.target.checked })
                    }
                    className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm'>Afficher dans le pied de page</span>
                </label>
              </div>
              <div>
                <label className='text-sm font-medium'>Couleur de marque</label>
                <div className='flex items-center gap-3 mt-2'>
                  <input
                    type='color'
                    value={cv?.company.color || '#2563eb'}
                    onChange={(e) => updateCompany({ color: e.target.value })}
                    className='w-10 h-10 rounded cursor-pointer border border-gray-300'
                  />
                  <input
                    type='text'
                    value={cv?.company.color || '#2563eb'}
                    onChange={(e) => updateCompany({ color: e.target.value })}
                    className='w-24 px-2 py-1 border border-gray-300 rounded-md text-sm font-mono'
                    placeholder='#2563eb'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (selectedSection === 'basics') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='w-5 h-5' />
              Informations Consultant
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Identité */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                Identité
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Prénom *</label>
                  <input
                    type='text'
                    value={cv?.data.basics.firstName || ''}
                    onChange={(e) =>
                      updateBasics({ firstName: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Nom *</label>
                  <input
                    type='text'
                    value={cv?.data.basics.lastName || ''}
                    onChange={(e) => updateBasics({ lastName: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='text-sm font-medium'>
                    Titre du poste (ex: Lead Dev Java) *
                  </label>
                  <input
                    type='text'
                    value={cv?.data.basics.title || ''}
                    onChange={(e) => updateBasics({ title: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold'
                  />
                </div>
              </div>
            </div>

            {/* Infos B2B / Dossier */}
            <div className='space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100'>
              <h3 className='text-sm font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-2'>
                <Briefcase className='w-4 h-4' />
                Informations Consultant (B2B)
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='text-sm font-medium'>
                    Années d'expérience
                  </label>
                  <input
                    type='text'
                    value={cv?.data.basics.yearsOfExperience || ''}
                    onChange={(e) =>
                      updateBasics({ yearsOfExperience: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: 7 ans'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Niveau</label>
                  <select
                    value={cv?.data.basics.seniorityLevel || ''}
                    onChange={(e) =>
                      updateBasics({ seniorityLevel: e.target.value as any })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                  >
                    <option value=''>Sélectionner...</option>
                    <option value='junior'>Junior (0-2 ans)</option>
                    <option value='confirme'>Confirmé (3-5 ans)</option>
                    <option value='senior'>Senior (6-10 ans)</option>
                    <option value='expert'>Expert (10+ ans)</option>
                    <option value='architect'>Architecte / Lead</option>
                  </select>
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Type de contrat souhaité
                  </label>
                  <select
                    value={cv?.data.basics.contractType || ''}
                    onChange={(e) =>
                      updateBasics({ contractType: e.target.value as any })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                  >
                    <option value=''>Sélectionner...</option>
                    <option value='cdi'>CDI</option>
                    <option value='freelance'>Freelance</option>
                    <option value='portage'>Portage salarial</option>
                    <option value='cdd'>CDD / Mission</option>
                  </select>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Disponibilité</label>
                  <input
                    type='text'
                    value={cv?.data.basics.availability || ''}
                    onChange={(e) =>
                      updateBasics({ availability: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: Immédiate, 1 mois'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Politique télétravail
                  </label>
                  <select
                    value={cv?.data.basics.remotePolicy || ''}
                    onChange={(e) =>
                      updateBasics({ remotePolicy: e.target.value as any })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                  >
                    <option value=''>Sélectionner...</option>
                    <option value='onsite'>Sur site uniquement</option>
                    <option value='hybrid'>Hybride (2-3j/semaine)</option>
                    <option value='full-remote'>Full Remote</option>
                  </select>
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Mobilité géographique
                  </label>
                  <input
                    type='text'
                    value={cv?.data.basics.mobility || ''}
                    onChange={(e) => updateBasics({ mobility: e.target.value })}
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: Ile-de-France, National'
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>
                    TJM / Prétentions salariales
                  </label>
                  <input
                    type='text'
                    value={cv?.data.basics.tjm || ''}
                    onChange={(e) => updateBasics({ tjm: e.target.value })}
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: 550€/jour, 65K€/an'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Habilitations</label>
                  <input
                    type='text'
                    value={cv?.data.basics.habilitations || ''}
                    onChange={(e) =>
                      updateBasics({ habilitations: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: Confidentiel Défense, SECRET'
                  />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium'>Nationalité</label>
                <input
                  type='text'
                  value={cv?.data.basics.nationality || ''}
                  onChange={(e) =>
                    updateBasics({ nationality: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Ex: Française, UE'
                />
              </div>
            </div>

            {/* Contact */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                Contact
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Email *</label>
                  <input
                    type='email'
                    value={cv?.data.basics.email || ''}
                    onChange={(e) => updateBasics({ email: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Téléphone</label>
                  <input
                    type='tel'
                    value={cv?.data.basics.phone || ''}
                    onChange={(e) => updateBasics({ phone: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='text-sm font-medium'>Localisation</label>
                  <input
                    type='text'
                    value={cv?.data.basics.location || ''}
                    onChange={(e) => updateBasics({ location: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>LinkedIn</label>
                  <input
                    type='url'
                    value={cv?.data.basics.link || ''}
                    onChange={(e) => updateBasics({ link: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Synthèse */}
            <div>
              <label className='text-sm font-medium block mb-2'>
                Synthèse Exécutive
              </label>
              <textarea
                value={cv?.data.basics.summary || ''}
                onChange={(e) => updateBasics({ summary: e.target.value })}
                rows={6}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Décrivez votre profil, vos points forts et votre expertise technique en quelques lignes...'
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Use Custom Editors for specific sections
    switch (selectedSection) {
      case 'experience':
        return <MissionEditor />;
      case 'education':
        return <EducationEditorUnified />;
      case 'technology':
        return <TechnologyEditor />;
      case 'certifications':
        return <CertificationsEditorUnified />;
      case 'projects':
        return <ActivityEditor />;
      case 'talent':
        return <TalentEditor />;
      case 'achievement':
        return <AchievementEditor />;
      case 'passion':
        return <PassionEditor />;
      case 'courses':
        return <CourseEditor />;
      case 'languages':
        return <LanguagesEditor />;
    }

    const config = getEditorConfig(selectedSection);
    if (!config || !cv) return null;

    return (
      <UnifiedEditor
        items={cv.data.sections[selectedSection]?.items || []}
        onUpdate={(items) => handleSectionUpdate(selectedSection, items)}
        itemConfig={config}
        allowReorder={true}
        allowVisibility={true}
      />
    );
  };

  const renderDesignPanel = () => (
    <div className='space-y-6'>
      <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
        <h3 className='font-semibold text-blue-800 mb-2'>
          Mode Dossier de Compétences
        </h3>
        <p className='text-sm text-blue-600'>
          Ce constructeur est configuré pour générer un dossier de compétences
          professionnel mono-colonne, optimisé pour les ESN et les freelances.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Palette className='w-5 h-5' />
            Thème Entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Couleur principale
            </label>
            <div className='flex gap-2'>
              {[
                '#dc2626',
                '#2563eb',
                '#059669',
                '#7c3aed',
                '#ea580c',
                '#0891b2',
                '#1f2937',
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ primary: color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    cv?.metadata.theme.primary === color
                      ? 'border-gray-900'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ... (rest of the file remains similar, just replacing Preview with DossierTemplate)

  const panels = {
    content: {
      label: 'Contenu Dossier',
      icon: FileText,
      content: renderContentPanel,
    },
    design: { label: 'Style', icon: Palette, content: renderDesignPanel },
    ai: {
      label: 'Assistant IA',
      icon: Zap,
      content: () => (
        <AIEnhancementPanel
          text={cv?.data.basics.summary || ''}
          onTextChange={(text) => updateBasics({ summary: text })}
          context='résumé professionnel consultant'
        />
      ),
    },
    share: {
      label: 'Partage',
      icon: Share2,
      content: () => (
        <SharingPanel
          resumeId={cv?.id || ''}
          resumeTitle={cv?.title || ''}
          isPublic={cv?.isPublic || false}
          slug={cv?.slug}
          onPublicToggle={(_isPublic) => {
            /* TODO: implémenter */
          }}
        />
      ),
    },
    notes: {
      label: 'Notes',
      icon: FileText,
      content: () => (
        <PersonalNotes
          notes={cv?.metadata.notes || ''}
          onNotesChange={(notes) => updateNotes(notes)}
        />
      ),
    },
  };

  if (!cv) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>Chargement du Dossier...</p>
        </div>
      </div>
    );
  }

  return (
    <UndoRedoProvider initialState={cv}>
      <div className={`modern-cv-builder h-screen flex flex-col ${className}`}>
        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {onBack && (
                <button
                  onClick={onBack}
                  className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
              )}

              <div>
                <h1 className='text-xl font-semibold'>{cv.title}</h1>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-200'
                  >
                    Dossier de Compétences
                  </Badge>
                  {isDirty ? (
                    <span className='text-orange-500 flex items-center gap-1'>
                      <div className='w-2 h-2 bg-orange-500 rounded-full'></div>{' '}
                      Non enregistré
                    </span>
                  ) : (
                    <span className='text-green-500 flex items-center gap-1'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>{' '}
                      Enregistré
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <UndoRedoButtons />

              <Button
                variant='outline'
                size='sm'
                onClick={saveCV}
                disabled={loading || !isDirty}
              >
                <Save className='w-4 h-4 mr-2' />
                Sauvegarder
              </Button>

              <Button size='sm' onClick={exportCV} disabled={loading}>
                <Download className='w-4 h-4 mr-2' />
                Exporter PDF
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Sidebar */}
          <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
            {/* Section Navigation */}
            <div className='p-4 border-b border-gray-200 flex-1 overflow-y-auto'>
              <h3 className='font-medium text-gray-900 mb-3'>
                Sections du Dossier
              </h3>
              <div className='space-y-1'>
                {sections.map((section) => {
                  const Icon = section.icon;
                  const sectionData = cv.data.sections[section.id];
                  const itemCount = sectionData?.items.length || 0;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedSection === section.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <Icon
                          className={`w-4 h-4 ${
                            selectedSection === section.id
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}
                        />
                        <span className='text-sm font-medium'>
                          {section.name}
                        </span>
                      </div>
                      {itemCount > 0 && (
                        <Badge
                          variant='secondary'
                          className={`text-xs ${
                            selectedSection === section.id
                              ? 'bg-blue-500 text-white border-blue-400'
                              : ''
                          }`}
                        >
                          {itemCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Navigation */}
            <div className='p-4 border-t border-gray-200 bg-gray-50'>
              <div className='grid grid-cols-4 gap-2'>
                {Object.entries(panels).map(([key, panel]) => {
                  const Icon = panel.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePanel(key as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                        activePanel === key
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-200'
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                      title={panel.label}
                    >
                      <Icon className='w-5 h-5 mb-1' />
                      <span className='text-[10px] font-medium'>
                        {panel.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Panel */}
          <div className='flex-1 flex flex-col min-w-0 bg-gray-50'>
            {/* Panel Header */}
            <div className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                  {panels[activePanel].icon &&
                    React.createElement(panels[activePanel].icon, {
                      className: 'w-5 h-5 text-blue-600',
                    })}
                  {panels[activePanel].label}
                </h2>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                  >
                    {isPreviewFullscreen ? (
                      <Minimize2 className='w-4 h-4 mr-2' />
                    ) : (
                      <Maximize2 className='w-4 h-4 mr-2' />
                    )}
                    {isPreviewFullscreen ? 'Réduire' : 'Plein écran'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Panel Content */}
            <div className='flex-1 overflow-auto p-6'>
              <div className='max-w-3xl mx-auto'>
                {panels[activePanel].content()}
              </div>
            </div>
          </div>

          {/* Preview Panel - DOSSIER TEMPLATE */}
          {!isPreviewFullscreen && (
            <div className='w-[500px] bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl z-20'>
              <div className='p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 text-white'>
                <h3 className='font-medium flex items-center gap-2'>
                  <Eye className='w-4 h-4 text-green-400' />
                  Aperçu en direct
                </h3>
                <span className='text-xs text-gray-400'>A4 • Mono-colonne</span>
              </div>
              <div className='flex-1 p-6 overflow-auto bg-gray-800/50 backdrop-blur-xl'>
                <div
                  className='origin-top transform scale-[0.55] origin-top-left'
                  style={{ width: '210mm' }}
                >
                  <DossierTemplate cv={cv} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className='bg-red-50 border-t border-red-200 px-6 py-3 absolute bottom-0 w-full z-50'>
            <div className='flex items-center justify-between'>
              <p className='text-red-700 font-medium flex items-center gap-2'>
                <Unlock className='w-4 h-4' />
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className='p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </UndoRedoProvider>
  );
};
