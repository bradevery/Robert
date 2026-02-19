/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';

import {
  analyzeAuthenticity,
  extractFrenchContextualKeywords,
  FrenchExtractedData,
  generateNaturalSuggestions,
} from '../ai/mistral-client';
import {
  AuthenticMatchConfig,
  MultiDimensionalMatcher,
  MultiDimensionalScore,
} from '../matching/multi-dimensional-matcher';

export interface AuthenticMatchResult {
  score: MultiDimensionalScore;
  authenticity: {
    globalScore: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
    recommendations: string[];
    breakdown: {
      naturalLanguage: number;
      temporalCoherence: number;
      personality: number;
      keywordDensity: number;
      uniqueness: number;
    };
  };
  suggestions: Array<{
    id: string;
    type: 'improvement' | 'addition' | 'reformulation' | 'structure';
    section: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    example: string;
    impact: number;
    isNatural: boolean;
    preservesAuthenticity: boolean;
  }>;
  summary: {
    overallScore: number;
    matchLevel: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

export class AuthenticMatch {
  private matcher: MultiDimensionalMatcher;

  constructor(
    private prisma: PrismaClient,
    private config: AuthenticMatchConfig
  ) {
    this.matcher = new MultiDimensionalMatcher(prisma, config);
  }

  async analyzeMatch(
    cvText: string,
    jobText: string,
    userId?: string
  ): Promise<AuthenticMatchResult> {
    const startTime = Date.now();

    try {
      // 1. Extraction contextuelle française
      console.log('🔍 Extraction des données contextuelles...');
      const [cvData, jobData] = await Promise.all([
        extractFrenchContextualKeywords(cvText, 'cv'),
        extractFrenchContextualKeywords(jobText, 'job'),
      ]);

      // 2. Analyse d'authenticité
      console.log("🎯 Analyse d'authenticité...");
      const authenticity = await analyzeAuthenticity(cvText, cvData);

      // 3. Matching multi-dimensionnel
      console.log('📊 Calcul du matching multi-dimensionnel...');
      const score = await this.matcher.calculateMatch(
        cvData,
        jobData,
        authenticity.globalScore
      );

      // 4. Génération de suggestions naturelles
      console.log('💡 Génération de suggestions...');
      const suggestions = await generateNaturalSuggestions(
        cvData,
        jobData,
        score,
        authenticity.globalScore
      );

      // 5. Résumé pour l'utilisateur
      const summary = this.generateSummary(score, authenticity, suggestions);

      // 6. Sauvegarder en base de données si userId fourni
      if (userId) {
        await this.saveAnalysis({
          cvData,
          jobData,
          score,
          authenticity,
          suggestions,
          userId,
          processingTime: Date.now() - startTime,
        });
      }

      console.log(`✅ Analyse terminée en ${Date.now() - startTime}ms`);

      return {
        score,
        authenticity,
        suggestions,
        summary,
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'analyse:", error);
      throw new Error(`Échec de l'analyse de matching: ${error.message}`);
    }
  }

  private generateSummary(
    score: MultiDimensionalScore,
    authenticity: any,
    suggestions: any[]
  ): AuthenticMatchResult['summary'] {
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Points forts
    if (score.breakdown.technical.score > 0.8) {
      strengths.push('Excellente correspondance technique');
    }
    if (score.breakdown.education.isEquivalent) {
      strengths.push('Formation adaptée aux exigences');
    }
    if (authenticity.globalScore > 0.8) {
      strengths.push('CV authentique et personnalisé');
    }
    if (score.breakdown.cultural.score > 0.7) {
      strengths.push('Bon alignement culturel');
    }

    // Axes d'amélioration
    if (score.breakdown.technical.missing.length > 0) {
      improvements.push(
        `${score.breakdown.technical.missing.length} compétences à développer`
      );
    }
    if (authenticity.issues.length > 0) {
      improvements.push("Quelques ajustements pour plus d'authenticité");
    }
    if (score.breakdown.experience.score < 0.7) {
      improvements.push('Expérience à mieux valoriser');
    }
    if (score.breakdown.softSkills.missing.length > 0) {
      improvements.push('Soft skills à mettre en avant');
    }

    return {
      overallScore: score.overall,
      matchLevel: this.getMatchLevel(score.overall),
      strengths,
      improvements,
      nextSteps: suggestions.slice(0, 3).map((s) => s.suggestion),
    };
  }

  private getMatchLevel(score: number): string {
    if (score >= 0.85) return 'Excellent match';
    if (score >= 0.7) return 'Bon match';
    if (score >= 0.5) return 'Match partiel';
    return 'Match limité';
  }

  private async saveAnalysis(data: {
    cvData: FrenchExtractedData;
    jobData: FrenchExtractedData;
    score: MultiDimensionalScore;
    authenticity: any;
    suggestions: any[];
    userId: string;
    processingTime: number;
  }): Promise<void> {
    try {
      // Créer un job temporaire pour l'analyse
      const job = await this.prisma.job.create({
        data: {
          userId: data.userId,
          title: 'Analyse temporaire',
          description: JSON.stringify(data.jobData),
          extractedData: {
            create: {
              keywords: data.jobData,
              fullTextEmbedding: [], // À remplir si nécessaire
              requirementsEmbedding: [],
              cultureEmbedding: [],
            },
          },
        },
      });

      // Créer l'analyse de matching
      await this.prisma.matchingAnalysis.create({
        data: {
          resumeId: 'temp', // À remplir avec l'ID du CV réel
          jobId: job.id,
          userId: data.userId,
          overallScore: data.score.overall * 100, // Convertir en pourcentage
          authenticityBonus: data.authenticity.globalScore * 10,
          technicalSkillsScore: data.score.breakdown.technical.score * 100,
          experienceScore: data.score.breakdown.experience.score * 100,
          educationScore: data.score.breakdown.education.score * 100,
          softSkillsScore: data.score.breakdown.softSkills.score * 100,
          culturalFitScore: data.score.breakdown.cultural.score * 100,
          authenticityScore: data.authenticity.globalScore * 100,
          skillsAnalysis: data.score.breakdown.technical,
          frenchContextAnalysis: data.score.breakdown.education,
          naturalSuggestions: data.suggestions,
          overOptimizationFlags: data.authenticity.issues,
          adaptiveWeights: data.score.adaptiveWeights,
          sectorContext: 'tech', // À détecter automatiquement
          processingTime: data.processingTime,
          matchingVersion: '2.0',
        },
      });

      console.log('💾 Analyse sauvegardée en base de données');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      // Ne pas faire échouer l'analyse pour une erreur de sauvegarde
    }
  }

  // Méthode pour obtenir les métriques de performance
  async getPerformanceMetrics(): Promise<{
    totalAnalyses: number;
    avgProcessingTime: number;
    avgAuthenticityScore: number;
    avgMatchScore: number;
    cacheHitRate: number;
  }> {
    try {
      const metrics = await this.prisma.matchingMetrics.findFirst({
        orderBy: { date: 'desc' },
      });

      if (metrics) {
        return {
          totalAnalyses: metrics.totalMatches,
          avgProcessingTime: metrics.avgProcessingTime,
          avgAuthenticityScore: metrics.avgAuthenticityScore,
          avgMatchScore: metrics.avgMatchScore,
          cacheHitRate: metrics.cacheHitRate,
        };
      }

      // Métriques par défaut si aucune donnée
      return {
        totalAnalyses: 0,
        avgProcessingTime: 0,
        avgAuthenticityScore: 0,
        avgMatchScore: 0,
        cacheHitRate: 0,
      };
    } catch (error) {
      console.error('❌ Erreur récupération métriques:', error);
      return {
        totalAnalyses: 0,
        avgProcessingTime: 0,
        avgAuthenticityScore: 0,
        avgMatchScore: 0,
        cacheHitRate: 0,
      };
    }
  }

  // Méthode pour mettre à jour les métriques quotidiennes
  async updateDailyMetrics(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculer les métriques du jour
      const todayAnalyses = await this.prisma.matchingAnalysis.findMany({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });

      const totalMatches = todayAnalyses.length;
      const authenticMatches = todayAnalyses.filter(
        (a) => a.authenticityScore > 50
      ).length;
      const avgAuthenticityScore =
        todayAnalyses.reduce((sum, a) => sum + a.authenticityScore, 0) /
          totalMatches || 0;
      const avgMatchScore =
        todayAnalyses.reduce((sum, a) => sum + a.overallScore, 0) /
          totalMatches || 0;
      const avgProcessingTime =
        todayAnalyses.reduce((sum, a) => sum + a.processingTime, 0) /
          totalMatches || 0;

      // Sauvegarder ou mettre à jour les métriques
      await this.prisma.matchingMetrics.upsert({
        where: { date: today },
        update: {
          totalMatches,
          authenticMatches,
          avgAuthenticityScore,
          avgMatchScore,
          avgProcessingTime,
        },
        create: {
          date: today,
          totalMatches,
          authenticMatches,
          avgAuthenticityScore,
          avgMatchScore,
          avgProcessingTime,
        },
      });

      console.log('📊 Métriques quotidiennes mises à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour métriques:', error);
    }
  }
}

// Configuration par défaut pour le matching authentique
export const defaultAuthenticMatchConfig: AuthenticMatchConfig = {
  weights: {
    tech: {
      technical: 0.35,
      experience: 0.2,
      education: 0.1,
      softSkills: 0.15,
      cultural: 0.1,
      authenticity: 0.1,
    },
    finance: {
      technical: 0.25,
      experience: 0.25,
      education: 0.15,
      softSkills: 0.2,
      cultural: 0.1,
      authenticity: 0.05,
    },
    healthcare: {
      technical: 0.3,
      experience: 0.25,
      education: 0.2,
      softSkills: 0.15,
      cultural: 0.05,
      authenticity: 0.05,
    },
    default: {
      technical: 0.3,
      experience: 0.2,
      education: 0.15,
      softSkills: 0.15,
      cultural: 0.1,
      authenticity: 0.1,
    },
  },
  thresholds: {
    overOptimization: 0.15,
    genericPhrases: 3,
    minAuthenticity: 0.5,
    suspiciousPatterns: [
      'expert en tout',
      'maîtrise parfaite',
      'ninja',
      'rock star',
      'guru',
    ],
  },
  frenchContext: {
    diplomaEquivalences: true,
    culturalMatching: true,
    regionalPreferences: true,
    languageLevels: true,
  },
};
