// Design Tokens - Système de couleurs unifié pour les modules
// Basé sur l'architecture plateforme IA Staffing/Recrutement ESN

export const moduleColors = {
  // Espace de travail
  'mode-projet': {
    primary: '#f59e0b',
    light: '#fef3c7',
    text: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-100',
  },
  'mes-dossiers': {
    primary: '#6b7280',
    light: '#f9fafb',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
  },
  'mes-clients': {
    primary: '#6366f1',
    light: '#eef2ff',
    text: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-100',
  },
  'mes-candidats': {
    primary: '#14b8a6',
    light: '#f0fdfa',
    text: 'text-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-100',
  },

  // Modules IA
  'ao-reader': {
    primary: '#3b82f6',
    light: '#eff6ff',
    text: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
  },
  score: {
    primary: '#22c55e',
    light: '#f0fdf4',
    text: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
  },
  'pre-qualif': {
    primary: '#a855f7',
    light: '#faf5ff',
    text: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
  },
  'cv-designer': {
    primary: '#ec4899',
    light: '#fdf2f8',
    text: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-100',
  },
  reviewer: {
    primary: '#ef4444',
    light: '#fef2f2',
    text: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    hover: 'hover:bg-red-100',
  },
  propale: {
    primary: '#f97316',
    light: '#fff7ed',
    text: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-100',
  },
  coach: {
    primary: '#10b981',
    light: '#ecfdf5',
    text: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-100',
  },
  library: {
    primary: '#06b6d4',
    light: '#ecfeff',
    text: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-100',
  },
  chat: {
    primary: '#8b5cf6',
    light: '#f5f3ff',
    text: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    hover: 'hover:bg-violet-100',
  },
} as const;

// Couleurs basées sur les scores de matching
export const scoreColors = {
  excellent: {
    class: 'text-green-600 bg-green-50 border-green-200',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    fill: 'bg-green-500',
    range: { min: 90, max: 100 },
  },
  good: {
    class: 'text-blue-600 bg-blue-50 border-blue-200',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    fill: 'bg-blue-500',
    range: { min: 70, max: 89 },
  },
  average: {
    class: 'text-orange-600 bg-orange-50 border-orange-200',
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    fill: 'bg-orange-500',
    range: { min: 50, max: 69 },
  },
  low: {
    class: 'text-red-600 bg-red-50 border-red-200',
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    fill: 'bg-red-500',
    range: { min: 0, max: 49 },
  },
} as const;

// Helper pour obtenir la catégorie de score
export function getScoreCategory(score: number): keyof typeof scoreColors {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  return 'low';
}

// Helper pour obtenir les classes de couleur d'un score
export function getScoreClasses(score: number) {
  const category = getScoreCategory(score);
  return scoreColors[category];
}

// Status des candidats
export const candidateStatusColors = {
  new: {
    label: 'Nouveau',
    class: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  contacted: {
    label: 'Contacté',
    class: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  qualified: {
    label: 'Qualifié',
    class: 'text-green-600 bg-green-50 border-green-200',
  },
  proposed: {
    label: 'Proposé',
    class: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  placed: {
    label: 'Placé',
    class: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  rejected: {
    label: 'Refusé',
    class: 'text-red-600 bg-red-50 border-red-200',
  },
} as const;

// Status des clients
export const clientStatusColors = {
  prospect: {
    label: 'Prospect',
    class: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  active: {
    label: 'Actif',
    class: 'text-green-600 bg-green-50 border-green-200',
  },
  inactive: {
    label: 'Inactif',
    class: 'text-gray-600 bg-gray-50 border-gray-200',
  },
} as const;

// Status des dossiers/AO
export const dossierStatusColors = {
  draft: {
    label: 'Brouillon',
    class: 'text-gray-600 bg-gray-50 border-gray-200',
  },
  'in-progress': {
    label: 'En cours',
    class: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  submitted: {
    label: 'Soumis',
    class: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  won: {
    label: 'Gagné',
    class: 'text-green-600 bg-green-50 border-green-200',
  },
  lost: {
    label: 'Perdu',
    class: 'text-red-600 bg-red-50 border-red-200',
  },
} as const;

// Disponibilité des candidats
export const availabilityColors = {
  immediate: {
    label: 'Immédiate',
    class: 'text-green-600 bg-green-50 border-green-200',
  },
  '1month': {
    label: '1 mois',
    class: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  '3months': {
    label: '3 mois',
    class: 'text-red-600 bg-red-50 border-red-200',
  },
} as const;

export type ModuleKey = keyof typeof moduleColors;
export type ScoreCategory = keyof typeof scoreColors;
export type CandidateStatus = keyof typeof candidateStatusColors;
export type ClientStatus = keyof typeof clientStatusColors;
export type DossierStatus = keyof typeof dossierStatusColors;
export type Availability = keyof typeof availabilityColors;
