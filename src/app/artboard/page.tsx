'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';

import { SectionKey } from '@/lib/reactive-resume-schema';
import { convertResumeToResumeData } from '@/lib/resume-converter';

import { getTemplateComponent, TemplateId } from '@/components/templates';

import { useArtboardStore } from '@/stores/artboard';
import { Resume } from '@/stores/resume-simple';

// Configuration des thèmes pour chaque template
const _getTemplateTheme = (templateId: string) => {
  const themes = {
    onyx: { primary: '#dc2626' },
    'modern-blue': { primary: '#2563eb' },
    'classic-dark': { primary: '#1f2937' },
    'creative-purple': { primary: '#7c3aed' },
    'minimal-green': { primary: '#059669' },
    'executive-navy': { primary: '#1e40af' },
    'creative-orange': { primary: '#ea580c' },
    azurill: { primary: '#06b6d4' },
    bronzor: { primary: '#a3a3a3' },
    chikorita: { primary: '#65a30d' },
    gengar: { primary: '#6b21a8' },
    glalie: { primary: '#0891b2' },
  };
  return themes[templateId as keyof typeof themes] || themes.onyx;
};

// Configuration des polices pour chaque template
const _getTemplateFont = (templateId: string) => {
  const fonts = {
    onyx: 'IBM Plex Serif, serif',
    'modern-blue': 'Inter, sans-serif',
    'classic-dark': 'Georgia, serif',
    'creative-purple': 'Poppins, sans-serif',
    'minimal-green': 'system-ui, sans-serif',
    'executive-navy': 'Playfair Display, serif',
    'creative-orange': 'Montserrat, sans-serif',
    azurill: 'Open Sans, sans-serif',
    bronzor: 'Times New Roman, serif',
    chikorita: 'Roboto, sans-serif',
    gengar: 'Crimson Text, serif',
    glalie: 'Lato, sans-serif',
  };
  return fonts[templateId as keyof typeof fonts] || fonts.onyx;
};

export default function ArtboardPage() {
  const { resume, setResume } = useArtboardStore();
  const scaleRef = useRef(1);
  const [selectedTemplate, setSelectedTemplate] = useState('onyx');
  const [isEditable, setIsEditable] = useState(false);
  const [_editingField, _setEditingField] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('🖼️ Artboard useEffect initialized');

    // Vérifier si on est en mode éditable depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const editableParam = urlParams.get('editable');
    setIsEditable(editableParam === 'true');
    console.log('✏️ Editable mode:', editableParam === 'true');

    // Écouter les messages PostMessage du builder
    const handleMessage = (event: MessageEvent) => {
      console.log('📥 Artboard received message:', event.data);

      if (event.data.type === 'SET_RESUME') {
        console.log('✅ Setting resume data:', event.data.payload);
        const resumeData = event.data.payload as Resume;

        // Extraire le template sélectionné
        const templateId = resumeData.data?.metadata?.template || 'onyx';
        setSelectedTemplate(templateId);
        console.log('🎨 Setting template to:', templateId);

        // Convertir les données au format Reactive-Resume
        const convertedData = convertResumeToResumeData(resumeData);
        console.log('🔄 Converted resume data:', convertedData);
        setResume(convertedData);
      }
      if (event.data.type === 'SET_SCALE') {
        scaleRef.current = event.data.payload;
      }
      if (event.data.type === 'UPDATE_FIELD') {
        const { field, value } = event.data.payload;
        updateResumeField(field, value);
      }
    };

    window.addEventListener('message', handleMessage);

    // Envoyer un message pour indiquer que l'artboard est prêt
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ARTBOARD_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setResume]);

  // Fonction pour mettre à jour un champ du CV
  const updateResumeField = (field: string, value: string) => {
    if (!resume) return;

    const updatedResume = { ...resume };
    const fieldParts = field.split('.');

    // Navigation dans l'objet pour mettre à jour le champ
    let current: any = updatedResume;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      if (!current[fieldParts[i]]) {
        current[fieldParts[i]] = {};
      }
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;

    setResume(updatedResume);

    // Envoyer la mise à jour au parent
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'FIELD_UPDATED',
          payload: { field, value, resume: updatedResume },
        },
        '*'
      );
    }
  };

  // Fonction pour rendre les éléments éditables
  const makeElementsEditable = () => {
    if (!isEditable) return;

    // Attendre que le DOM soit rendu
    setTimeout(() => {
      // Identifier et marquer les éléments éditables
      const editableSelectors = [
        'h1',
        'h2',
        'h3',
        'h4', // Titres
        '.text-2xl',
        '.text-xl',
        '.text-lg', // Tailles de texte
        'p',
        'span',
        'div', // Textes
      ];

      editableSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const text = element.textContent?.trim();
          if (
            text &&
            text.length > 2 &&
            !element.getAttribute('data-editable')
          ) {
            // Identifier le type de contenu pour déterminer le champ
            let field = 'unknown';

            // Déterminer le champ basé sur le contenu et le contexte
            if (text.includes('@') && text.includes('.')) {
              field = 'basics.email';
            } else if (text.includes('+') || /\d{2,}/.test(text)) {
              field = 'basics.phone';
            } else if (
              element.classList.contains('text-2xl') ||
              element.classList.contains('text-4xl')
            ) {
              field = 'basics.name';
            } else if (element.tagName.toLowerCase().startsWith('h')) {
              field = `section.${element.tagName.toLowerCase()}.title`;
            } else {
              field = `content.${index}`;
            }

            element.setAttribute('data-editable', field);
            element.setAttribute('data-original', text);

            // Ajouter les styles hover
            element.classList.add('editable-element');

            // Ajouter l'événement click
            element.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              editElement(element as HTMLElement, field, text);
            });
          }
        });
      });
    }, 500);
  };

  // Fonction pour éditer un élément
  const editElement = (
    element: HTMLElement,
    field: string,
    currentValue: string
  ) => {
    const newValue = prompt('Modifier le contenu:', currentValue);
    if (newValue !== null && newValue !== currentValue) {
      element.textContent = newValue;
      updateResumeField(field, newValue);
    }
  };

  // Exécuter makeElementsEditable quand le resume change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditable && resume) {
      makeElementsEditable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable, resume]);

  console.log(
    '🎨 Rendering template:',
    selectedTemplate,
    'with resume data:',
    !!resume
  );

  // Convertir ResumeData vers Resume format
  const convertToResume = (resumeData: any): Resume => {
    return {
      id: 'temp-resume',
      title: 'Mon CV',
      data: {
        basics: {
          name: resumeData.basics?.name || 'Jean Dupont',
          label: resumeData.basics?.headline || 'Développeur Full Stack',
          email: resumeData.basics?.email || 'jean.dupont@email.com',
          phone: resumeData.basics?.phone || '+33 6 12 34 56 78',
          summary: resumeData.basics?.summary || '',
          location: {
            city: resumeData.basics?.location || 'Paris',
            country: 'France',
            countryCode: 'FR',
          },
        },
        sections: resumeData.sections || {},
        metadata: resumeData.metadata || {
          template: 'onyx',
          layout: [[['summary'], ['experience', 'education'], ['skills']]],
          css: { value: '', visible: false },
          theme: { primary: '#dc2626', background: '#ffffff', text: '#000000' },
          typography: {
            font: {
              family: 'IBM Plex Serif',
              subset: 'latin',
              variants: ['regular'],
              size: 14,
            },
            lineHeight: 1.5,
            hideIcons: false,
            underlineLinks: true,
          },
          page: {
            margin: 18,
            format: 'a4' as const,
            options: { breakLine: true, pageNumbers: false },
          },
          notes: '',
        },
      },
    };
  };

  // Utiliser le template approprié selon le template sélectionné
  const renderTemplate = () => {
    console.log(
      '🎯 Rendering template:',
      selectedTemplate,
      'with resume:',
      !!resume
    );

    if (!resume) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          Chargement...
        </div>
      );
    }

    // Obtenir le composant du template sélectionné
    const TemplateComponent = getTemplateComponent(
      selectedTemplate as TemplateId
    );

    // Certains templates utilisent l'ancien format avec columns (comme Onyx)
    // D'autres utilisent le nouveau format avec resume (comme Ditto)
    if (selectedTemplate === 'onyx') {
      // Template Onyx utilise le format avec columns
      const layout: SectionKey[][] = resume?.metadata?.layout?.[0] || [
        ['summary', 'experience', 'education'],
        ['skills', 'projects', 'languages', 'interests'],
      ];
      return <TemplateComponent columns={layout} isFirstPage={true} />;
    } else {
      // Autres templates utilisent le format avec resume
      const resumeObject = convertToResume(resume);
      return <TemplateComponent resume={resumeObject} isFirstPage={true} />;
    }
  };

  try {
    return (
      <div
        className='min-h-screen bg-gray-100'
        style={{
          transform: `scale(${scaleRef.current})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Custom CSS pour les templates */}
        <style jsx global>{`
          .p-custom {
            padding: ${resume?.metadata?.page?.margin || 18}px;
          }

          /* Couleurs dynamiques basées sur les métadonnées */
          .text-primary {
            color: ${resume?.metadata?.theme?.primary || '#dc2626'};
          }
          .border-primary {
            border-color: ${resume?.metadata?.theme?.primary || '#dc2626'};
          }
          .bg-primary {
            background-color: ${resume?.metadata?.theme?.primary || '#dc2626'};
          }

          /* Police dynamique basée sur les métadonnées */
          body,
          * {
            font-family: ${resume?.metadata?.typography?.font?.family ||
              'IBM Plex Serif'},
              ${resume?.metadata?.typography?.font?.family?.includes('Mono')
                ? 'monospace'
                : 'serif'};
            font-size: ${resume?.metadata?.typography?.font?.size || 14}px;
            line-height: ${resume?.metadata?.typography?.lineHeight || 1.5};
          }

          .size-3 {
            width: 0.75rem;
            height: 0.75rem;
          }
          .wysiwyg {
            line-height: ${resume?.metadata?.typography?.lineHeight || 1.6};
          }
          .wysiwyg p {
            margin-bottom: 0.5rem;
          }

          /* Phosphor Icons fallback */
          .ph {
            display: ${resume?.metadata?.typography?.hideIcons
              ? 'none'
              : 'inline-block'};
            width: 1em;
            height: 1em;
            font-style: normal;
          }
          .ph-bold:before {
            content: '●';
          }
          .ph-map-pin:before {
            content: '📍';
          }
          .ph-phone:before {
            content: '📞';
          }
          .ph-at:before {
            content: '@';
          }
          .ph-link:before {
            content: '🔗';
          }
          .ph-globe:before {
            content: '🌐';
          }

          /* Styles pour l'édition inline */
          ${isEditable
            ? `
            .editable-element {
              cursor: pointer;
              transition: all 0.2s ease;
              border-radius: 4px;
              padding: 2px 4px;
              margin: -2px -4px;
            }
            .editable-element:hover {
              background-color: rgba(59, 130, 246, 0.1);
              outline: 2px solid rgba(59, 130, 246, 0.5);
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            }
            .editable-element:before {
              content: '✏️';
              position: absolute;
              right: -20px;
              top: -5px;
              background: #3b82f6;
              color: white;
              font-size: 10px;
              padding: 2px 4px;
              border-radius: 3px;
              opacity: 0;
              transition: opacity 0.2s ease;
              pointer-events: none;
            }
            .editable-element:hover:before {
              opacity: 1;
            }
          `
            : ''}
        `}</style>

        <div
          className={`max-w-4xl mx-auto bg-white shadow-lg ${
            isEditable ? 'relative' : ''
          }`}
        >
          {isEditable && (
            <div className='fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg'>
              ✏️ Mode édition - Cliquez sur les textes pour les modifier
            </div>
          )}
          {renderTemplate()}
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Template rendering error:', error);
    return (
      <div className='flex items-center justify-center min-h-screen bg-red-50'>
        <div className='p-8 text-center'>
          <h2 className='mb-4 text-xl font-bold text-red-800'>
            Erreur de rendu du template
          </h2>
          <p className='mb-4 text-red-600'>
            Il y a eu une erreur lors du rendu du CV.
          </p>
          <pre className='max-w-lg p-2 overflow-auto text-xs text-red-500 bg-red-100 rounded'>
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </pre>
          <div className='mt-4'>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700'
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }
}
