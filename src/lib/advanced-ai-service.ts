// Service IA Avancé basé sur l'analyse de Resume-Matcher
// Adapté pour le marché français

import { CVData, JobData } from '@/types/cv-matcher';

interface AdvancedScoring {
  similariteSemantique: number; // Similarité cosinus (comme Resume-Matcher)
  correspondanceMots: number; // Correspondance exacte des mots-clés
  pertinenceExperience: number; // Pertinence de l'expérience
  niveauCompetences: number; // Niveau de compétences
  alignementSectoriel: number; // Alignement sectoriel
  scoreGlobal: number; // Score pondéré global
}

interface MotClePondere {
  mot: string;
  frequence: number;
  position: 'titre' | 'debut' | 'milieu' | 'fin';
  type: 'technique' | 'comportemental' | 'sectoriel';
  rarete: 'commune' | 'intermediaire' | 'rare';
  poids: number;
}

interface PromptFrancais {
  systemPrompt: string;
  adaptationCulturelle: string;
  terminologiePro: string[];
  formatCV: 'chronologique' | 'fonctionnel' | 'mixte';
}

class ServiceIAAvance {
  private readonly MAX_TENTATIVES = 5;
  private readonly POIDS_SCORING = {
    similariteSemantique: 0.3,
    correspondanceMots: 0.25,
    pertinenceExperience: 0.2,
    niveauCompetences: 0.15,
    alignementSectoriel: 0.1,
  };

  /**
   * Analyse avancée basée sur Resume-Matcher mais adaptée pour le français
   */
  async analyserCV(cvData: CVData, jobData: JobData): Promise<AdvancedScoring> {
    // 1. Extraction et pondération des mots-clés (inspiré de Resume-Matcher)
    const motsClesPonderes = this.extraireMotsClesPonderes(jobData);

    // 2. Calcul multi-dimensionnel du score
    const scores = await this.calculerScoresMultiples(
      cvData,
      jobData,
      motsClesPonderes
    );

    return scores;
  }

  /**
   * Système d'amélioration itératif français (basé sur Resume-Matcher)
   */
  async ameliorerCVIteratif(
    cvData: CVData,
    jobData: JobData,
    secteur: string
  ): Promise<{ cvAmeliore: string; scoreAmeliore: number }> {
    let meilleurCV = cvData.raw_text;
    let meilleurScore = await this.calculerScoreGlobal(cvData, jobData);

    const promptSectoriel = this.genererPromptFrancais(secteur);

    for (let tentative = 1; tentative <= this.MAX_TENTATIVES; tentative++) {
      console.log(
        `🔄 Tentative ${tentative}/${this.MAX_TENTATIVES} d'amélioration`
      );

      try {
        const cvAmeliore = await this.ameliorerAvecIA(
          meilleurCV,
          jobData,
          promptSectoriel,
          meilleurScore
        );

        const nouveauScore = await this.calculerScoreTexte(cvAmeliore, jobData);

        if (nouveauScore > meilleurScore) {
          meilleurCV = cvAmeliore;
          meilleurScore = nouveauScore;
          console.log(`✅ Amélioration trouvée : ${nouveauScore.toFixed(2)}`);
        } else {
          console.log(`⚠️ Pas d'amélioration : ${nouveauScore.toFixed(2)}`);
        }
      } catch (error) {
        console.error(`❌ Erreur tentative ${tentative}:`, error);
      }
    }

    return { cvAmeliore: meilleurCV, scoreAmeliore: meilleurScore };
  }

  /**
   * Extraction et pondération intelligente des mots-clés
   */
  private extraireMotsClesPonderes(jobData: JobData): MotClePondere[] {
    const motsCles: MotClePondere[] = [];
    const texte = jobData.description.toLowerCase();

    // Analyse de fréquence et position
    jobData.extractedKeywords.forEach((mot) => {
      const motLower = mot.toLowerCase();
      const occurrences = (texte.match(new RegExp(motLower, 'g')) || []).length;

      // Détermination de la position principale
      let position: MotClePondere['position'] = 'fin';
      if (texte.indexOf(motLower) < texte.length * 0.2) position = 'debut';
      else if (texte.indexOf(motLower) < texte.length * 0.6)
        position = 'milieu';

      // Classification du type de compétence
      const type = this.classerTypeCompetence(mot);

      // Évaluation de la rareté
      const rarete = this.evaluerRarete(mot);

      // Calcul du poids final
      const poids = this.calculerPoids(occurrences, position, type, rarete);

      motsCles.push({
        mot,
        frequence: occurrences,
        position,
        type,
        rarete,
        poids,
      });
    });

    return motsCles.sort((a, b) => b.poids - a.poids);
  }

  /**
   * Classification des types de compétences pour le marché français
   */
  private classerTypeCompetence(mot: string): MotClePondere['type'] {
    const motLower = mot.toLowerCase();

    // Compétences techniques (très valorisées en France)
    const competencesTechniques = [
      'javascript',
      'python',
      'react',
      'nodejs',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'sql',
      'mongodb',
      'git',
      'jenkins',
      'agile',
      'scrum',
    ];

    // Compétences comportementales (importantes mais moins techniques)
    const competencesComportementales = [
      'leadership',
      'communication',
      'gestion',
      'organisation',
      'autonomie',
      'rigueur',
      'creativite',
      'adaptabilite',
      'esprit equipe',
    ];

    if (competencesTechniques.some((tech) => motLower.includes(tech))) {
      return 'technique';
    }
    if (competencesComportementales.some((comp) => motLower.includes(comp))) {
      return 'comportemental';
    }

    return 'sectoriel';
  }

  /**
   * Évaluation de la rareté d'une compétence
   */
  private evaluerRarete(mot: string): MotClePondere['rarete'] {
    const motLower = mot.toLowerCase();

    // Compétences rares (très recherchées)
    const competencesRares = [
      'blockchain',
      'machine learning',
      'devops',
      'cybersecurite',
      'intelligence artificielle',
      'data science',
      'cloud architect',
    ];

    // Compétences communes
    const competencesCommunes = [
      'microsoft office',
      'communication',
      'gestion',
      'organisation',
      'html',
      'css',
      'javascript basique',
    ];

    if (competencesRares.some((rare) => motLower.includes(rare))) {
      return 'rare';
    }
    if (competencesCommunes.some((commune) => motLower.includes(commune))) {
      return 'commune';
    }

    return 'intermediaire';
  }

  /**
   * Calcul du poids d'un mot-clé selon la méthode française
   */
  private calculerPoids(
    frequence: number,
    position: MotClePondere['position'],
    type: MotClePondere['type'],
    rarete: MotClePondere['rarete']
  ): number {
    let poids = frequence; // Base : fréquence d'apparition

    // Pondération par position (début = plus important)
    const multiplicateurPosition = {
      titre: 3.0,
      debut: 2.0,
      milieu: 1.2,
      fin: 1.0,
    };
    poids *= multiplicateurPosition[position];

    // Pondération par type (technique privilégié en France)
    const multiplicateurType = {
      technique: 2.5,
      sectoriel: 1.8,
      comportemental: 1.2,
    };
    poids *= multiplicateurType[type];

    // Pondération par rareté
    const multiplicateurRarete = {
      rare: 3.0,
      intermediaire: 1.5,
      commune: 0.8,
    };
    poids *= multiplicateurRarete[rarete];

    return poids;
  }

  /**
   * Génération de prompt adapté à la culture française
   */
  private genererPromptFrancais(secteur: string): PromptFrancais {
    const promptsBase = {
      tech: {
        systemPrompt: `Vous êtes un expert en recrutement tech français. Adaptez ce CV pour maximiser ses chances sur le marché français en respectant les codes culturels locaux.`,
        adaptationCulturelle: `
- Privilégiez la précision à l'auto-promotion excessive
- Utilisez un ton professionnel mais pas ostentatoire  
- Mettez l'accent sur les réalisations concrètes et mesurables
- Respectez les conventions CV françaises (format, longueur)
        `,
        terminologiePro: [
          'Expérience professionnelle',
          'Compétences techniques',
          'Formation',
          'Réalisations',
          'Projets',
          'Certifications',
          'Langues',
        ],
      },
      finance: {
        systemPrompt: `Vous êtes un expert en recrutement financier français. Adaptez ce CV selon les standards de la finance française.`,
        adaptationCulturelle: `
- Emphasez la rigueur et la conformité réglementaire
- Mettez en avant les certifications financières françaises (AMF, etc.)
- Soulignez l'expérience avec les institutions françaises
- Utilisez la terminologie financière française appropriée
        `,
        terminologiePro: [
          'Analyse financière',
          'Gestion des risques',
          'Conformité',
          'Réglementation',
          'Contrôle de gestion',
          'Audit',
        ],
      },
    };

    return promptsBase[secteur as keyof typeof promptsBase] || promptsBase.tech;
  }

  /**
   * Calcul de scores multiples (amélioration de Resume-Matcher)
   */
  private async calculerScoresMultiples(
    cvData: CVData,
    jobData: JobData,
    motsClesPonderes: MotClePondere[]
  ): Promise<AdvancedScoring> {
    // 1. Similarité sémantique (comme Resume-Matcher)
    const similariteSemantique = await this.calculerSimilariteCosinus(
      cvData,
      jobData
    );

    // 2. Correspondance exacte des mots-clés pondérés
    const correspondanceMots = this.calculerCorrespondanceMots(
      cvData,
      motsClesPonderes
    );

    // 3. Pertinence de l'expérience
    const pertinenceExperience = this.evaluerPertinenceExperience(
      cvData,
      jobData
    );

    // 4. Niveau de compétences
    const niveauCompetences = this.evaluerNiveauCompetences(cvData, jobData);

    // 5. Alignement sectoriel
    const alignementSectoriel = this.evaluerAlignementSectoriel(
      cvData,
      jobData
    );

    // Score global pondéré
    const scoreGlobal =
      similariteSemantique * this.POIDS_SCORING.similariteSemantique +
      correspondanceMots * this.POIDS_SCORING.correspondanceMots +
      pertinenceExperience * this.POIDS_SCORING.pertinenceExperience +
      niveauCompetences * this.POIDS_SCORING.niveauCompetences +
      alignementSectoriel * this.POIDS_SCORING.alignementSectoriel;

    return {
      similariteSemantique,
      correspondanceMots,
      pertinenceExperience,
      niveauCompetences,
      alignementSectoriel,
      scoreGlobal,
    };
  }

  // Méthodes d'évaluation spécifiques (à implémenter selon les besoins)
  private async calculerSimilariteCosinus(
    _cvData: CVData,
    _jobData: JobData
  ): Promise<number> {
    // TODO: Implémenter similarité cosinus comme Resume-Matcher
    return 0.75; // Placeholder
  }

  private calculerCorrespondanceMots(
    _cvData: CVData,
    _motsClesPonderes: MotClePondere[]
  ): Promise<number> {
    // TODO: Implémenter correspondance pondérée
    return Promise.resolve(0.68); // Placeholder
  }

  private evaluerPertinenceExperience(
    _cvData: CVData,
    _jobData: JobData
  ): number {
    // TODO: Analyser pertinence des expériences
    return 0.72; // Placeholder
  }

  private evaluerNiveauCompetences(_cvData: CVData, _jobData: JobData): number {
    // TODO: Évaluer niveau de maîtrise des compétences
    return 0.65; // Placeholder
  }

  private evaluerAlignementSectoriel(
    _cvData: CVData,
    _jobData: JobData
  ): number {
    // TODO: Vérifier alignement sectoriel
    return 0.78; // Placeholder
  }

  // Méthodes utilitaires (à implémenter)
  private async calculerScoreGlobal(
    cvData: CVData,
    jobData: JobData
  ): Promise<number> {
    const scores = await this.calculerScoresMultiples(cvData, jobData, []);
    return scores.scoreGlobal;
  }

  private async calculerScoreTexte(
    _texte: string,
    _jobData: JobData
  ): Promise<number> {
    // TODO: Calculer score pour un texte donné
    return 0.7; // Placeholder
  }

  private async ameliorerAvecIA(
    cv: string,
    _jobData: JobData,
    _prompt: PromptFrancais,
    _scoreActuel: number
  ): Promise<string> {
    // TODO: Appel à l'API OpenAI avec prompt français
    return cv; // Placeholder
  }
}

export { type AdvancedScoring, type MotClePondere, ServiceIAAvance };
