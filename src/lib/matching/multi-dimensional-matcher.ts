/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

import { FrenchExtractedData } from '../ai/mistral-client';
import { generateEmbedding } from '../ai/mistral-client';

export interface MultiDimensionalScore {
  overall: number;
  breakdown: {
    technical: SkillMatchResult;
    experience: ExperienceMatchResult;
    education: EducationMatchResult;
    softSkills: SoftSkillMatchResult;
    cultural: CulturalMatchResult;
    authenticity: number;
  };
  adaptiveWeights: Record<string, number>;
  recommendations: MatchRecommendation[];
}

export interface SkillMatchResult {
  score: number;
  exact: string[];
  similar: Array<{ cv: string; job: string; similarity: number }>;
  transferable: Array<{ cv: string; job: string; reason: string }>;
  missing: string[];
  extra: string[];
}

export interface ExperienceMatchResult {
  score: number;
  cvYears: number;
  requiredYears: { min: number; max: number };
  relevantYears: number;
  seniorityMatch: number;
  companyTypeMatch: number;
}

export interface EducationMatchResult {
  score: number;
  cvDiploma: string;
  requiredDiploma: string;
  isEquivalent: boolean;
  explanation: string;
  equivalences: string[];
}

export interface SoftSkillMatchResult {
  score: number;
  matched: string[];
  missing: string[];
  transferable: string[];
}

export interface CulturalMatchResult {
  score: number;
  valuesMatch: number;
  environmentMatch: number;
  aspirationsMatch: number;
}

export interface MatchRecommendation {
  type: 'skill' | 'experience' | 'education' | 'cultural' | 'authenticity';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: number;
  isNatural: boolean;
}

export interface AuthenticMatchConfig {
  weights: {
    [sector: string]: {
      technical: number;
      experience: number;
      education: number;
      softSkills: number;
      cultural: number;
      authenticity: number;
    };
  };
  thresholds: {
    overOptimization: number;
    genericPhrases: number;
    minAuthenticity: number;
    suspiciousPatterns: string[];
  };
  frenchContext: {
    diplomaEquivalences: boolean;
    culturalMatching: boolean;
    regionalPreferences: boolean;
    languageLevels: boolean;
  };
}

export class MultiDimensionalMatcher {
  constructor(
    private prisma: PrismaClient,
    private config: AuthenticMatchConfig
  ) {}

  async calculateMatch(
    cvData: FrenchExtractedData,
    jobData: FrenchExtractedData,
    authenticityScore: number
  ): Promise<MultiDimensionalScore> {
    // 1. Détecter le secteur et ajuster les poids
    const sector = await this.detectSector(jobData);
    const weights = this.config.weights[sector] || this.config.weights.default;

    // 2. Matching des compétences techniques
    const technicalMatch = await this.matchTechnicalSkills(
      cvData.hardSkills,
      jobData.hardSkills
    );

    // 3. Matching de l'expérience
    const experienceMatch = await this.matchExperience(
      cvData.experience,
      jobData.experience
    );

    // 4. Matching de la formation avec équivalences
    const educationMatch = await this.matchEducation(
      cvData.education,
      jobData.education
    );

    // 5. Matching des soft skills
    const softSkillsMatch = await this.matchSoftSkills(
      cvData.softSkills,
      jobData.softSkills
    );

    // 6. Matching culturel
    const culturalMatch = await this.matchCulture(
      cvData.culture,
      jobData.culture
    );

    // 7. Calculer le score global avec poids adaptatifs
    const overall = this.calculateWeightedScore(
      {
        technical: technicalMatch.score,
        experience: experienceMatch.score,
        education: educationMatch.score,
        softSkills: softSkillsMatch.score,
        cultural: culturalMatch.score,
        authenticity: authenticityScore,
      },
      weights
    );

    // 8. Générer des recommandations
    const recommendations = await this.generateRecommendations(
      cvData,
      jobData,
      {
        technical: technicalMatch,
        experience: experienceMatch,
        education: educationMatch,
        softSkills: softSkillsMatch,
        cultural: culturalMatch,
        authenticity: authenticityScore,
      }
    );

    return {
      overall,
      breakdown: {
        technical: technicalMatch,
        experience: experienceMatch,
        education: educationMatch,
        softSkills: softSkillsMatch,
        cultural: culturalMatch,
        authenticity: authenticityScore,
      },
      adaptiveWeights: weights,
      recommendations,
    };
  }

  private async matchTechnicalSkills(
    cvSkills: any[],
    jobSkills: any[]
  ): Promise<SkillMatchResult> {
    const exact: string[] = [];
    const similar: Array<{ cv: string; job: string; similarity: number }> = [];
    const transferable: Array<{ cv: string; job: string; reason: string }> = [];
    const missing: string[] = [];

    // Créer des maps pour accès rapide
    const cvSkillMap = new Map(cvSkills.map((s) => [s.name.toLowerCase(), s]));

    for (const jobSkill of jobSkills) {
      const jobSkillLower = jobSkill.name.toLowerCase();

      // 1. Correspondance exacte
      if (cvSkillMap.has(jobSkillLower)) {
        exact.push(jobSkill.name);
        continue;
      }

      // 2. Chercher des compétences similaires via embeddings
      let bestMatch = { skill: '', similarity: 0, cvSkill: null };

      for (const cvSkill of cvSkills) {
        const similarity = await this.calculateSkillSimilarity(
          cvSkill.name,
          jobSkill.name
        );

        if (similarity > bestMatch.similarity) {
          bestMatch = { skill: cvSkill.name, similarity, cvSkill };
        }
      }

      if (bestMatch.similarity > 0.85) {
        similar.push({
          cv: bestMatch.skill,
          job: jobSkill.name,
          similarity: bestMatch.similarity,
        });
      } else if (bestMatch.similarity > 0.7) {
        // 3. Compétences transférables
        const reason = await this.explainTransferability(
          bestMatch.skill,
          jobSkill.name
        );
        transferable.push({
          cv: bestMatch.skill,
          job: jobSkill.name,
          reason,
        });
      } else {
        missing.push(jobSkill.name);
      }
    }

    // Compétences en plus dans le CV
    const matchedCvSkills = new Set([
      ...exact.map((e) => e.toLowerCase()),
      ...similar.map((s) => s.cv.toLowerCase()),
      ...transferable.map((t) => t.cv.toLowerCase()),
    ]);

    const extra = cvSkills
      .filter((s) => !matchedCvSkills.has(s.name.toLowerCase()))
      .map((s) => s.name);

    // Calculer le score
    const requiredSkillsCount =
      jobSkills.filter((s) => s.priority === 'high').length || jobSkills.length;
    const matchedCount =
      exact.length + similar.length * 0.8 + transferable.length * 0.5;
    const score = Math.min(matchedCount / requiredSkillsCount, 1);

    return {
      score,
      exact,
      similar,
      transferable,
      missing,
      extra,
    };
  }

  private async matchExperience(
    cvExperience: any,
    jobRequirements: any
  ): Promise<ExperienceMatchResult> {
    const cvYears = cvExperience.totalYears;
    const requiredMin = jobRequirements.yearsMin || 0;
    const requiredMax = jobRequirements.yearsMax || requiredMin + 5;

    // Score basé sur les années
    let yearsScore = 0;
    if (cvYears >= requiredMin && cvYears <= requiredMax) {
      yearsScore = 1.0;
    } else if (cvYears < requiredMin) {
      yearsScore = Math.max(0, cvYears / requiredMin);
    } else {
      // Trop d'expérience peut être pénalisant
      const excess = cvYears - requiredMax;
      yearsScore = Math.max(0.7, 1 - excess / 10);
    }

    // Score basé sur la pertinence
    const relevanceScore = cvExperience.relevantYears / cvExperience.totalYears;

    // Score basé sur le type d'entreprises
    const companyTypeScore = await this.calculateCompanyTypeMatch(
      cvExperience.companies,
      jobRequirements.preferredCompanyTypes
    );

    // Score basé sur le niveau de seniorité
    const seniorityScore = this.calculateSeniorityMatch(
      cvExperience.seniorityLevel,
      jobRequirements.seniorityLevel
    );

    const overall =
      yearsScore * 0.4 +
      relevanceScore * 0.3 +
      companyTypeScore * 0.2 +
      seniorityScore * 0.1;

    return {
      score: overall,
      cvYears,
      requiredYears: { min: requiredMin, max: requiredMax },
      relevantYears: cvExperience.relevantYears,
      seniorityMatch: seniorityScore,
      companyTypeMatch: companyTypeScore,
    };
  }

  private async matchEducation(
    cvEducation: any,
    jobEducation: any
  ): Promise<EducationMatchResult> {
    // Utiliser la fonction d'équivalence
    const equivalence = await this.detectDiplomaEquivalences(
      cvEducation.diploma,
      jobEducation.requiredDiploma
    );

    let score = 0;
    let explanation = '';

    if (equivalence.isEquivalent) {
      score = equivalence.confidence;
      explanation = equivalence.explanation;
    } else {
      // Vérifier si le niveau est au moins suffisant
      const cvLevel = this.extractEducationLevel(cvEducation.level);
      const jobLevel = this.extractEducationLevel(jobEducation.requiredLevel);

      if (cvLevel >= jobLevel) {
        score = 0.7;
        explanation = "Niveau d'études suffisant mais diplôme différent";
      } else {
        score = Math.max(0, (cvLevel / jobLevel) * 0.5);
        explanation = "Niveau d'études inférieur aux exigences";
      }
    }

    // Bonus pour spécialisation pertinente
    if (cvEducation.specialization && jobEducation.preferredSpecializations) {
      const specializationMatch = await this.calculateSpecializationMatch(
        cvEducation.specialization,
        jobEducation.preferredSpecializations
      );
      score = Math.min(1, score + specializationMatch * 0.1);
    }

    return {
      score,
      cvDiploma: cvEducation.diploma,
      requiredDiploma: jobEducation.requiredDiploma,
      isEquivalent: equivalence.isEquivalent,
      explanation,
      equivalences: await this.findAllEquivalences(cvEducation.diploma),
    };
  }

  private async matchSoftSkills(
    cvSoftSkills: any[],
    jobSoftSkills: any[]
  ): Promise<SoftSkillMatchResult> {
    const matched: string[] = [];
    const missing: string[] = [];
    const transferable: string[] = [];

    const cvSkillsMap = new Map(
      cvSoftSkills.map((s) => [s.name.toLowerCase(), s])
    );

    for (const jobSkill of jobSoftSkills) {
      const jobSkillLower = jobSkill.name.toLowerCase();

      if (cvSkillsMap.has(jobSkillLower)) {
        matched.push(jobSkill.name);
      } else {
        // Chercher des compétences transférables
        const transferableSkill = this.findTransferableSoftSkill(
          cvSoftSkills,
          jobSkill.name
        );

        if (transferableSkill) {
          transferable.push(transferableSkill);
        } else {
          missing.push(jobSkill.name);
        }
      }
    }

    const totalRequired = jobSoftSkills.length;
    const matchedCount = matched.length + transferable.length * 0.5;
    const score = totalRequired > 0 ? matchedCount / totalRequired : 1;

    return {
      score,
      matched,
      missing,
      transferable,
    };
  }

  private async matchCulture(
    cvCulture: any,
    jobCulture: any
  ): Promise<CulturalMatchResult> {
    // Matching des valeurs
    const cvValues = cvCulture.values || [];
    const jobValues = jobCulture.values || [];
    const valuesMatch = this.calculateSetSimilarity(cvValues, jobValues);

    // Matching de l'environnement de travail
    const cvEnvironment = cvCulture.workEnvironment || [];
    const jobEnvironment = jobCulture.workEnvironment || [];
    const environmentMatch = this.calculateSetSimilarity(
      cvEnvironment,
      jobEnvironment
    );

    // Matching des aspirations
    const cvAspirations = cvCulture.aspirations || [];
    const jobAspirations = jobCulture.aspirations || [];
    const aspirationsMatch = this.calculateSetSimilarity(
      cvAspirations,
      jobAspirations
    );

    const overall = (valuesMatch + environmentMatch + aspirationsMatch) / 3;

    return {
      score: overall,
      valuesMatch,
      environmentMatch,
      aspirationsMatch,
    };
  }

  private async detectSector(_jobData: any): Promise<string> {
    // Logique de détection basée sur les mots-clés, l'entreprise, etc.
    const _sectors = ['tech', 'finance', 'healthcare', 'retail', 'public'];

    // Simplifiée ici - à implémenter selon vos besoins
    return 'tech';
  }

  private calculateWeightedScore(
    scores: Record<string, number>,
    weights: Record<string, number>
  ): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const [key, score] of Object.entries(scores)) {
      const weight = weights[key] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private async calculateSkillSimilarity(
    skill1: string,
    skill2: string
  ): Promise<number> {
    try {
      const [embedding1, embedding2] = await Promise.all([
        generateEmbedding(skill1),
        generateEmbedding(skill2),
      ]);

      return this.cosineSimilarity(embedding1, embedding2);
    } catch (error) {
      console.error('Erreur calcul similarité:', error);
      return 0;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async explainTransferability(
    skill1: string,
    skill2: string
  ): Promise<string> {
    // Logique pour expliquer pourquoi une compétence est transférable
    const transferabilityMap: Record<string, string[]> = {
      React: ['Vue.js', 'Angular', 'Svelte'],
      Django: ['Spring', 'Rails', 'Express.js'],
      PostgreSQL: ['MySQL', 'Oracle', 'SQL Server'],
      Docker: ['Kubernetes', 'Vagrant', 'LXC'],
    };

    for (const [skill, family] of Object.entries(transferabilityMap)) {
      if (skill === skill2 && family.includes(skill1)) {
        return `Compétence transférable : ${skill1} et ${skill2} sont des technologies similaires`;
      }
    }

    return `Compétence transférable : ${skill1} peut être adapté vers ${skill2}`;
  }

  private calculateCompanyTypeMatch(
    cvCompanies: any[],
    preferredTypes: string[]
  ): number {
    if (!preferredTypes || preferredTypes.length === 0) return 1;

    const cvTypes = cvCompanies.map((c) => c.type);
    const matchCount = cvTypes.filter((type) =>
      preferredTypes.includes(type)
    ).length;

    return matchCount / Math.max(cvTypes.length, preferredTypes.length);
  }

  private calculateSeniorityMatch(cvLevel: string, jobLevel: string): number {
    const levels = ['Junior', 'Confirmé', 'Senior', 'Expert'];
    const cvIndex = levels.indexOf(cvLevel);
    const jobIndex = levels.indexOf(jobLevel);

    if (cvIndex === -1 || jobIndex === -1) return 0.5;

    // Le candidat peut avoir un niveau supérieur ou égal
    if (cvIndex >= jobIndex) return 1;

    // Pénalité progressive pour niveau inférieur
    return Math.max(0, 1 - (jobIndex - cvIndex) * 0.2);
  }

  private extractEducationLevel(level: string): number {
    const match = level.match(/Bac\+(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  private async calculateSpecializationMatch(
    cvSpecialization: string,
    preferredSpecializations: string[]
  ): Promise<number> {
    const cvLower = cvSpecialization.toLowerCase();
    const preferredLower = preferredSpecializations.map((s) => s.toLowerCase());

    return preferredLower.some((spec) => cvLower.includes(spec)) ? 1 : 0;
  }

  private async findAllEquivalences(diploma: string): Promise<string[]> {
    // Chercher dans la base de données des équivalences
    try {
      const diplomaRecord = await this.prisma.frenchDiploma.findFirst({
        where: {
          OR: [
            { name: { contains: diploma, mode: 'insensitive' } },
            { equivalents: { has: diploma } },
          ],
        },
      });

      return diplomaRecord?.equivalents || [];
    } catch (error) {
      console.error('Erreur recherche équivalences:', error);
      return [];
    }
  }

  private findTransferableSoftSkill(
    cvSkills: any[],
    jobSkill: string
  ): string | null {
    const softSkillFamilies: Record<string, string[]> = {
      leadership: ['management', 'encadrement', 'direction'],
      communication: ['relationnel', 'présentation', 'négociation'],
      créativité: ['innovation', 'imagination', 'originalité'],
      rigueur: ['précision', 'méthode', 'organisation'],
    };

    for (const [_family, skills] of Object.entries(softSkillFamilies)) {
      if (skills.some((skill) => jobSkill.toLowerCase().includes(skill))) {
        const matchingCvSkill = cvSkills.find((skill) =>
          skills.some((s) => skill.name.toLowerCase().includes(s))
        );
        if (matchingCvSkill) {
          return matchingCvSkill.name;
        }
      }
    }

    return null;
  }

  private calculateSetSimilarity(set1: string[], set2: string[]): number {
    if (set1.length === 0 && set2.length === 0) return 1;
    if (set1.length === 0 || set2.length === 0) return 0;

    const set1Lower = set1.map((s) => s.toLowerCase());
    const set2Lower = set2.map((s) => s.toLowerCase());

    const intersection = set1Lower.filter((s) => set2Lower.includes(s));
    const union = [...new Set([...set1Lower, ...set2Lower])];

    return intersection.length / union.length;
  }

  private async generateRecommendations(
    cvData: FrenchExtractedData,
    jobData: FrenchExtractedData,
    matchResults: any
  ): Promise<MatchRecommendation[]> {
    const recommendations: MatchRecommendation[] = [];

    // Recommandations pour les compétences manquantes
    if (matchResults.technical.missing.length > 0) {
      recommendations.push({
        type: 'skill',
        priority: 'high',
        suggestion: `Développez ces compétences : ${matchResults.technical.missing.join(
          ', '
        )}`,
        impact: 8,
        isNatural: true,
      });
    }

    // Recommandations pour l'expérience
    if (matchResults.experience.score < 0.7) {
      recommendations.push({
        type: 'experience',
        priority: 'medium',
        suggestion: 'Mettez en avant vos expériences les plus pertinentes',
        impact: 6,
        isNatural: true,
      });
    }

    // Recommandations pour la formation
    if (matchResults.education.score < 0.8) {
      recommendations.push({
        type: 'education',
        priority: 'low',
        suggestion: "Précisez l'équivalence de votre diplôme",
        impact: 4,
        isNatural: true,
      });
    }

    return recommendations;
  }

  private async detectDiplomaEquivalences(
    cvDiploma: string,
    jobRequirement: string
  ): Promise<{
    isEquivalent: boolean;
    confidence: number;
    explanation: string;
  }> {
    // Logique simplifiée - à implémenter avec l'IA
    const commonEquivalences = [
      { pattern: /master|bac\+5|ingénieur/i, level: 5 },
      { pattern: /licence|bachelor|bac\+3/i, level: 3 },
      { pattern: /bts|dut|bac\+2/i, level: 2 },
    ];

    const cvMatch = commonEquivalences.find((e) => e.pattern.test(cvDiploma));
    const jobMatch = commonEquivalences.find((e) =>
      e.pattern.test(jobRequirement)
    );

    if (cvMatch && jobMatch) {
      if (cvMatch.level >= jobMatch.level) {
        return {
          isEquivalent: true,
          confidence: 0.8,
          explanation: `Équivalence détectée par analyse`,
        };
      }
    }

    return {
      isEquivalent: false,
      confidence: 0.2,
      explanation: `Pas d'équivalence trouvée entre ${cvDiploma} et ${jobRequirement}`,
    };
  }
}
