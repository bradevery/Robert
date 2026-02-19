/* eslint-disable @typescript-eslint/no-explicit-any */
import Fuse from 'fuse.js';
import * as stringSimilarity from 'string-similarity';

interface KeywordScoreResult {
  score: number;
  sectorDetected: string;
  matchingKeywords: { keyword: string; found: boolean; similarity?: number }[];
  sectorialBreakdown: { [sector: string]: number };
  coverage: number;
}

const SECTORIAL_KEYWORDS = {
  tech_fullstack: [
    'javascript',
    'typescript',
    'react',
    'nextjs',
    'nodejs',
    'express',
    'api',
    'rest',
    'graphql',
    'database',
    'sql',
    'postgresql',
    'mongodb',
    'docker',
    'aws',
    'cloud',
    'devops',
    'git',
    'agile',
    'scrum',
    'frontend',
    'backend',
    'fullstack',
    'html',
    'css',
    'jest',
    'testing',
    'microservices',
    'ci/cd',
    'kubernetes',
    'redis',
    'elasticsearch',
  ],

  data_science: [
    'python',
    'r',
    'machine learning',
    'deep learning',
    'tensorflow',
    'pytorch',
    'scikit-learn',
    'pandas',
    'numpy',
    'matplotlib',
    'seaborn',
    'jupyter',
    'statistics',
    'analytics',
    'big data',
    'spark',
    'hadoop',
    'sql',
    'visualization',
    'tableau',
    'powerbi',
    'nlp',
    'computer vision',
    'mlops',
    'kubeflow',
    'mlflow',
    'data mining',
    'predictive modeling',
  ],

  finance_banking: [
    'risk management',
    'credit risk',
    'market risk',
    'operational risk',
    'basel',
    'solvency',
    'ifrs',
    'gaap',
    'compliance',
    'audit',
    'regulatory',
    'quantitative analysis',
    'derivatives',
    'portfolio management',
    'trading',
    'investment',
    'financial modeling',
    'valuation',
    'stress testing',
    'capital adequacy',
    'liquidity risk',
    'aml',
    'kyc',
    'mifid',
    'gdpr',
    'corep',
    'finrep',
    'srep',
    // Enrichment from DB analysis
    'bddf',
    'asset management',
    "gestion d'actifs",
    'gestion de fonds',
    'banque privée',
    'financement',
    'investissement',
    'consolidation',
    'reporting',
    'contrôle de gestion',
    'comptabilité',
  ],

  insurance_sector: [
    'assurance',
    'insurance',
    'iard',
    'vie',
    'prévoyance',
    'santé',
    'mutuelle',
    'sinistre',
    'souscription',
    'actuariat',
    'courtage',
    'réassurance',
    'dommages',
    'responsabilité civile',
    'retraite',
    'épargne',
    'risques divers',
    'protection sociale',
    'solvabilité 2',
    'solvency ii',
  ],

  project_management_banking: [
    'moa',
    'moe',
    'pmo',
    'chef de projet',
    'project manager',
    'product owner',
    'business analyst',
    'scrum master',
    'agile',
    'cycle en v',
    'cahier des charges',
    'spécifications',
    'recette',
    'homologation',
    'uat',
    'conduite du changement',
    'pilotage',
    'budget',
    'planning',
    'risques',
    'comité de pilotage',
    'copil',
    'coproj',
    'ateliers',
    'expression de besoin',
    'user stories',
    'backlog',
    'jira',
    'confluence',
  ],

  crm_salesforce: [
    'salesforce',
    'crm',
    'apex',
    'visualforce',
    'lightning',
    'lwc',
    'soql',
    'sosl',
    'sales cloud',
    'service cloud',
    'marketing cloud',
    'commerce cloud',
    'experience cloud',
    'trailhead',
    'certified',
    'administrator',
    'developer',
    'consultant',
    'architect',
    'workflow',
    'process builder',
    'flow',
    'trigger',
    'class',
    'test',
    'deployment',
    'copado',
    'jira',
    'agile',
  ],

  marketing_digital: [
    'seo',
    'sem',
    'google ads',
    'facebook ads',
    'social media',
    'content marketing',
    'email marketing',
    'analytics',
    'conversion',
    'roi',
    'cpc',
    'ctr',
    'growth hacking',
    'a/b testing',
    'google analytics',
    'tag manager',
    'automation',
    'crm',
    'lead generation',
    'brand management',
    'influencer marketing',
    'affiliate marketing',
    'performance marketing',
  ],

  project_management: [
    'project management',
    'agile',
    'scrum',
    'kanban',
    'prince2',
    'pmp',
    'waterfall',
    'gantt',
    'milestone',
    'stakeholder',
    'budget',
    'timeline',
    'risk management',
    'resource planning',
    'team management',
    'communication',
    'leadership',
    'coordination',
    'planning',
    'delivery',
    'quality assurance',
    'change management',
    'jira',
  ],

  mobile_development: [
    'ios',
    'android',
    'swift',
    'kotlin',
    'objective-c',
    'java',
    'react native',
    'flutter',
    'dart',
    'xamarin',
    'ionic',
    'mobile ui',
    'responsive design',
    'app store',
    'google play',
    'push notifications',
    'core data',
    'realm',
    'firebase',
    'mobile testing',
    'testflight',
    'crashlytics',
  ],
};

export class KeywordScoringService {
  private fuseOptions: any;

  constructor() {
    this.fuseOptions = {
      threshold: 0.4, // Seuil de similarité (0 = exact, 1 = très flexible)
      includeScore: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
    };
  }

  public detectSector(text: string): string {
    const textLower = text.toLowerCase();
    const sectorScores: { [sector: string]: number } = {};

    Object.entries(SECTORIAL_KEYWORDS).forEach(([sector, keywords]) => {
      let matches = 0;

      keywords.forEach((keyword) => {
        if (textLower.includes(keyword.toLowerCase())) {
          matches++;
        }
      });

      sectorScores[sector] =
        keywords.length > 0 ? matches / keywords.length : 0;
    });

    const bestSector = Object.entries(sectorScores).sort(
      ([, a], [, b]) => b - a
    )[0];

    console.log(`[KEYWORD_SCORING] Sector detection:`, sectorScores);
    console.log(
      `[KEYWORD_SCORING] Best sector: ${bestSector[0]} (${(
        bestSector[1] * 100
      ).toFixed(1)}%)`
    );

    return bestSector[0];
  }

  private calculateSectorScore(
    text: string,
    sector: string
  ): {
    score: number;
    matches: { keyword: string; found: boolean; similarity?: number }[];
  } {
    const keywords = SECTORIAL_KEYWORDS[sector] || [];
    const textLower = text.toLowerCase();
    const fuse = new Fuse(keywords, this.fuseOptions);

    const matches: { keyword: string; found: boolean; similarity?: number }[] =
      [];
    let exactMatches = 0;
    let fuzzyMatches = 0;

    keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();

      // 1. Recherche exacte
      if (textLower.includes(keywordLower)) {
        matches.push({ keyword, found: true, similarity: 1.0 });
        exactMatches++;
      } else {
        const fuseResults = fuse.search(keyword);
        const bestMatch = fuseResults[0];

        if (bestMatch && bestMatch.score && bestMatch.score < 0.4) {
          matches.push({
            keyword,
            found: true,
            similarity: 1 - bestMatch.score,
          });
          fuzzyMatches++;
        } else {
          const words = textLower.split(/\s+/);
          const similarities = words.map((word) =>
            stringSimilarity.compareTwoStrings(word, keywordLower)
          );
          const maxSimilarity = Math.max(...similarities);

          if (maxSimilarity > 0.6) {
            matches.push({
              keyword,
              found: true,
              similarity: maxSimilarity,
            });
            fuzzyMatches++;
          } else {
            matches.push({ keyword, found: false });
          }
        }
      }
    });

    const totalMatches = exactMatches + fuzzyMatches * 0.7; // Pondération fuzzy
    const score =
      keywords.length > 0 ? (totalMatches / keywords.length) * 100 : 0;

    console.log(
      `[KEYWORD_SCORING] Sector ${sector}: ${exactMatches} exact + ${fuzzyMatches} fuzzy = ${score.toFixed(
        1
      )}%`
    );

    return { score: Math.min(100, score), matches };
  }

  public calculateKeywordScore(
    jobText: string,
    cvText: string
  ): KeywordScoreResult {
    try {
      const detectedSector = this.detectSector(jobText);

      const sectorialBreakdown: { [sector: string]: number } = {};
      let bestScore = 0;
      let bestMatches: {
        keyword: string;
        found: boolean;
        similarity?: number;
      }[] = [];

      Object.keys(SECTORIAL_KEYWORDS).forEach((sector) => {
        const sectorResult = this.calculateSectorScore(cvText, sector);
        sectorialBreakdown[sector] = sectorResult.score;

        if (sector === detectedSector) {
          bestScore = sectorResult.score;
          bestMatches = sectorResult.matches;
        }
      });

      const foundKeywords = bestMatches.filter((m) => m.found).length;
      const totalKeywords = bestMatches.length;
      const coverage =
        totalKeywords > 0 ? (foundKeywords / totalKeywords) * 100 : 0;

      const cvBestSector = Object.entries(sectorialBreakdown).sort(
        ([, a], [, b]) => b - a
      )[0];

      let finalScore = bestScore;
      if (cvBestSector[0] === detectedSector) {
        finalScore = Math.min(100, finalScore * 1.1); // Bonus 10%
        console.log(`[KEYWORD_SCORING] Sector alignment bonus applied!`);
      }

      console.log(
        `[KEYWORD_SCORING] Final score: ${finalScore.toFixed(
          1
        )}%, Coverage: ${coverage.toFixed(1)}%`
      );

      return {
        score: Math.round(finalScore),
        sectorDetected: detectedSector,
        matchingKeywords: bestMatches,
        sectorialBreakdown,
        coverage: Math.round(coverage),
      };
    } catch (error) {
      console.error('[KEYWORD_SCORING] Error:', error);
      return {
        score: 0,
        sectorDetected: 'unknown',
        matchingKeywords: [],
        sectorialBreakdown: {},
        coverage: 0,
      };
    }
  }

  public getMissingKeywords(
    jobText: string,
    cvText: string,
    limit = 5
  ): string[] {
    const sector = this.detectSector(jobText);
    const result = this.calculateSectorScore(cvText, sector);

    return result.matches
      .filter((match) => !match.found)
      .map((match) => match.keyword)
      .slice(0, limit);
  }

  public suggestImprovements(
    jobText: string,
    cvText: string
  ): {
    missingKeywords: string[];
    weakKeywords: string[];
    suggestedSections: string[];
  } {
    const sector = this.detectSector(jobText);
    const result = this.calculateSectorScore(cvText, sector);

    const missingKeywords = result.matches
      .filter((match) => !match.found)
      .map((match) => match.keyword)
      .slice(0, 5);

    const weakKeywords = result.matches
      .filter(
        (match) => match.found && match.similarity && match.similarity < 0.8
      )
      .map((match) => match.keyword)
      .slice(0, 3);

    const suggestedSections = [];
    if (missingKeywords.length > 0) {
      suggestedSections.push(
        `Ajouter des compétences en ${missingKeywords.slice(0, 2).join(', ')}`
      );
    }
    if (weakKeywords.length > 0) {
      suggestedSections.push(`Renforcer l'expérience en ${weakKeywords[0]}`);
    }

    return {
      missingKeywords,
      weakKeywords,
      suggestedSections,
    };
  }
}

export const keywordScoringService = new KeywordScoringService();
