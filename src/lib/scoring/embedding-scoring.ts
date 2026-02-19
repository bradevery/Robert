import OpenAI from 'openai';

interface EmbeddingScoreResult {
  score: number;
  similarity: number;
  jobEmbedding: number[];
  cvEmbedding: number[];
  semanticMatches: string[];
  conceptAlignment: {
    [concept: string]: number;
  };
}

interface BankingInsuranceConcepts {
  [key: string]: string[];
}

// Concepts spécialisés basés sur l'analyse réelle de la DB (1300 profils)
const BANKING_INSURANCE_CONCEPTS: BankingInsuranceConcepts = {
  risk_management: [
    'risque',
    'risk management',
    'contrôle des risques',
    'var',
    'stress test',
    'bâle',
    'basel',
    'solvabilité',
    'credit risk',
    'market risk',
    'operational risk',
  ],
  financial_control: [
    'contrôleur de gestion',
    'contrôle de gestion',
    'finance',
    'budget',
    'consolidation',
    'reporting financier',
    'analyse financière',
    'comptabilité',
  ],
  data_analytics: [
    'data analyst',
    'business analyst',
    'data science',
    'analytics',
    'machine learning',
    'reporting',
    'kpi',
    'dashboard',
    'bi',
  ],
  project_management: [
    'chef de projet',
    'project manager',
    'amoa',
    'scrum master',
    'agile',
    'gestion de projet',
    'coordination',
    'pilotage',
    'management',
  ],
  insurance_actuarial: [
    'actuaire',
    'actuariat',
    'tarification',
    'provisionnement',
    'solvency ii',
    'assurance vie',
    'iard',
    'souscription',
    'sinistre',
  ],
  banking_operations: [
    'banque',
    'bancaire',
    'crédit',
    'front office',
    'back office',
    'conseiller clientèle',
    'commercial banque',
    'compliance',
  ],
  technology_fintech: [
    'développeur',
    'senior',
    'lead developer',
    'fintech',
    'digital banking',
    'core banking',
    'api',
    'cloud',
    'cybersécurité',
  ],
  management_leadership: [
    'manager',
    'directeur',
    'responsable',
    'head',
    'senior manager',
    'leadership',
    'équipe',
    'strategy',
    'transformation',
  ],
};

export class EmbeddingScoringService {
  private openai: OpenAI;
  private readonly modelName = 'text-embedding-3-small'; // Plus efficace et moins cher

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY non configurée pour les embeddings');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Créer un embedding avec OpenAI
   */
  private async createEmbedding(text: string): Promise<number[]> {
    try {
      // Préprocesser le texte pour optimiser l'embedding
      const processedText = this.preprocessForEmbedding(text);

      const response = await this.openai.embeddings.create({
        model: this.modelName,
        input: processedText,
        encoding_format: 'float',
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('Aucun embedding généré');
      }

      return embedding;
    } catch (error) {
      console.error('[EMBEDDING_SCORING] Erreur création embedding:', error);
      throw new Error("Échec de création de l'embedding");
    }
  }

  /**
   * Préprocesser le texte pour optimiser l'embedding
   */
  private preprocessForEmbedding(text: string): string {
    // Nettoyer et structurer le texte pour de meilleurs embeddings
    let processed = text
      .toLowerCase()
      .replace(/[^\w\sàáâãäçèéêëìíîïñòóôõöùúûüýÿæœ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limiter la taille (OpenAI a une limite de tokens)
    if (processed.length > 8000) {
      processed = processed.substring(0, 8000) + '...';
    }

    return processed;
  }

  /**
   * Calculer la similarité cosinus entre deux vecteurs
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Les vecteurs doivent avoir la même dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Analyser l'alignement conceptuel avec les domaines banque/assurance
   */
  private analyzeConceptAlignment(
    jobText: string,
    cvText: string
  ): { [concept: string]: number } {
    const alignment: { [concept: string]: number } = {};

    const jobLower = jobText.toLowerCase();
    const cvLower = cvText.toLowerCase();

    Object.entries(BANKING_INSURANCE_CONCEPTS).forEach(
      ([concept, keywords]) => {
        let jobMatches = 0;
        let cvMatches = 0;

        keywords.forEach((keyword) => {
          if (jobLower.includes(keyword.toLowerCase())) {
            jobMatches++;
          }
          if (cvLower.includes(keyword.toLowerCase())) {
            cvMatches++;
          }
        });

        // Score d'alignement: plus il y a de correspondances dans les deux textes, mieux c'est
        const jobScore = jobMatches / keywords.length;
        const cvScore = cvMatches / keywords.length;

        // Moyenne harmonique pour privilégier les concepts présents dans les deux
        if (jobScore + cvScore > 0) {
          alignment[concept] = (2 * jobScore * cvScore) / (jobScore + cvScore);
        } else {
          alignment[concept] = 0;
        }
      }
    );

    return alignment;
  }

  /**
   * Identifier les correspondances sémantiques
   */
  private findSemanticMatches(
    jobText: string,
    cvText: string,
    conceptAlignment: { [concept: string]: number }
  ): string[] {
    const matches: string[] = [];

    // Ajouter les concepts avec un bon alignement
    Object.entries(conceptAlignment).forEach(([concept, score]) => {
      if (score > 0.3) {
        // Seuil d'alignement conceptuel
        const conceptName = concept.replace('_', ' ').toUpperCase();
        matches.push(`${conceptName} (${(score * 100).toFixed(1)}%)`);
      }
    });

    // Limiter à 8 correspondances max pour éviter le bruit
    return matches.slice(0, 8);
  }

  /**
   * Calculer le score de correspondance par embeddings
   */
  public async calculateEmbeddingScore(
    jobText: string,
    cvText: string
  ): Promise<EmbeddingScoreResult> {
    try {
      console.log('[EMBEDDING_SCORING] Génération des embeddings...');

      // 1. Créer les embeddings
      const [jobEmbedding, cvEmbedding] = await Promise.all([
        this.createEmbedding(jobText),
        this.createEmbedding(cvText),
      ]);

      // 2. Calculer similarité cosinus
      const similarity = this.cosineSimilarity(jobEmbedding, cvEmbedding);

      // 3. Analyser l'alignement conceptuel
      const conceptAlignment = this.analyzeConceptAlignment(jobText, cvText);

      // 4. Identifier les correspondances sémantiques
      const semanticMatches = this.findSemanticMatches(
        jobText,
        cvText,
        conceptAlignment
      );

      // 5. Calculer le score final (0-100)
      const baseScore = Math.max(0, similarity) * 100;

      // 6. Appliquer bonus pour alignement conceptuel banque/assurance
      const conceptBonus = Object.values(conceptAlignment).reduce(
        (sum, score) => sum + score,
        0
      );
      const conceptBonusNormalized = Math.min(10, conceptBonus * 2); // Max 10% de bonus

      const finalScore = Math.min(100, baseScore + conceptBonusNormalized);

      console.log(
        `[EMBEDDING_SCORING] Similarité cosinus: ${similarity.toFixed(4)}`
      );
      console.log(
        `[EMBEDDING_SCORING] Score base: ${baseScore.toFixed(
          1
        )}%, Bonus conceptuel: +${conceptBonusNormalized.toFixed(1)}%`
      );
      console.log(`[EMBEDDING_SCORING] Score final: ${finalScore.toFixed(1)}%`);

      return {
        score: Math.round(finalScore),
        similarity,
        jobEmbedding,
        cvEmbedding,
        semanticMatches,
        conceptAlignment,
      };
    } catch (error) {
      console.error('[EMBEDDING_SCORING] Error:', error);
      return {
        score: 0,
        similarity: 0,
        jobEmbedding: [],
        cvEmbedding: [],
        semanticMatches: [],
        conceptAlignment: {},
      };
    }
  }

  /**
   * Comparer un CV avec plusieurs offres d'emploi (batch processing)
   */
  public async batchCompare(
    cvText: string,
    jobTexts: string[]
  ): Promise<EmbeddingScoreResult[]> {
    try {
      const cvEmbedding = await this.createEmbedding(cvText);
      const results: EmbeddingScoreResult[] = [];

      for (const jobText of jobTexts) {
        const jobEmbedding = await this.createEmbedding(jobText);
        const similarity = this.cosineSimilarity(cvEmbedding, jobEmbedding);
        const conceptAlignment = this.analyzeConceptAlignment(jobText, cvText);
        const semanticMatches = this.findSemanticMatches(
          jobText,
          cvText,
          conceptAlignment
        );

        const baseScore = Math.max(0, similarity) * 100;
        const conceptBonus = Object.values(conceptAlignment).reduce(
          (sum, score) => sum + score,
          0
        );
        const conceptBonusNormalized = Math.min(10, conceptBonus * 2);
        const finalScore = Math.min(100, baseScore + conceptBonusNormalized);

        results.push({
          score: Math.round(finalScore),
          similarity,
          jobEmbedding,
          cvEmbedding,
          semanticMatches,
          conceptAlignment,
        });
      }

      return results;
    } catch (error) {
      console.error('[EMBEDDING_SCORING] Batch compare error:', error);
      throw error;
    }
  }

  /**
   * Analyser la qualité d'un embedding (pour debug)
   */
  public async analyzeEmbeddingQuality(text: string): Promise<{
    dimensionality: number;
    magnitude: number;
    sparsity: number; // Pourcentage de valeurs proches de 0
  }> {
    try {
      const embedding = await this.createEmbedding(text);

      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );
      const nearZeroCount = embedding.filter(
        (val) => Math.abs(val) < 0.001
      ).length;
      const sparsity = nearZeroCount / embedding.length;

      return {
        dimensionality: embedding.length,
        magnitude,
        sparsity,
      };
    } catch (error) {
      console.error('[EMBEDDING_SCORING] Quality analysis error:', error);
      throw error;
    }
  }
}

// Export singleton
export const embeddingScoringService = new EmbeddingScoringService();
