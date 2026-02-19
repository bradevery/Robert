import React from 'react';

import { Resume } from '@/stores/resume-simple';

// Types pour les templates de Reactive-Resume
export type TemplateId =
  | 'onyx'
  | 'azurill'
  | 'bronzor'
  | 'chikorita'
  | 'ditto'
  | 'gengar'
  | 'glalie'
  | 'kakuna'
  | 'nosepass'
  | 'pikachu'
  | 'rhyhorn';

export interface Template {
  id: TemplateId;
  name: string;
  category:
    | 'modern'
    | 'classic'
    | 'creative'
    | 'minimal'
    | 'professional'
    | 'tech'
    | 'fun';
  preview: string;
  component: React.ComponentType<TemplateProps>;
  description?: string;
  features?: string[];
  layout?: 'single' | 'double' | 'triple';
}

export interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

// Import des templates de Reactive-Resume
import { Azurill } from './azurill';
import { Bronzor } from './bronzor';
import { Chikorita } from './chikorita';
import { Ditto } from './ditto';
import { Gengar } from './gengar';
import { Glalie } from './glalie';
import { Kakuna } from './kakuna';
import { Nosepass } from './nosepass';
import { Onyx } from './onyx';
import { Pikachu } from './pikachu';
import { Rhyhorn } from './rhyhorn';

// Registry des templates de Reactive-Resume
export const templates: Record<TemplateId, Template> = {
  onyx: {
    id: 'onyx',
    name: 'Onyx',
    category: 'modern',
    preview: '/templates/onyx-preview.png',
    component: Onyx,
    description:
      'Template moderne et élégant avec une mise en page professionnelle',
    features: [
      'Design moderne',
      'Mise en page flexible',
      'Couleurs personnalisables',
    ],
    layout: 'double',
  },
  azurill: {
    id: 'azurill',
    name: 'Azurill',
    category: 'minimal',
    preview: '/templates/azurill-preview.png',
    component: Azurill,
    description:
      'Template minimaliste avec un design épuré et une excellente lisibilité',
    features: [
      'Design minimaliste',
      'Lisibilité optimale',
      'Layout 2 colonnes',
    ],
    layout: 'double',
  },
  bronzor: {
    id: 'bronzor',
    name: 'Bronzor',
    category: 'classic',
    preview: '/templates/bronzor-preview.png',
    component: Bronzor,
    description:
      'Template classique avec une approche traditionnelle et professionnelle',
    features: [
      'Style classique',
      'Mise en page traditionnelle',
      'Couleurs neutres',
    ],
    layout: 'triple',
  },
  chikorita: {
    id: 'chikorita',
    name: 'Chikorita',
    category: 'creative',
    preview: '/templates/chikorita-preview.png',
    component: Chikorita,
    description:
      'Template créatif avec des couleurs vives et un design dynamique',
    features: ['Design créatif', 'Couleurs vives', 'Éléments graphiques'],
    layout: 'double',
  },
  ditto: {
    id: 'ditto',
    name: 'Ditto',
    category: 'professional',
    preview: '/templates/ditto-preview.png',
    component: Ditto,
    description:
      'Template professionnel avec une mise en page équilibrée et moderne',
    features: [
      'Style professionnel',
      'Mise en page équilibrée',
      'Lisibilité optimale',
    ],
    layout: 'double',
  },
  gengar: {
    id: 'gengar',
    name: 'Gengar',
    category: 'tech',
    preview: '/templates/gengar-preview.png',
    component: Gengar,
    description: 'Template technologique avec un design sombre et moderne',
    features: ['Design tech', 'Thème sombre', 'Effets visuels'],
    layout: 'double',
  },
  glalie: {
    id: 'glalie',
    name: 'Glalie',
    category: 'minimal',
    preview: '/templates/glalie-preview.png',
    component: Glalie,
    description: 'Template minimaliste avec une approche épurée et moderne',
    features: ['Design épuré', 'Layout centré', 'Simplicité'],
    layout: 'single',
  },
  kakuna: {
    id: 'kakuna',
    name: 'Kakuna',
    category: 'tech',
    preview: '/templates/kakuna-preview.png',
    component: Kakuna,
    description: 'Template technique avec un style terminal et monospace',
    features: ['Style terminal', 'Police monospace', 'Design tech'],
    layout: 'double',
  },
  nosepass: {
    id: 'nosepass',
    name: 'Nosepass',
    category: 'classic',
    preview: '/templates/nosepass-preview.png',
    component: Nosepass,
    description:
      'Template classique avec une mise en page centrée et traditionnelle',
    features: ['Style classique', 'Mise en page centrée', 'Police serif'],
    layout: 'single',
  },
  pikachu: {
    id: 'pikachu',
    name: 'Pikachu',
    category: 'fun',
    preview: '/templates/pikachu-preview.png',
    component: Pikachu,
    description:
      'Template ludique avec des couleurs vives et des éléments amusants',
    features: ['Design ludique', 'Couleurs vives', 'Éléments fun'],
    layout: 'double',
  },
  rhyhorn: {
    id: 'rhyhorn',
    name: 'Rhyhorn',
    category: 'professional',
    preview: '/templates/rhyhorn-preview.png',
    component: Rhyhorn,
    description: 'Template professionnel avec un design robuste et moderne',
    features: ['Style professionnel', 'Design robuste', 'Couleurs sombres'],
    layout: 'double',
  },
};

// Helper pour obtenir un template
export const getTemplate = (templateId: TemplateId): Template => {
  return templates[templateId] || templates.onyx;
};

// Helper pour obtenir le composant d'un template
export const getTemplateComponent = (
  templateId: TemplateId
): React.ComponentType<TemplateProps> => {
  return getTemplate(templateId).component;
};

// Helper pour obtenir les templates par catégorie
export const getTemplatesByCategory = (
  category: Template['category']
): Template[] => {
  return Object.values(templates).filter(
    (template) => template.category === category
  );
};

// Helper pour obtenir les templates par layout
export const getTemplatesByLayout = (
  layout: Template['layout']
): Template[] => {
  return Object.values(templates).filter(
    (template) => template.layout === layout
  );
};

// Helper pour obtenir les catégories disponibles
export const getAvailableCategories = (): Template['category'][] => {
  return Array.from(
    new Set(Object.values(templates).map((template) => template.category))
  );
};

// Helper pour obtenir les layouts disponibles
export const getAvailableLayouts = (): Template['layout'][] => {
  return Array.from(
    new Set(Object.values(templates).map((template) => template.layout))
  );
};

// Liste de tous les templates
export const getAllTemplates = (): Template[] => {
  return Object.values(templates);
};

// Helper pour obtenir les templates populaires (premiers templates)
export const getPopularTemplates = (): Template[] => {
  return Object.values(templates).slice(0, 6);
};

// Helper pour obtenir les templates récents (derniers templates)
export const getRecentTemplates = (): Template[] => {
  return Object.values(templates).slice(-6);
};
