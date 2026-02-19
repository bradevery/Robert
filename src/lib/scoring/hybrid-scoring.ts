/* eslint-disable @typescript-eslint/no-explicit-any */
import { cacheScoringService } from './cache-scoring';
import { embeddingScoringService } from './embedding-scoring';
import { keywordScoringService } from './keyword-scoring';
import { semanticScoringService } from './semantic-scoring';
import { vectorScoringService } from './vector-scoring';

interface HybridScoringConfig {
  useCache: boolean;
  weights: {
    vector: number;
    keyword: number;
    embedding: number;
    semantic: number;
  };
  bankingInsuranceFocus: boolean;
  performanceMode: 'fast' | 'balanced' | 'comprehensive';
}

interface HybridScoringResult {
  finalScore: number;
  confidence: number;
  breakdown: {
    vectorScore: number;
    keywordScore: number;
    embeddingScore: number;
    semanticScore: number;
  };
  weights: {
    vector: number;
    keyword: number;
    embedding: number;
    semantic: number;
  };
  analysis: {
    sectorDetected: string;
    skillsAlignment: string[];
    missingCompetencies: string[];
    recommendations: string[];
    conceptualMatches: string[];
    detailedJustification: string;
    strengths: string[];
    weaknesses: string[];
    matchExplanation: string;
  };
  performance: {
    totalTimeMs: number;
    cacheHits: number;
    cacheMisses: number;
    phases: { [phase: string]: number };
  };
  metadata: {
    profileContext: string;
    experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
    domainExpertise: string[];
  };
}

export class HybridScoringService {
  private config: HybridScoringConfig;
  private performanceTracker: { [phase: string]: number } = {};

  constructor(config?: Partial<HybridScoringConfig>) {
    this.config = {
      useCache: true,
      weights: {
        vector: 0.3,
        keyword: 0.5,
        embedding: 0.15,
        semantic: 0.05,
      },
      bankingInsuranceFocus: true,
      performanceMode: 'balanced',
      ...config,
    };

    console.log(
      '[HYBRID_SCORING] Service initialized with config:',
      this.config
    );
  }

  private adaptWeightsForPerformance(mode: string): void {
    switch (mode) {
      case 'fast':
        this.config.weights = {
          vector: 0.4,
          keyword: 0.35,
          embedding: 0.15,
          semantic: 0.1,
        };
        break;

      case 'comprehensive':
        this.config.weights = {
          vector: 0.2,
          keyword: 0.25,
          embedding: 0.35,
          semantic: 0.2,
        };
        break;

      case 'balanced':
      default:
        this.config.weights = {
          vector: 0.25,
          keyword: 0.3,
          embedding: 0.3,
          semantic: 0.15,
        };
        break;
    }
  }

  private detectProfileContext(cvText: string): {
    context: string;
    experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
    domainExpertise: string[];
  } {
    const text = cvText.toLowerCase();

    const contexts = {
      management: [
        'manager',
        'directeur',
        'chef',
        'responsable',
        'head',
        'senior',
      ],
      finance: [
        'finance',
        'comptable',
        'contrôle',
        'audit',
        'budget',
        'analyste',
      ],
      it: ['développeur', 'data', 'senior', 'lead', 'tech', 'informatique'],
      banking: ['banque', 'crédit', 'commercial', 'conseiller', 'compliance'],
      insurance: ['assurance', 'actuaire', 'souscription', 'sinistre'],
    };

    let primaryContext = 'general';
    let maxMatches = 0;

    Object.entries(contexts).forEach(([context, keywords]) => {
      const matches = keywords.filter((keyword) =>
        text.includes(keyword)
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        primaryContext = context;
      }
    });

    let experienceLevel: 'junior' | 'mid' | 'senior' | 'expert' = 'mid';

    if (
      text.includes('senior') ||
      text.includes('expert') ||
      text.includes('lead')
    ) {
      experienceLevel = 'senior';
    } else if (
      text.includes('junior') ||
      text.includes('stagiaire') ||
      text.includes('débutant')
    ) {
      experienceLevel = 'junior';
    } else if (
      text.includes('chief') ||
      text.includes('directeur') ||
      text.includes('head')
    ) {
      experienceLevel = 'expert';
    }

    const domainExpertise: string[] = [];
    Object.entries(contexts).forEach(([domain, keywords]) => {
      const matches = keywords.filter((keyword) =>
        text.includes(keyword)
      ).length;
      if (matches >= 2) {
        domainExpertise.push(domain);
      }
    });

    return {
      context: primaryContext,
      experienceLevel,
      domainExpertise,
    };
  }

  private adaptWeightsForContext(context: string): void {
    if (!this.config.bankingInsuranceFocus) return;

    switch (context) {
      case 'management':
        this.config.weights = {
          vector: 0.2,
          keyword: 0.35,
          embedding: 0.25,
          semantic: 0.2,
        };
        break;

      case 'finance':
        this.config.weights = {
          vector: 0.25,
          keyword: 0.4,
          embedding: 0.25,
          semantic: 0.1,
        };
        break;

      case 'it':
        this.config.weights = {
          vector: 0.3,
          keyword: 0.25,
          embedding: 0.35,
          semantic: 0.1,
        };
        break;

      case 'consulting':
        this.config.weights = {
          vector: 0.15,
          keyword: 0.45,
          embedding: 0.2,
          semantic: 0.2,
        };
        break;

      case 'banking':
      case 'insurance':
        this.config.weights = {
          vector: 0.2,
          keyword: 0.35,
          embedding: 0.3,
          semantic: 0.15,
        };
        break;
    }
  }

  private calculateConfidence(breakdown: any, profileContext: any): number {
    const scores = [
      breakdown.vectorScore,
      breakdown.keywordScore,
      breakdown.embeddingScore,
      breakdown.semanticScore,
    ].filter((score) => score > 0);

    if (scores.length === 0) return 0;

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;
    const standardDeviation = Math.sqrt(variance);

    const scoreConsistency = Math.max(0, 100 - standardDeviation * 2);

    const contextBonus = profileContext.domainExpertise.length > 1 ? 10 : 0;

    const completenessBonus = scores.length === 4 ? 10 : 0;

    return Math.min(
      100,
      Math.round(scoreConsistency + contextBonus + completenessBonus)
    );
  }

  private aggregateRecommendations(results: any): string[] {
    const allRecommendations = new Set<string>();

    if (results.keyword?.missingKeywords) {
      results.keyword.missingKeywords.slice(0, 3).forEach((keyword: string) => {
        allRecommendations.add(`Ajouter compétence en ${keyword}`);
      });
    }

    if (results.semantic?.recommendations) {
      results.semantic.recommendations.forEach((rec: string) => {
        allRecommendations.add(rec);
      });
    }

    if (results.keyword?.sectorDetected && results.keyword.score < 70) {
      allRecommendations.add(
        `Renforcer l'expérience en ${results.keyword.sectorDetected.replace(
          '_',
          ' '
        )}`
      );
    }

    return Array.from(allRecommendations).slice(0, 5);
  }

  private generateDetailedJustification(
    finalScore: number,
    breakdown: any,
    results: any,
    _profileContext: string
  ): string {
    const scoreLevel =
      finalScore >= 60
        ? 'excellent'
        : finalScore >= 40
        ? 'bon'
        : finalScore >= 25
        ? 'moyen'
        : 'faible';
    const mainStrengths = this.identifyMainStrengths(breakdown, results);
    const mainWeaknesses = this.identifyMainWeaknesses(breakdown, results);

    let justification = `Ce profil présente un match ${scoreLevel} (${finalScore}%) pour le poste. `;

    if (finalScore >= 40) {
      justification += `Les points forts incluent ${mainStrengths.join(
        ', '
      )}. `;
      if (mainWeaknesses.length > 0) {
        justification += `Des améliorations seraient bénéfiques sur ${mainWeaknesses.join(
          ' et '
        )}.`;
      }
    } else {
      justification += `Le profil présente des lacunes importantes : ${mainWeaknesses.join(
        ', '
      )}. `;
      if (mainStrengths.length > 0) {
        justification += `Cependant, des éléments positifs sont identifiés : ${mainStrengths.join(
          ' et '
        )}.`;
      }
    }

    return justification;
  }

  private identifyStrengths(breakdown: any, results: any): string[] {
    const strengths: string[] = [];

    if (breakdown.vectorScore >= 35) {
      strengths.push('Vocabulaire technique très aligné avec le poste');
    } else if (breakdown.vectorScore >= 20) {
      strengths.push('Terminologie appropriée au domaine');
    }

    if (breakdown.keywordScore >= 40) {
      const topKeywords =
        results.keyword?.matchingKeywords
          ?.filter((k: any) => k.found)
          ?.slice(0, 3) || [];
      if (topKeywords.length > 0) {
        strengths.push(
          `Compétences clés confirmées : ${topKeywords
            .map((k: any) => k.keyword)
            .join(', ')}`
        );
      }
    } else if (breakdown.keywordScore >= 25) {
      strengths.push('Certaines compétences techniques requises');
    }

    // Analyse sémantique
    if (breakdown.semanticScore >= 70) {
      strengths.push('Expérience métier très pertinente');
    } else if (breakdown.semanticScore >= 50) {
      strengths.push('Contexte professionnel adapté');
    }

    // Secteur détecté
    const sector = results.keyword?.sectorDetected;
    if (['data_science', 'finance_banking'].includes(sector)) {
      strengths.push('Profil spécialisé banking/finance');
    }

    return strengths;
  }

  private identifyWeaknesses(breakdown: any, results: any): string[] {
    const weaknesses: string[] = [];

    if (breakdown.vectorScore < 15) {
      weaknesses.push('Vocabulaire technique insuffisant');
    } else if (breakdown.vectorScore < 25) {
      weaknesses.push('Terminologie à renforcer');
    }

    if (breakdown.keywordScore < 20) {
      const missingKeywords =
        results.keyword?.missingKeywords?.slice(0, 3) || [];
      if (missingKeywords.length > 0) {
        weaknesses.push(
          `Compétences manquantes : ${missingKeywords.join(', ')}`
        );
      }
    } else if (breakdown.keywordScore < 35) {
      weaknesses.push('Certaines compétences techniques à développer');
    }

    if (breakdown.semanticScore < 40) {
      weaknesses.push('Expérience métier à renforcer');
    } else if (breakdown.semanticScore < 60) {
      weaknesses.push('Contexte professionnel partiellement aligné');
    }

    const sector = results.keyword?.sectorDetected;
    if (sector === 'marketing_digital') {
      weaknesses.push('Profil orienté marketing, reconversion nécessaire');
    } else if (!['data_science', 'finance_banking'].includes(sector)) {
      weaknesses.push("Secteur d'activité peu aligné");
    }

    return weaknesses;
  }

  private identifyMainStrengths(breakdown: any, results: any): string[] {
    const strengths = this.identifyStrengths(breakdown, results);
    return strengths.slice(0, 2); // Top 2 strengths pour justification
  }

  private identifyMainWeaknesses(breakdown: any, results: any): string[] {
    const weaknesses = this.identifyWeaknesses(breakdown, results);
    return weaknesses.slice(0, 2); // Top 2 weaknesses pour justification
  }

  private generateMatchExplanation(
    finalScore: number,
    breakdown: any,
    profileContext: string
  ): string {
    const dominantComponent = this.getDominantComponent(breakdown);

    let explanation = `Le score de ${finalScore}% est principalement influencé par `;

    switch (dominantComponent) {
      case 'keyword':
        explanation += `l'analyse des compétences techniques (${breakdown.keywordScore}%), qui révèle une bonne adéquation avec les exigences du poste.`;
        break;
      case 'vector':
        explanation += `la similarité textuelle (${breakdown.vectorScore}%), indiquant un vocabulaire professionnel aligné.`;
        break;
      case 'semantic':
        explanation += `l'analyse sémantique (${breakdown.semanticScore}%), qui détecte une expérience métier pertinente.`;
        break;
      default:
        explanation += `une combinaison équilibrée des différents critères d'analyse.`;
    }

    explanation += ` Le profil ${profileContext} correspond ${
      finalScore >= 50 ? 'bien' : 'partiellement'
    } aux attentes.`;

    return explanation;
  }

  private getDominantComponent(breakdown: any): string {
    const scores = {
      keyword: breakdown.keywordScore,
      vector: breakdown.vectorScore,
      semantic: breakdown.semanticScore,
      embedding: breakdown.embeddingScore,
    };

    return Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );
  }

  private calculateSectorAlignment(
    sectorDetected: string,
    keywordScore: number,
    semanticScore: number
  ): number {
    const _crossSectorCompatibility = {
      finance_banking: {
        data_science: 0.8,
        tech_fullstack: 0.7,
        project_management: 0.6,
        marketing_digital: 0.3,
        finance_banking: 1.0,
      },
      data_science: {
        finance_banking: 0.8,
        tech_fullstack: 0.9,
        project_management: 0.6,
        marketing_digital: 0.5,
        data_science: 1.0,
      },
      tech_fullstack: {
        finance_banking: 0.7,
        data_science: 0.9,
        project_management: 0.7,
        marketing_digital: 0.6,
        tech_fullstack: 1.0,
      },
      project_management: {
        finance_banking: 0.6,
        data_science: 0.6,
        tech_fullstack: 0.7,
        marketing_digital: 0.7,
        project_management: 1.0,
      },
      marketing_digital: {
        finance_banking: 0.2,
        data_science: 0.5,
        tech_fullstack: 0.6,
        project_management: 0.7,
        marketing_digital: 1.0,
      },
    };

    let alignmentScore = keywordScore / 100;

    if (
      ['finance_banking', 'data_science'].includes(sectorDetected) &&
      semanticScore >= 60
    ) {
      alignmentScore += 0.2;
    } else if (sectorDetected === 'tech_fullstack' && keywordScore >= 40) {
      alignmentScore += 0.25;
    }

    return Math.min(1.0, alignmentScore);
  }

  private calculateTransferabilityFactor(
    jobText: string,
    candidateSector: string,
    keywordScore: number,
    semanticScore: number,
    embeddingScore: number
  ): number {
    const jobSectorKeywords = {
      finance_banking: [
        'risk',
        'banking',
        'finance',
        'investment',
        'credit',
        'basel',
        'regulatory',
        'financial',
      ],
      tech_fullstack: [
        'javascript',
        'react',
        'node',
        'api',
        'fullstack',
        'developer',
        'frontend',
        'backend',
        'programming',
      ],
      data_science: [
        'data',
        'machine learning',
        'python',
        'analytics',
        'model',
        'ai',
        'science',
        'algorithm',
        'statistical',
      ],
    };

    let jobSector = 'unknown';
    let maxMatches = 0;
    let maxScore = 0;

    for (const [sector, keywords] of Object.entries(jobSectorKeywords)) {
      const matches = keywords.filter((keyword) =>
        jobText.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      const sectorScore = matches / keywords.length;

      if (matches > maxMatches && sectorScore >= 0.2) {
        maxMatches = matches;
        maxScore = sectorScore;
        jobSector = sector;
      }
    }

    if (maxScore < 0.3) {
      console.log(
        `[CROSS_SECTOR] Weak job sector detection (${maxScore.toFixed(
          2
        )}), limiting transferability`
      );
      return Math.min(0.4, keywordScore / 100);
    }

    const compatibility = {
      finance_banking: {
        data_science: 0.6,
        tech_fullstack: 0.5,
        project_management: 0.4,
        finance_banking: 1.0,
      },
      data_science: {
        finance_banking: 0.6,
        tech_fullstack: 0.7,
        project_management: 0.4,
        data_science: 1.0,
      },
      tech_fullstack: {
        finance_banking: 0.5,
        data_science: 0.7,
        project_management: 0.5,
        tech_fullstack: 1.0,
      },
      project_management: {
        finance_banking: 0.3,
        data_science: 0.3,
        tech_fullstack: 0.4,
        project_management: 1.0,
      },
      marketing_digital: {
        finance_banking: 0.1,
        data_science: 0.2,
        tech_fullstack: 0.3,
        project_management: 0.4,
        marketing_digital: 1.0,
      },
    };

    const baseCompatibility =
      (compatibility as any)[candidateSector]?.[jobSector] || 0.2;
    let transferabilityFactor = baseCompatibility;

    const hasStrongTechnicalSkills = embeddingScore >= 70 && keywordScore >= 25;
    const hasRelevantExperience = semanticScore >= 65;
    const hasKeywordOverlap = keywordScore >= 30;

    if (hasStrongTechnicalSkills && hasRelevantExperience) {
      transferabilityFactor += 0.15;
    } else if (
      hasStrongTechnicalSkills ||
      (hasRelevantExperience && hasKeywordOverlap)
    ) {
      transferabilityFactor += 0.08;
    } else if (hasKeywordOverlap && semanticScore >= 50) {
      transferabilityFactor += 0.04;
    }

    if (
      candidateSector === 'marketing_digital' &&
      ['finance_banking', 'data_science'].includes(jobSector)
    ) {
      transferabilityFactor *= 0.5;
    }

    const qualityFactor = (keywordScore + semanticScore) / 2;
    if (qualityFactor < 25) {
      transferabilityFactor = Math.min(transferabilityFactor, 0.4);
    } else if (qualityFactor < 40) {
      transferabilityFactor = Math.min(transferabilityFactor, 0.6);
    }

    const finalFactor = Math.min(0.85, Math.max(0.1, transferabilityFactor));

    console.log(
      `[CROSS_SECTOR] ${candidateSector} -> ${jobSector}: base=${baseCompatibility.toFixed(
        2
      )}, quality=${qualityFactor.toFixed(0)}%, final=${finalFactor.toFixed(2)}`
    );

    return finalFactor;
  }

  public async calculateHybridScore(
    jobText: string,
    cvText: string,
    options?: Partial<HybridScoringConfig>
  ): Promise<HybridScoringResult> {
    const startTime = Date.now();
    const tempConfig = { ...this.config, ...options };

    this.adaptWeightsForPerformance(tempConfig.performanceMode);
    const profileContext = this.detectProfileContext(cvText);
    this.adaptWeightsForContext(profileContext.context);

    console.log(
      `[HYBRID_SCORING] Processing ${profileContext.context} profile (${profileContext.experienceLevel})`
    );

    let cacheHits = 0;
    let cacheMisses = 0;
    const results: any = {};

    try {
      const vectorStart = Date.now();
      if (tempConfig.useCache) {
        const cachedVector = cacheScoringService.getCachedVectorScore(
          jobText,
          cvText
        );
        if (cachedVector) {
          results.vector = cachedVector;
          cacheHits++;
        }
      }

      if (!results.vector) {
        results.vector = vectorScoringService.calculateVectorSimilarity(
          jobText,
          cvText
        );
        if (tempConfig.useCache) {
          cacheScoringService.cacheVectorScore(jobText, cvText, results.vector);
        }
        cacheMisses++;
      }
      this.performanceTracker.vector = Date.now() - vectorStart;

      const keywordStart = Date.now();
      if (tempConfig.useCache) {
        const cachedKeyword = cacheScoringService.getCachedKeywordScore(
          jobText,
          cvText
        );
        if (cachedKeyword) {
          results.keyword = cachedKeyword;
          cacheHits++;
        }
      }

      if (!results.keyword) {
        results.keyword = keywordScoringService.calculateKeywordScore(
          jobText,
          cvText
        );
        if (tempConfig.useCache) {
          cacheScoringService.cacheKeywordScore(
            jobText,
            cvText,
            results.keyword
          );
        }
        cacheMisses++;
      }
      this.performanceTracker.keyword = Date.now() - keywordStart;

      const embeddingStart = Date.now();
      if (tempConfig.performanceMode !== 'fast') {
        results.embedding =
          await embeddingScoringService.calculateEmbeddingScore(
            jobText,
            cvText
          );
      } else {
        results.embedding = {
          score: (results.vector.score + results.keyword.score) / 2,
          similarity: 0,
        };
      }
      this.performanceTracker.embedding = Date.now() - embeddingStart;

      const semanticStart = Date.now();
      if (tempConfig.useCache) {
        const cachedSemantic = cacheScoringService.getCachedSemanticScore(
          jobText,
          cvText
        );
        if (cachedSemantic) {
          results.semantic = cachedSemantic;
          cacheHits++;
        }
      }

      if (!results.semantic) {
        results.semantic = semanticScoringService.calculateSemanticScore(
          jobText,
          cvText
        );
        if (tempConfig.useCache) {
          cacheScoringService.cacheSemanticScore(
            jobText,
            cvText,
            results.semantic
          );
        }
        cacheMisses++;
      }
      this.performanceTracker.semantic = Date.now() - semanticStart;

      const breakdown = {
        vectorScore: results.vector?.score || 0,
        keywordScore: results.keyword?.score || 0,
        embeddingScore: results.embedding?.score || 0,
        semanticScore: results.semantic?.score || 0,
      };

      const baseScore =
        breakdown.vectorScore * this.config.weights.vector +
        breakdown.keywordScore * this.config.weights.keyword +
        breakdown.embeddingScore * this.config.weights.embedding +
        breakdown.semanticScore * this.config.weights.semantic;

      let transformedScore = baseScore;

      if (this.config.bankingInsuranceFocus) {
        const sectorRelevance = results.keyword?.sectorDetected || '';
        const keywordScore = breakdown.keywordScore;
        const vectorScore = breakdown.vectorScore;
        const semanticScore = breakdown.semanticScore;
        const embeddingScore = breakdown.embeddingScore;

        const sectorAlignment = this.calculateSectorAlignment(
          sectorRelevance,
          keywordScore,
          semanticScore
        );

        const transferabilityFactor = this.calculateTransferabilityFactor(
          jobText,
          sectorRelevance,
          keywordScore,
          semanticScore,
          embeddingScore
        );

        const technicalRelevance = vectorScore * 0.6 + embeddingScore * 0.4;

        const domainExpertise = keywordScore * 0.7 + semanticScore * 0.3;

        const effectiveAlignment = Math.max(
          sectorAlignment,
          transferabilityFactor * 0.6
        );
        const isHighQuality =
          domainExpertise >= 45 &&
          technicalRelevance >= 35 &&
          effectiveAlignment >= 0.65;
        const isGoodQuality =
          domainExpertise >= 30 &&
          technicalRelevance >= 25 &&
          effectiveAlignment >= 0.45;
        const isAverageQuality =
          domainExpertise >= 20 && effectiveAlignment >= 0.3;

        let transferBonus = 1.0;
        if (
          transferabilityFactor >= 0.7 &&
          technicalRelevance >= 50 &&
          domainExpertise >= 45
        ) {
          transferBonus = 1.08;
        } else if (
          transferabilityFactor >= 0.6 &&
          technicalRelevance >= 35 &&
          domainExpertise >= 30
        ) {
          transferBonus = 1.05;
        }

        if (isHighQuality) {
          if (domainExpertise >= 60 && technicalRelevance >= 50) {
            transformedScore = Math.min(
              92,
              (75 + (baseScore - 40) * 1.8) * transferBonus
            );
          } else if (domainExpertise >= 45) {
            transformedScore = Math.min(
              85,
              (65 + (baseScore - 35) * 1.6) * transferBonus
            );
          } else {
            transformedScore = Math.min(
              78,
              (55 + (baseScore - 30) * 1.4) * transferBonus
            );
          }
        } else if (isGoodQuality) {
          if (domainExpertise >= 35) {
            transformedScore = (50 + (baseScore - 25) * 1.3) * transferBonus;
          } else {
            transformedScore = (40 + (baseScore - 20) * 1.2) * transferBonus;
          }
        } else if (isAverageQuality) {
          transformedScore =
            (25 + (baseScore - 15) * 1.1) * Math.min(transferBonus, 1.05);
        } else {
          transformedScore = Math.min(
            baseScore * Math.max(0.85, transferabilityFactor),
            30
          );
        }

        console.log(
          `[TRANSFER] Sector: ${sectorRelevance}, Transferability: ${transferabilityFactor.toFixed(
            2
          )}, Bonus: ${transferBonus.toFixed(2)}`
        );
      } else {
        // Transformation standard pour secteurs généraux (non banking/insurance)
        if (baseScore >= 35) {
          transformedScore = 50 + (baseScore - 35) * 1.8;
        } else if (baseScore >= 20) {
          transformedScore = 30 + (baseScore - 20) * 1.3;
        } else {
          transformedScore = baseScore * 1.1;
        }
      }

      const finalScore = Math.min(
        100,
        Math.max(0, Math.round(transformedScore))
      );

      const confidence = this.calculateConfidence(breakdown, profileContext);
      const recommendations = this.aggregateRecommendations(results);

      const totalTime = Date.now() - startTime;

      console.log(
        `[HYBRID_SCORING] BaseScore: ${Math.round(
          baseScore
        )}% -> FinalScore: ${finalScore}% (confidence: ${confidence}%) in ${totalTime}ms`
      );
      console.log(
        `[HYBRID_SCORING] Breakdown: V:${breakdown.vectorScore}% K:${breakdown.keywordScore}% E:${breakdown.embeddingScore}% S:${breakdown.semanticScore}%`
      );

      const result: HybridScoringResult = {
        finalScore: Math.min(100, Math.max(0, finalScore)),
        confidence,
        breakdown,
        weights: { ...this.config.weights },
        analysis: {
          sectorDetected: results.keyword?.sectorDetected || 'unknown',
          skillsAlignment:
            results.keyword?.matchingKeywords
              ?.filter((k: any) => k.found)
              .map((k: any) => k.keyword) || [],
          missingCompetencies: results.semantic?.missingCompetencies || [],
          recommendations,
          conceptualMatches: results.embedding?.semanticMatches || [],
          detailedJustification: this.generateDetailedJustification(
            finalScore,
            breakdown,
            results,
            profileContext.context
          ),
          strengths: this.identifyStrengths(breakdown, results),
          weaknesses: this.identifyWeaknesses(breakdown, results),
          matchExplanation: this.generateMatchExplanation(
            finalScore,
            breakdown,
            profileContext.context
          ),
        },
        performance: {
          totalTimeMs: totalTime,
          cacheHits,
          cacheMisses,
          phases: { ...this.performanceTracker },
        },
        metadata: {
          profileContext: profileContext.context,
          experienceLevel: profileContext.experienceLevel,
          domainExpertise: profileContext.domainExpertise,
        },
      };

      // Cache du résultat final
      if (tempConfig.useCache) {
        cacheScoringService.cacheHybridScore(
          jobText,
          cvText,
          tempConfig,
          result
        );
      }

      return result;
    } catch (error) {
      console.error('[HYBRID_SCORING] Error during scoring:', error);

      return {
        finalScore: 0,
        confidence: 0,
        breakdown: {
          vectorScore: results.vector?.score || 0,
          keywordScore: results.keyword?.score || 0,
          embeddingScore: results.embedding?.score || 0,
          semanticScore: results.semantic?.score || 0,
        },
        weights: { ...this.config.weights },
        analysis: {
          sectorDetected: 'error',
          skillsAlignment: [],
          missingCompetencies: [],
          recommendations: ['Erreur lors du calcul du score'],
          conceptualMatches: [],
          detailedJustification:
            "Une erreur est survenue lors de l'analyse du profil.",
          strengths: [],
          weaknesses: ['Analyse impossible à compléter'],
          matchExplanation: 'Erreur technique lors du calcul du score.',
        },
        performance: {
          totalTimeMs: Date.now() - startTime,
          cacheHits,
          cacheMisses,
          phases: { ...this.performanceTracker },
        },
        metadata: {
          profileContext: profileContext.context,
          experienceLevel: profileContext.experienceLevel,
          domainExpertise: profileContext.domainExpertise,
        },
      };
    }
  }

  public async batchScore(
    jobText: string,
    cvTexts: string[],
    options?: Partial<HybridScoringConfig>
  ): Promise<HybridScoringResult[]> {
    console.log(`[HYBRID_SCORING] Batch scoring ${cvTexts.length} CVs`);

    const results: HybridScoringResult[] = [];

    for (let i = 0; i < cvTexts.length; i++) {
      try {
        const result = await this.calculateHybridScore(
          jobText,
          cvTexts[i],
          options
        );
        results.push(result);
        console.log(
          `[HYBRID_SCORING] CV ${i + 1}/${cvTexts.length}: ${
            result.finalScore
          }% (${result.confidence}% confidence)`
        );
      } catch (error) {
        console.error(`[HYBRID_SCORING] Error scoring CV ${i + 1}:`, error);
        // Continuer avec les autres CVs
      }
    }

    return results.sort((a, b) => b.finalScore - a.finalScore);
  }

  public getServiceStats(): any {
    return {
      config: this.config,
      performanceTracker: this.performanceTracker,
      cacheStats: cacheScoringService.getStats(),
    };
  }

  public updateConfig(newConfig: Partial<HybridScoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[HYBRID_SCORING] Configuration updated:', this.config);
  }
}

export const hybridScoringService = new HybridScoringService();
