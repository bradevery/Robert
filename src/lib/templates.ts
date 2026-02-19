export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'professional' | 'creative' | 'modern' | 'traditional';
  region: 'france' | 'maghreb' | 'international';
  features: string[];
  layout: {
    columns: number;
    headerStyle: 'centered' | 'left' | 'right' | 'banner';
    colorScheme: string[];
    typography: string;
  };
}

export const cvTemplates: CVTemplate[] = [
  // Templates France
  {
    id: 'fr-professional',
    name: 'Professionnel Français',
    description:
      'Template élégant adapté au marché français, format standard A4',
    preview: '📄',
    category: 'professional',
    region: 'france',
    features: [
      'Format A4 standard français',
      'Respect des codes RH français',
      'Photo optionnelle selon secteur',
      'Mise en page sobre et professionnelle',
    ],
    layout: {
      columns: 1,
      headerStyle: 'centered',
      colorScheme: ['#1E40AF', '#3B82F6', '#60A5FA'],
      typography: 'Inter',
    },
  },
  {
    id: 'fr-tech',
    name: 'Tech Moderne France',
    description: 'Conçu pour les développeurs et profils tech en France',
    preview: '💻',
    category: 'modern',
    region: 'france',
    features: [
      'Mise en avant des compétences techniques',
      'Section projets GitHub',
      'Design moderne et épuré',
      'Optimisé pour les ATS français',
    ],
    layout: {
      columns: 2,
      headerStyle: 'left',
      colorScheme: ['#059669', '#10B981', '#34D399'],
      typography: 'Roboto',
    },
  },
  {
    id: 'fr-creative',
    name: 'Créatif Parisien',
    description: 'Pour les métiers créatifs et marketing en France',
    preview: '🎨',
    category: 'creative',
    region: 'france',
    features: [
      'Design audacieux et coloré',
      'Section portfolio visible',
      'Typography moderne',
      'Adapté aux agences parisiennes',
    ],
    layout: {
      columns: 2,
      headerStyle: 'banner',
      colorScheme: ['#7C3AED', '#8B5CF6', '#A78BFA'],
      typography: 'Playfair Display',
    },
  },

  // Templates Maghreb
  {
    id: 'maghreb-professional',
    name: 'Professionnel Maghreb',
    description: 'Template adapté aux normes des entreprises maghrébines',
    preview: '🌟',
    category: 'professional',
    region: 'maghreb',
    features: [
      'Format adapté aux RH maghrébines',
      'Section langues mise en avant',
      'Informations familiales optionnelles',
      'Design respectueux des codes locaux',
    ],
    layout: {
      columns: 1,
      headerStyle: 'centered',
      colorScheme: ['#DC2626', '#EF4444', '#F87171'],
      typography: 'Open Sans',
    },
  },
  {
    id: 'maghreb-international',
    name: 'International Maghreb',
    description: "Pour candidatures vers l'Europe depuis le Maghreb",
    preview: '🌍',
    category: 'modern',
    region: 'maghreb',
    features: [
      'Format européen compatible',
      'Mise en avant de la mobilité',
      'Section visa/permis de travail',
      'Design international moderne',
    ],
    layout: {
      columns: 2,
      headerStyle: 'left',
      colorScheme: ['#0891B2', '#0EA5E9', '#38BDF8'],
      typography: 'Inter',
    },
  },
  {
    id: 'maghreb-francophone',
    name: 'Francophone Maghreb',
    description: 'Optimisé pour le marché francophone depuis le Maghreb',
    preview: '🇫🇷',
    category: 'professional',
    region: 'maghreb',
    features: [
      'Double section langues FR/AR',
      'Expérience internationale valorisée',
      'Format hybride FR/International',
      'Codes couleurs neutres',
    ],
    layout: {
      columns: 1,
      headerStyle: 'left',
      colorScheme: ['#374151', '#4B5563', '#6B7280'],
      typography: 'Inter',
    },
  },

  // Templates Internationaux
  {
    id: 'intl-europass',
    name: 'Europass Compatible',
    description: "Format Europass pour l'Union Européenne",
    preview: '🇪🇺',
    category: 'traditional',
    region: 'international',
    features: [
      'Format Europass officiel',
      "Reconnu dans toute l'UE",
      'Sections standardisées',
      'Multi-langues automatique',
    ],
    layout: {
      columns: 1,
      headerStyle: 'left',
      colorScheme: ['#1D4ED8', '#2563EB', '#3B82F6'],
      typography: 'Arial',
    },
  },
  {
    id: 'intl-modern',
    name: 'Moderne International',
    description: 'Template moderne pour candidatures internationales',
    preview: '✨',
    category: 'modern',
    region: 'international',
    features: [
      'Design universel moderne',
      'ATS optimized',
      'Multi-cultural friendly',
      'Clean and professional',
    ],
    layout: {
      columns: 2,
      headerStyle: 'centered',
      colorScheme: ['#059669', '#10B981', '#34D399'],
      typography: 'Inter',
    },
  },
];

export const getTemplatesByRegion = (region: CVTemplate['region']) => {
  return cvTemplates.filter((template) => template.region === region);
};

export const getTemplatesByCategory = (category: CVTemplate['category']) => {
  return cvTemplates.filter((template) => template.category === category);
};

export const getTemplateById = (id: string) => {
  return cvTemplates.find((template) => template.id === id);
};

export const getRecommendedTemplates = (userProfile: {
  location?: string;
  targetRegion?: string;
  jobCategory?: string;
}) => {
  let recommendations = [...cvTemplates];

  // Filtrer par région ciblée
  if (userProfile.targetRegion) {
    recommendations = recommendations.filter(
      (t) =>
        t.region === userProfile.targetRegion || t.region === 'international'
    );
  }

  // Filtrer par profil utilisateur
  if (userProfile.location) {
    if (
      userProfile.location.includes('Algérie') ||
      userProfile.location.includes('Maroc') ||
      userProfile.location.includes('Tunisie')
    ) {
      recommendations = recommendations.filter(
        (t) => t.region === 'maghreb' || t.region === 'international'
      );
    } else if (userProfile.location.includes('France')) {
      recommendations = recommendations.filter(
        (t) => t.region === 'france' || t.region === 'international'
      );
    }
  }

  return recommendations.slice(0, 4); // Retourner les 4 premiers
};
