/* eslint-disable @typescript-eslint/no-explicit-any */
// Données de base françaises pour le système de matching authentique
// Ces données peuvent être étendues avec des APIs gouvernementales

export const FRENCH_DIPLOMAS = [
  {
    name: 'Doctorat',
    level: 'Bac+8',
    rncp: 8,
    type: 'Doctorat',
    equivalents: ['PhD', 'Thèse'],
    europeanLevel: '8',
    domains: ['Recherche', 'Enseignement', 'Expertise'],
  },
  {
    name: 'Master',
    level: 'Bac+5',
    rncp: 7,
    type: 'Master',
    equivalents: ['Master 2', 'DESS', 'DEA', 'Ingénieur'],
    europeanLevel: '7',
    domains: ['Général', 'Spécialisé'],
  },
  {
    name: 'Master Informatique',
    level: 'Bac+5',
    rncp: 7,
    type: 'Master',
    equivalents: ['Master 2 Info', 'DESS Informatique', 'Ingénieur Info'],
    europeanLevel: '7',
    domains: ['Informatique', 'Technologies'],
  },
  {
    name: 'Licence',
    level: 'Bac+3',
    rncp: 6,
    type: 'Licence',
    equivalents: ['Bachelor', 'Licence Pro'],
    europeanLevel: '6',
    domains: ['Général', 'Professionnel'],
  },
  {
    name: 'Licence Informatique',
    level: 'Bac+3',
    rncp: 6,
    type: 'Licence',
    equivalents: ['Bachelor Info', 'Licence Pro Info'],
    europeanLevel: '6',
    domains: ['Informatique'],
  },
  {
    name: 'BTS',
    level: 'Bac+2',
    rncp: 5,
    type: 'BTS',
    equivalents: ['DUT', 'DEUST'],
    europeanLevel: '5',
    domains: ['Technique', 'Professionnel'],
  },
  {
    name: 'BTS Informatique',
    level: 'Bac+2',
    rncp: 5,
    type: 'BTS',
    equivalents: ['DUT Info', 'BTS SIO'],
    europeanLevel: '5',
    domains: ['Informatique'],
  },
  {
    name: 'DUT',
    level: 'Bac+2',
    rncp: 5,
    type: 'DUT',
    equivalents: ['BTS', 'DEUST'],
    europeanLevel: '5',
    domains: ['Technique', 'Universitaire'],
  },
  {
    name: 'DUT Informatique',
    level: 'Bac+2',
    rncp: 5,
    type: 'DUT',
    equivalents: ['BTS Info', 'DUT Info'],
    europeanLevel: '5',
    domains: ['Informatique'],
  },
  {
    name: 'Baccalauréat',
    level: 'Bac',
    rncp: 4,
    type: 'Bac',
    equivalents: ['Bac Pro', 'Bac Techno'],
    europeanLevel: '4',
    domains: ['Général', 'Technologique', 'Professionnel'],
  },
];

export const FRENCH_SKILLS = [
  // Compétences techniques
  {
    skillName: 'React',
    category: 'technique',
    synonyms: ['React.js', 'ReactJS'],
    relatedSkills: ['Vue.js', 'Angular', 'Next.js', 'JavaScript'],
    parentSkill: 'Frontend',
    sectors: ['Tech', 'Web', 'Startup'],
    jobTitles: ['Développeur Frontend', 'Développeur Full Stack'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'Node.js',
    category: 'technique',
    synonyms: ['NodeJS', 'Node'],
    relatedSkills: ['Express.js', 'JavaScript', 'Backend'],
    parentSkill: 'Backend',
    sectors: ['Tech', 'Web', 'Startup'],
    jobTitles: ['Développeur Backend', 'Développeur Full Stack'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'Python',
    category: 'technique',
    synonyms: ['Python3', 'Python 3'],
    relatedSkills: ['Django', 'Flask', 'Data Science', 'Machine Learning'],
    parentSkill: 'Langage de programmation',
    sectors: ['Tech', 'Data', 'IA', 'Finance'],
    jobTitles: ['Développeur Python', 'Data Scientist', 'Ingénieur IA'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'Docker',
    category: 'outil',
    synonyms: ['Docker Engine', 'Containers'],
    relatedSkills: ['Kubernetes', 'DevOps', 'CI/CD'],
    parentSkill: 'DevOps',
    sectors: ['Tech', 'DevOps', 'Cloud'],
    jobTitles: ['DevOps', 'Ingénieur Cloud', 'Développeur'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'PostgreSQL',
    category: 'technique',
    synonyms: ['Postgres', 'PostgresQL'],
    relatedSkills: ['MySQL', 'Oracle', 'SQL Server', 'MongoDB'],
    parentSkill: 'Base de données',
    sectors: ['Tech', 'Data', 'Finance'],
    jobTitles: ['Développeur', 'DBA', 'Data Engineer'],
    defaultLevel: 'Intermédiaire',
  },

  // Compétences comportementales
  {
    skillName: 'Leadership',
    category: 'comportementale',
    synonyms: ['Management', 'Encadrement', "Direction d'équipe"],
    relatedSkills: ['Communication', 'Gestion de projet', 'Mentoring'],
    parentSkill: 'Management',
    sectors: ['Tous'],
    jobTitles: ['Manager', 'Chef de projet', 'Lead'],
    defaultLevel: 'Avancé',
  },
  {
    skillName: 'Communication',
    category: 'comportementale',
    synonyms: ['Relationnel', 'Présentation', 'Négociation'],
    relatedSkills: ['Leadership', 'Travail en équipe', 'Écoute'],
    parentSkill: 'Soft Skills',
    sectors: ['Tous'],
    jobTitles: ['Tous'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'Créativité',
    category: 'comportementale',
    synonyms: ['Innovation', 'Imagination', 'Originalité'],
    relatedSkills: ['Résolution de problèmes', 'Design thinking'],
    parentSkill: 'Soft Skills',
    sectors: ['Marketing', 'Design', 'Tech', 'Startup'],
    jobTitles: ['Designer', 'Product Manager', 'Développeur'],
    defaultLevel: 'Intermédiaire',
  },
  {
    skillName: 'Rigueur',
    category: 'comportementale',
    synonyms: ['Précision', 'Méthode', 'Organisation'],
    relatedSkills: ['Qualité', 'Processus', 'Documentation'],
    parentSkill: 'Soft Skills',
    sectors: ['Finance', 'Santé', 'Tech', 'Industrie'],
    jobTitles: ['Analyste', 'Contrôleur', 'Développeur'],
    defaultLevel: 'Intermédiaire',
  },
];

export const FRENCH_LANGUAGES = [
  {
    cecrl: 'A1',
    description: 'Débutant',
    certifications: ['DELF A1'],
    level: 1,
  },
  {
    cecrl: 'A2',
    description: 'Élémentaire',
    certifications: ['DELF A2'],
    level: 2,
  },
  {
    cecrl: 'B1',
    description: 'Intermédiaire',
    certifications: ['DELF B1', 'BULATS 40-59'],
    level: 3,
  },
  {
    cecrl: 'B2',
    description: 'Intermédiaire avancé',
    certifications: ['DELF B2', 'BULATS 60-74', 'TOEIC 785-945'],
    level: 4,
  },
  {
    cecrl: 'C1',
    description: 'Avancé',
    certifications: ['DALF C1', 'BULATS 75-89', 'TOEIC 946-990'],
    level: 5,
  },
  {
    cecrl: 'C2',
    description: 'Maîtrise',
    certifications: ['DALF C2', 'BULATS 90-100'],
    level: 6,
  },
  {
    cecrl: 'Natif',
    description: 'Langue maternelle',
    certifications: [],
    level: 7,
  },
];

export const FRENCH_COMPANIES = [
  {
    name: 'Google France',
    siret: '44306184100047',
    size: 'grand_groupe',
    sector: '6201Z', // Programmation informatique
    convention: 'Syntec',
    cultureKeywords: ['Innovation', 'Technologie', 'Collaboration'],
    values: ['Innovation', 'Excellence', 'Diversité'],
  },
  {
    name: 'Microsoft France',
    siret: '70203683000019',
    size: 'grand_groupe',
    sector: '6201Z',
    convention: 'Syntec',
    cultureKeywords: ['Technologie', 'Innovation', 'Responsabilité'],
    values: ['Innovation', 'Responsabilité', 'Inclusion'],
  },
  {
    name: 'Amazon France',
    siret: '41418809600015',
    size: 'grand_groupe',
    sector: '4711F', // Commerce de détail
    convention: 'Commerce',
    cultureKeywords: ['Client', 'Innovation', 'Performance'],
    values: ['Obsession client', 'Innovation', 'Excellence opérationnelle'],
  },
  {
    name: 'BNP Paribas',
    siret: '66204244900013',
    size: 'grand_groupe',
    sector: '6419Z', // Autres activités monétaires
    convention: 'Banque',
    cultureKeywords: ['Finance', 'Rigueur', 'Conformité'],
    values: ['Excellence', 'Innovation', 'Responsabilité'],
  },
  {
    name: 'LVMH',
    siret: '77567052400019',
    size: 'grand_groupe',
    sector: '4771Z', // Commerce de détail
    convention: 'Commerce',
    cultureKeywords: ['Luxe', 'Créativité', 'Excellence'],
    values: ['Excellence', 'Créativité', 'Innovation'],
  },
];

export const FRENCH_SECTORS = [
  {
    name: 'Tech',
    code: '62',
    description: "Technologies de l'information",
    keywords: ['Informatique', 'Développement', 'Technologie'],
    typicalRoles: ['Développeur', 'Ingénieur', 'Product Manager'],
    culture: ['Innovation', 'Agilité', 'Collaboration'],
  },
  {
    name: 'Finance',
    code: '64',
    description: 'Services financiers',
    keywords: ['Banque', 'Assurance', 'Finance'],
    typicalRoles: ['Analyste', 'Contrôleur', 'Gestionnaire'],
    culture: ['Rigueur', 'Conformité', 'Performance'],
  },
  {
    name: 'Santé',
    code: '86',
    description: 'Activités de santé',
    keywords: ['Médecine', 'Pharmaceutique', 'Santé'],
    typicalRoles: ['Médecin', 'Pharmacien', 'Infirmier'],
    culture: ['Soin', 'Précision', 'Éthique'],
  },
  {
    name: 'Commerce',
    code: '47',
    description: 'Commerce de détail',
    keywords: ['Vente', 'Commerce', 'Distribution'],
    typicalRoles: ['Vendeur', 'Manager', 'Acheteur'],
    culture: ['Service client', 'Performance', 'Innovation'],
  },
  {
    name: 'Industrie',
    code: '28',
    description: 'Fabrication de machines',
    keywords: ['Production', 'Industrie', 'Manufacturing'],
    typicalRoles: ['Ingénieur', 'Technicien', 'Opérateur'],
    culture: ['Qualité', 'Sécurité', 'Efficacité'],
  },
];

export const FRENCH_CONVENTIONS = [
  {
    name: 'Syntec',
    description: "Convention collective des bureaux d'études techniques",
    sectors: ['Tech', 'Ingénierie', 'Conseil'],
    typicalRoles: ['Ingénieur', 'Développeur', 'Consultant'],
  },
  {
    name: 'Métallurgie',
    description: 'Convention collective de la métallurgie',
    sectors: ['Industrie', 'Métallurgie', 'Automobile'],
    typicalRoles: ['Ouvrier', 'Technicien', 'Ingénieur'],
  },
  {
    name: 'Banque',
    description: 'Convention collective de la banque',
    sectors: ['Finance', 'Banque', 'Assurance'],
    typicalRoles: ['Conseiller', 'Analyste', 'Gestionnaire'],
  },
  {
    name: 'Commerce',
    description: 'Convention collective du commerce',
    sectors: ['Commerce', 'Distribution', 'Vente'],
    typicalRoles: ['Vendeur', 'Manager', 'Acheteur'],
  },
];

// Fonction pour charger les données françaises en base
export async function seedFrenchData(prisma: any) {
  console.log('🇫🇷 Chargement des données françaises...');

  try {
    // Charger les diplômes
    for (const diploma of FRENCH_DIPLOMAS) {
      await prisma.frenchDiploma.upsert({
        where: { name: diploma.name },
        update: diploma,
        create: diploma,
      });
    }
    console.log(`✅ ${FRENCH_DIPLOMAS.length} diplômes chargés`);

    // Charger les compétences
    for (const skill of FRENCH_SKILLS) {
      await prisma.frenchSkillOntology.upsert({
        where: { skillName: skill.skillName },
        update: skill,
        create: skill,
      });
    }
    console.log(`✅ ${FRENCH_SKILLS.length} compétences chargées`);

    // Charger les entreprises
    for (const company of FRENCH_COMPANIES) {
      await prisma.frenchCompany.upsert({
        where: { siret: company.siret },
        update: company,
        create: company,
      });
    }
    console.log(`✅ ${FRENCH_COMPANIES.length} entreprises chargées`);

    console.log('🎉 Données françaises chargées avec succès !');
  } catch (error) {
    console.error('❌ Erreur chargement données françaises:', error);
    throw error;
  }
}

// Fonction pour obtenir les équivalences de diplômes
export function getDiplomaEquivalences(diploma: string): string[] {
  const found = FRENCH_DIPLOMAS.find(
    (d) =>
      d.name.toLowerCase().includes(diploma.toLowerCase()) ||
      d.equivalents.some((eq) =>
        eq.toLowerCase().includes(diploma.toLowerCase())
      )
  );

  return found ? found.equivalents : [];
}

// Fonction pour obtenir les compétences liées
export function getRelatedSkills(skill: string): string[] {
  const found = FRENCH_SKILLS.find(
    (s) =>
      s.skillName.toLowerCase().includes(skill.toLowerCase()) ||
      s.synonyms.some((syn) => syn.toLowerCase().includes(skill.toLowerCase()))
  );

  return found ? found.relatedSkills : [];
}

// Fonction pour obtenir le niveau CECRL
export function getCECRLLevel(level: string): number {
  const found = FRENCH_LANGUAGES.find(
    (l) => l.cecrl.toLowerCase() === level.toLowerCase()
  );

  return found ? found.level : 0;
}
