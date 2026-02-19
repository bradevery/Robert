'use client';

import React, { useCallback, useMemo } from 'react';

import { SectionKey } from '@/lib/reactive-resume-schema';

import { DragDropLayout } from '@/components/ui/DragDropLayout';

import { useResumeStore } from '@/stores/resume-simple';

interface DragDropLayoutEditorProps {
  className?: string;
}

export const DragDropLayoutEditor: React.FC<DragDropLayoutEditorProps> = ({
  className = '',
}) => {
  const { resume, setLayout, updateSectionVisibility } = useResumeStore();

  // Configuration des sections disponibles avec leurs noms en français
  const sectionNames: Record<SectionKey, string> = {
    basics: 'Informations personnelles',
    summary: 'Résumé professionnel',
    experience: 'Expérience professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    projects: 'Projets',
    awards: 'Récompenses',
    certifications: 'Certifications',
    publications: 'Publications',
    volunteer: 'Bénévolat',
    languages: 'Langues',
    interests: "Centres d'intérêt",
    references: 'Références',
    profiles: 'Profils sociaux',
  };

  // Obtenir le layout actuel du CV
  const currentLayout = useMemo(() => {
    // Si le layout existe dans les métadonnées, l'utiliser
    if (
      resume?.data?.metadata?.layout &&
      Array.isArray(resume.data.metadata.layout[0])
    ) {
      return resume.data.metadata.layout[0];
    }

    // Layout par défaut si aucun n'existe
    return [
      ['summary', 'experience', 'education'],
      ['skills', 'projects', 'languages', 'interests'],
    ];
  }, [resume?.data?.metadata?.layout]);

  // Obtenir toutes les sections disponibles avec leur statut de visibilité
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableSections = useMemo(() => {
    const allSectionKeys: SectionKey[] = [
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'awards',
      'certifications',
      'publications',
      'volunteer',
      'languages',
      'interests',
      'references',
      'profiles',
    ];

    return allSectionKeys.map((sectionId) => ({
      id: sectionId,
      name: sectionNames[sectionId] || sectionId,
      visible: resume?.data?.sections?.[sectionId]?.visible ?? true,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.data?.sections]);

  // Gérer les changements de layout
  const handleLayoutChange = useCallback(
    (newLayout: SectionKey[][]) => {
      if (!resume) return;

      // Mettre à jour les métadonnées avec le nouveau layout
      setLayout([newLayout]); // Reactive-Resume utilise un tableau de layouts pour les pages
    },
    [resume, setLayout]
  );

  // Gérer le changement de visibilité des sections
  const handleToggleVisibility = useCallback(
    (sectionId: SectionKey) => {
      if (!resume?.data?.sections?.[sectionId]) return;

      const currentVisibility = resume.data.sections[sectionId].visible;
      updateSectionVisibility(sectionId, !currentVisibility);
    },
    [resume, updateSectionVisibility]
  );

  // Présets de layout pour différents types de CV
  const layoutPresets = [
    {
      name: 'Classique (2 colonnes)',
      description: 'Layout traditionnel avec colonne principale et sidebar',
      layout: [
        ['summary', 'experience', 'education', 'projects'],
        ['skills', 'languages', 'interests', 'certifications'],
      ],
    },
    {
      name: 'Moderne (3 colonnes)',
      description: 'Layout équilibré sur 3 colonnes',
      layout: [
        ['summary', 'experience'],
        ['education', 'projects'],
        ['skills', 'languages', 'interests'],
      ],
    },
    {
      name: 'Compact',
      description: 'Toutes les sections en une colonne',
      layout: [
        [
          'summary',
          'experience',
          'education',
          'skills',
          'projects',
          'languages',
        ],
      ],
    },
    {
      name: 'Focus Technique',
      description: 'Optimisé pour les profils techniques',
      layout: [
        ['summary', 'skills', 'projects', 'experience'],
        ['education', 'certifications', 'languages'],
      ],
    },
  ];

  const applyPreset = (preset: (typeof layoutPresets)[0]) => {
    handleLayoutChange(preset.layout);
  };

  if (!resume) {
    return (
      <div className={`p-6 ${className}`}>
        <div className='text-center text-gray-500'>Aucun CV chargé</div>
      </div>
    );
  }

  return (
    <div className={`drag-drop-layout-editor ${className}`}>
      {/* En-tête avec titre et actions */}
      <div className='mb-6 border-b border-gray-200 pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-800'>
              Éditeur de Layout
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              Organisez les sections de votre CV par glisser-déposer
            </p>
          </div>

          <div className='flex items-center space-x-3'>
            {/* Indicateur du nombre de colonnes */}
            <div className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded'>
              {currentLayout.length} colonne
              {currentLayout.length !== 1 ? 's' : ''}
            </div>

            {/* Bouton Reset */}
            <button
              onClick={() =>
                handleLayoutChange([
                  ['summary', 'experience', 'education'],
                  ['skills', 'projects', 'languages'],
                ])
              }
              className='px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors'
            >
              <i className='ph ph-bold ph-arrow-counter-clockwise mr-1' />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Presets de layout */}
      <div className='mb-8'>
        <h3 className='text-lg font-medium text-gray-800 mb-4'>
          Templates de Layout
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
          {layoutPresets.map((preset, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => applyPreset(preset)}
            >
              <h4 className='font-medium text-gray-800 mb-2'>{preset.name}</h4>
              <p className='text-xs text-gray-600 mb-3'>{preset.description}</p>

              {/* Visualisation miniature du layout */}
              <div
                className='grid gap-1'
                style={{
                  gridTemplateColumns: `repeat(${preset.layout.length}, 1fr)`,
                }}
              >
                {preset.layout.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className='bg-gray-100 rounded p-1 min-h-[40px]'
                  >
                    {column.slice(0, 3).map((_, sectionIndex) => (
                      <div
                        key={sectionIndex}
                        className='bg-primary/20 h-2 rounded mb-1 last:mb-0'
                      />
                    ))}
                    {column.length > 3 && (
                      <div className='text-xs text-gray-500 text-center'>
                        +{column.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Éditeur de drag & drop principal */}
      <DragDropLayout
        layout={currentLayout}
        onLayoutChange={handleLayoutChange}
        availableSections={availableSections}
        onToggleVisibility={handleToggleVisibility}
        className='mb-8'
      />

      {/* Conseils et aide */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-medium text-blue-800 mb-2 flex items-center'>
          <i className='ph ph-bold ph-lightbulb mr-2' />
          Conseils pour un bon layout
        </h4>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>
            • Placez les informations les plus importantes en haut de la
            première colonne
          </li>
          <li>
            • Équilibrez le contenu entre les colonnes pour un rendu harmonieux
          </li>
          <li>
            • Les sections courtes (langues, compétences) fonctionnent bien en
            sidebar
          </li>
          <li>
            • Masquez les sections vides avec l'icône œil pour un CV plus propre
          </li>
        </ul>
      </div>

      {/* Statistiques du layout */}
      <div className='mt-6 grid grid-cols-3 gap-4 text-center'>
        <div className='bg-gray-50 rounded-lg p-3'>
          <div className='text-2xl font-bold text-gray-800'>
            {availableSections.filter((s) => s.visible).length}
          </div>
          <div className='text-sm text-gray-600'>Sections visibles</div>
        </div>
        <div className='bg-gray-50 rounded-lg p-3'>
          <div className='text-2xl font-bold text-gray-800'>
            {currentLayout.length}
          </div>
          <div className='text-sm text-gray-600'>Colonnes</div>
        </div>
        <div className='bg-gray-50 rounded-lg p-3'>
          <div className='text-2xl font-bold text-gray-800'>
            {currentLayout.reduce((max, col) => Math.max(max, col.length), 0)}
          </div>
          <div className='text-sm text-gray-600'>Max par colonne</div>
        </div>
      </div>
    </div>
  );
};
