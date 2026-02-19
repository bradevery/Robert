/* eslint-disable @typescript-eslint/no-explicit-any */
import nlp from 'compromise';

// Extension du lexique compromise pour le secteur bancaire/assurance
const BANKING_INSURANCE_LEXICON = {
  // Compétences techniques bancaires
  solvabilité: 'Skill',
  bâle: 'Skill',
  ifrs: 'Skill',
  mifid: 'Skill',
  corep: 'Skill',
  finrep: 'Skill',
  srep: 'Skill',
  prudentiel: 'Skill',
  aml: 'Skill',
  kyc: 'Skill',

  // Risk Management
  var: 'RiskMetric',
  'stress testing': 'RiskMethod',
  backtesting: 'RiskMethod',
  'credit risk': 'RiskType',
  'market risk': 'RiskType',
  'operational risk': 'RiskType',
  'liquidity risk': 'RiskType',
  'concentration risk': 'RiskType',

  // Assurance
  'solvency ii': 'InsuranceRegulation',
  actuariat: 'InsuranceSkill',
  provisionnement: 'InsuranceSkill',
  underwriting: 'InsuranceSkill',
  'claims management': 'InsuranceProcess',

  // IT Banking
  'core banking': 'BankingSystem',
  swift: 'BankingSystem',
  sepa: 'PaymentSystem',
  target2: 'PaymentSystem',
  psd2: 'PaymentRegulation',

  // Management
  'change management': 'ManagementSkill',
  'stakeholder management': 'ManagementSkill',
  'project portfolio': 'ManagementMethod',
  governance: 'ManagementConcept',
};

interface SemanticScoreResult {
  score: number;
  skillsExtracted: {
    banking: string[];
    insurance: string[];
    risk: string[];
    it: string[];
    management: string[];
    finance: string[];
  };
  contextualMatching: {
    domainAlignment: number;
    experienceRelevance: number;
    skillDepth: number;
  };
  semanticSimilarity: number;
  missingCompetencies: string[];
  recommendations: string[];
}

export class SemanticScoringService {
  private nlpDoc: any;

  constructor() {
    // Extension simple du lexique compromise
    try {
      // Tentative d'extension du lexique si possible
      if (typeof nlp.extend === 'function') {
        nlp.extend({
          words: BANKING_INSURANCE_LEXICON,
        });
      }
    } catch (error) {
      console.warn('[SEMANTIC_SCORING] Could not extend NLP lexicon:', error);
    }
  }

  /**
   * Extraire les compétences par domaine bancaire/assurance
   */
  private extractSkillsByDomain(text: string): {
    banking: string[];
    insurance: string[];
    risk: string[];
    it: string[];
    management: string[];
    finance: string[];
  } {
    const doc = nlp(text);

    const skills = {
      banking: this.extractBankingSkills(doc),
      insurance: this.extractInsuranceSkills(doc),
      risk: this.extractRiskSkills(doc),
      it: this.extractITSkills(doc),
      management: this.extractManagementSkills(doc),
      finance: this.extractFinanceSkills(doc),
    };

    console.log(`[SEMANTIC_SCORING] Skills extracted:`, {
      banking: skills.banking.length,
      insurance: skills.insurance.length,
      risk: skills.risk.length,
      it: skills.it.length,
      management: skills.management.length,
      finance: skills.finance.length,
    });

    return skills;
  }

  /**
   * Extraire compétences bancaires spécifiques
   */
  private extractBankingSkills(doc: any): string[] {
    const bankingTerms = [
      'solvabilité',
      'bâle',
      'capital adequacy',
      'tier 1',
      'tier 2',
      'corep',
      'finrep',
      'srep',
      'icaap',
      'ilaap',
      'crr',
      'crd',
      'prudentiel',
      'supervisory review',
      'core banking',
      'swift',
      'sepa',
      'target2',
      'psd2',
      'crédit',
      'loan',
      'mortgage',
      'retail banking',
      'corporate banking',
      'investment banking',
      'private banking',
    ];

    return this.findTermsInDoc(doc, bankingTerms);
  }

  /**
   * Extraire compétences assurance
   */
  private extractInsuranceSkills(doc: any): string[] {
    const insuranceTerms = [
      'solvency ii',
      'actuariat',
      'actuarial',
      'provisionnement',
      'underwriting',
      'claims',
      'sinistres',
      'tarification',
      'réassurance',
      'reinsurance',
      'cat modelling',
      'vie',
      'non-vie',
      'iard',
      'prévoyance',
      'asset liability management',
      'alm',
    ];

    return this.findTermsInDoc(doc, insuranceTerms);
  }

  /**
   * Extraire compétences risk management
   */
  private extractRiskSkills(doc: any): string[] {
    const riskTerms = [
      'risk management',
      'credit risk',
      'market risk',
      'operational risk',
      'liquidity risk',
      'concentration risk',
      'var',
      'value at risk',
      'expected shortfall',
      'stress testing',
      'backtesting',
      'scenario analysis',
      'monte carlo',
      'risk appetite',
      'risk framework',
      'rating',
      'scoring',
      'pd',
      'lgd',
      'ead',
      'irb',
      'standardised approach',
    ];

    return this.findTermsInDoc(doc, riskTerms);
  }

  /**
   * Extraire compétences IT bancaire/assurance
   */
  private extractITSkills(doc: any): string[] {
    const itTerms = [
      'core banking system',
      'cbs',
      'temenos',
      'finastra',
      'sap banking',
      'oracle flexcube',
      'misys',
      'swift integration',
      'api banking',
      'open banking',
      'blockchain',
      'cryptocurrency',
      'fintech',
      'regulatory reporting',
      'data governance',
      'cybersécurité',
      'fraud detection',
      'aml systems',
      'sql server',
      'oracle database',
      'mainframe',
      'cobol',
      'java banking',
      'python finance',
    ];

    return this.findTermsInDoc(doc, itTerms);
  }

  /**
   * Extraire compétences management bancaire
   */
  private extractManagementSkills(doc: any): string[] {
    const managementTerms = [
      'change management',
      'transformation digitale',
      'stakeholder management',
      'project portfolio',
      'governance',
      'compliance management',
      'audit',
      'contrôle interne',
      'risk governance',
      'comité',
      'board reporting',
      'management reporting',
      'kpi',
      'balanced scorecard',
      'performance management',
      'équipe',
      'leadership',
      'coaching',
      'formation',
    ];

    return this.findTermsInDoc(doc, managementTerms);
  }

  /**
   * Extraire compétences finance
   */
  private extractFinanceSkills(doc: any): string[] {
    const financeTerms = [
      'comptabilité',
      'ifrs',
      'gaap',
      'consolidation',
      'budget',
      'forecasting',
      'planning financier',
      'cash management',
      'trésorerie',
      'alm',
      'trading',
      'fixed income',
      'equity',
      'derivatives',
      'portfolio management',
      'asset management',
      'valuation',
      'mark to market',
      'fair value',
      'hedge accounting',
      'transfer pricing',
    ];

    return this.findTermsInDoc(doc, financeTerms);
  }

  /**
   * Chercher des termes dans le document analysé
   */
  private findTermsInDoc(doc: any, terms: string[]): string[] {
    const foundTerms: string[] = [];
    const docText = doc.text().toLowerCase();

    terms.forEach((term) => {
      if (docText.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    });

    // Utiliser compromise pour extraire des compétences supplémentaires
    const skills = doc.match('#Skill').out('array');
    const nouns = doc.match('#Noun').out('array');

    // Filtrer les noms qui pourraient être des compétences
    const potentialSkills = nouns.filter(
      (noun: string) =>
        noun.length > 3 &&
        !['années', 'experience', 'société', 'entreprise', 'poste'].includes(
          noun.toLowerCase()
        )
    );

    return [...foundTerms, ...skills, ...potentialSkills.slice(0, 5)];
  }

  /**
   * Analyser l'alignement contextuel avec le domaine bancaire/assurance
   */
  private analyzeContextualAlignment(
    jobSkills: any,
    cvSkills: any
  ): {
    domainAlignment: number;
    experienceRelevance: number;
    skillDepth: number;
  } {
    // 1. Alignement par domaine
    const jobDomains = Object.keys(jobSkills).filter(
      (domain) => jobSkills[domain].length > 0
    );
    const cvDomains = Object.keys(cvSkills).filter(
      (domain) => cvSkills[domain].length > 0
    );
    const commonDomains = jobDomains.filter((domain) =>
      cvDomains.includes(domain)
    );
    const domainAlignment =
      jobDomains.length > 0
        ? (commonDomains.length / jobDomains.length) * 100
        : 0;

    // 2. Pertinence de l'expérience
    const totalJobSkills = Object.values(jobSkills).flat().length;
    const totalCvSkills = Object.values(cvSkills).flat().length;
    const experienceRelevance =
      totalCvSkills > 0
        ? Math.min(100, (totalCvSkills / Math.max(1, totalJobSkills)) * 100)
        : 0;

    // 3. Profondeur des compétences (diversité)
    const cvSkillDistribution = Object.values(cvSkills).map(
      (skills) => (skills as string[]).length
    );
    const maxSkillsInDomain = Math.max(...cvSkillDistribution);
    const avgSkillsPerDomain =
      cvSkillDistribution.reduce((a, b) => a + b, 0) /
      cvSkillDistribution.length;
    const skillDepth =
      maxSkillsInDomain > 0
        ? (avgSkillsPerDomain / maxSkillsInDomain) * 100
        : 0;

    return {
      domainAlignment: Math.round(domainAlignment),
      experienceRelevance: Math.round(experienceRelevance),
      skillDepth: Math.round(skillDepth),
    };
  }

  /**
   * Identifier les compétences manquantes importantes
   */
  private identifyMissingCompetencies(jobSkills: any, cvSkills: any): string[] {
    const missing: string[] = [];

    Object.keys(jobSkills).forEach((domain) => {
      const jobDomainSkills = jobSkills[domain] as string[];
      const cvDomainSkills = cvSkills[domain] as string[];

      const missingInDomain = jobDomainSkills.filter(
        (skill) =>
          !cvDomainSkills.some(
            (cvSkill) =>
              cvSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(cvSkill.toLowerCase())
          )
      );

      missing.push(...missingInDomain.slice(0, 2)); // Top 2 par domaine
    });

    return missing.slice(0, 5); // Top 5 global
  }

  /**
   * Générer des recommandations d'amélioration
   */
  private generateRecommendations(
    missingCompetencies: string[],
    contextual: any
  ): string[] {
    const recommendations: string[] = [];

    if (contextual.domainAlignment < 70) {
      recommendations.push(
        "Renforcer l'expérience dans les domaines clés du poste"
      );
    }

    if (contextual.skillDepth < 60) {
      recommendations.push(
        "Approfondir l'expertise dans un domaine spécialisé"
      );
    }

    if (missingCompetencies.length > 3) {
      recommendations.push(
        `Acquérir des compétences en ${missingCompetencies
          .slice(0, 2)
          .join(' et ')}`
      );
    }

    if (contextual.experienceRelevance < 50) {
      recommendations.push(
        "Mettre en avant l'expérience bancaire/assurance existante"
      );
    }

    return recommendations;
  }

  /**
   * Calculer le score sémantique global
   */
  public calculateSemanticScore(
    jobText: string,
    cvText: string
  ): SemanticScoreResult {
    try {
      console.log(
        `[SEMANTIC_SCORING] Analyzing job (${jobText.length} chars) vs CV (${cvText.length} chars)`
      );

      // 1. Extraire les compétences par domaine
      const jobSkills = this.extractSkillsByDomain(jobText);
      const cvSkills = this.extractSkillsByDomain(cvText);

      // 2. Analyser l'alignement contextuel
      const contextualMatching = this.analyzeContextualAlignment(
        jobSkills,
        cvSkills
      );

      // 3. Calculer la similarité sémantique globale
      const totalJobSkills = Object.values(jobSkills).flat().length;
      const _totalCvSkills = Object.values(cvSkills).flat().length;
      const commonSkills = Object.keys(jobSkills).reduce((acc, domain) => {
        const jobDomainSkills = jobSkills[domain] as string[];
        const cvDomainSkills = cvSkills[domain] as string[];

        const common = jobDomainSkills.filter((jobSkill) =>
          cvDomainSkills.some(
            (cvSkill) => this.calculateTermSimilarity(jobSkill, cvSkill) > 0.7
          )
        );

        return acc + common.length;
      }, 0);

      const semanticSimilarity =
        totalJobSkills > 0 ? commonSkills / totalJobSkills : 0;

      // 4. Score final pondéré et calibré pour des scores réalistes
      const finalScore = Math.round(
        semanticSimilarity * 0.5 * 100 + // 50% similarité directe (en décimales)
          contextualMatching.domainAlignment * 0.25 + // 25% alignement domaines
          contextualMatching.experienceRelevance * 0.15 + // 15% pertinence expérience
          contextualMatching.skillDepth * 0.1 // 10% profondeur compétences
      );

      // 5. Identifier manques et recommandations
      const missingCompetencies = this.identifyMissingCompetencies(
        jobSkills,
        cvSkills
      );
      const recommendations = this.generateRecommendations(
        missingCompetencies,
        contextualMatching
      );

      console.log(
        `[SEMANTIC_SCORING] Final score: ${finalScore}%, Similarity: ${(
          semanticSimilarity * 100
        ).toFixed(1)}%`
      );

      return {
        score: Math.min(100, Math.max(0, finalScore)),
        skillsExtracted: {
          banking: cvSkills.banking,
          insurance: cvSkills.insurance,
          risk: cvSkills.risk,
          it: cvSkills.it,
          management: cvSkills.management,
          finance: cvSkills.finance,
        },
        contextualMatching,
        semanticSimilarity: Math.round(semanticSimilarity * 100),
        missingCompetencies,
        recommendations,
      };
    } catch (error) {
      console.error('[SEMANTIC_SCORING] Error:', error);
      return {
        score: 0,
        skillsExtracted: {
          banking: [],
          insurance: [],
          risk: [],
          it: [],
          management: [],
          finance: [],
        },
        contextualMatching: {
          domainAlignment: 0,
          experienceRelevance: 0,
          skillDepth: 0,
        },
        semanticSimilarity: 0,
        missingCompetencies: [],
        recommendations: [],
      };
    }
  }

  /**
   * Calculer la similarité entre deux termes
   */
  private calculateTermSimilarity(term1: string, term2: string): number {
    const t1 = term1.toLowerCase();
    const t2 = term2.toLowerCase();

    if (t1 === t2) return 1.0;
    if (t1.includes(t2) || t2.includes(t1)) return 0.8;

    // Calcul Levenshtein simplifié
    const maxLen = Math.max(t1.length, t2.length);
    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(t1, t2);
    return 1.0 - distance / maxLen;
  }

  /**
   * Distance de Levenshtein
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

// Export singleton
export const semanticScoringService = new SemanticScoringService();
