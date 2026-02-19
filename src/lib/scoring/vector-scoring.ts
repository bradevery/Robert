import { PorterStemmer, WordTokenizer } from 'natural';

interface VectorScoreResult {
  score: number;
  similarity: number;
  jobVector: number[];
  cvVector: number[];
  commonTerms: string[];
}

export class VectorScoringService {
  private tokenizer: WordTokenizer;

  constructor() {
    this.tokenizer = new WordTokenizer();
  }

  /**
   * Preprocessing du texte - tokenisation, stemming, suppression stopwords
   */
  private preprocessText(text: string): string[] {
    // Nettoyer et normaliser
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Supprimer ponctuation
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim();

    // Tokeniser
    const tokens = this.tokenizer.tokenize(cleanText) || [];

    // Supprimer les stopwords (en français et anglais)
    const frenchStopwords = [
      'le',
      'de',
      'un',
      'à',
      'être',
      'et',
      'en',
      'avoir',
      'que',
      'pour',
      'dans',
      'ce',
      'son',
      'une',
      'sur',
      'avec',
      'ne',
      'se',
      'pas',
      'tout',
      'pouvoir',
      'par',
      'plus',
      'dire',
      'me',
      'on',
      'mon',
      'lui',
      'nous',
      'comme',
      'mais',
      'faire',
      'ses',
      'tu',
      'ou',
      'cette',
      'ainsi',
      'leur',
    ];
    const englishStopwords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'a',
      'an',
      'is',
      'are',
      'was',
      'were',
    ];
    const allStopwords = [...frenchStopwords, ...englishStopwords];

    const withoutStopwords = tokens.filter(
      (token) => !allStopwords.includes(token.toLowerCase()) && token.length > 2
    );

    // Stemming et filtrage
    return withoutStopwords
      .map((token) => PorterStemmer.stem(token))
      .filter((token) => token.length > 2) // Mots > 2 caractères
      .filter((token) => !/^\d+$/.test(token)); // Pas que des chiffres
  }

  /**
   * Créer un vocabulaire commun entre deux textes
   */
  private createVocabulary(jobTokens: string[], cvTokens: string[]): string[] {
    const uniqueTokens = new Set([...jobTokens, ...cvTokens]);
    const allTokens = Array.from(uniqueTokens);
    return allTokens.sort();
  }

  /**
   * Calculer la fréquence des termes (TF)
   */
  private calculateTermFrequency(
    tokens: string[],
    vocabulary: string[]
  ): number[] {
    const tf = new Array(vocabulary.length).fill(0);
    const totalTerms = tokens.length;

    vocabulary.forEach((term, index) => {
      const termCount = tokens.filter((token) => token === term).length;
      tf[index] = termCount / totalTerms;
    });

    return tf;
  }

  /**
   * Calculer IDF adapté pour 2 documents
   * Utilise log(1 + totalDocs/docsWithTerm) pour éviter IDF=0
   */
  private calculateIDF(
    vocabulary: string[],
    jobTokens: string[],
    cvTokens: string[]
  ): number[] {
    const documents = [jobTokens, cvTokens];
    const totalDocs = documents.length;

    return vocabulary.map((term) => {
      const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;

      // Formule adaptée pour éviter IDF=0 avec 2 documents:
      // - Terme dans 1 doc: log(1 + 2/1) = log(3) = 1.099
      // - Terme dans 2 docs: log(1 + 2/2) = log(2) = 0.693
      return docsWithTerm > 0 ? Math.log(1 + totalDocs / docsWithTerm) : 0;
    });
  }

  /**
   * Créer un vecteur TF-IDF
   */
  private createTFIDFVector(
    tokens: string[],
    vocabulary: string[],
    idf: number[]
  ): number[] {
    const tf = this.calculateTermFrequency(tokens, vocabulary);

    return tf.map((tfValue, index) => tfValue * idf[index]);
  }

  /**
   * Normaliser un vecteur
   */
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) return vector;

    return vector.map((val) => val / magnitude);
  }

  /**
   * Calculer la similarité cosinus entre deux vecteurs
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
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
   * Trouver les termes communs entre job et CV
   */
  private findCommonTerms(jobTokens: string[], cvTokens: string[]): string[] {
    const jobSet = new Set(jobTokens);
    const cvSet = new Set(cvTokens);

    return Array.from(jobSet).filter((token) => cvSet.has(token));
  }

  /**
   * Calculer le score de similarité vectorielle
   */
  public calculateVectorSimilarity(
    jobText: string,
    cvText: string
  ): VectorScoreResult {
    try {
      // 1. Preprocessing
      const jobTokens = this.preprocessText(jobText);
      const cvTokens = this.preprocessText(cvText);

      if (jobTokens.length === 0 || cvTokens.length === 0) {
        return {
          score: 0,
          similarity: 0,
          jobVector: [],
          cvVector: [],
          commonTerms: [],
        };
      }

      // 2. Créer vocabulaire commun
      const vocabulary = this.createVocabulary(jobTokens, cvTokens);

      if (vocabulary.length === 0) {
        return {
          score: 0,
          similarity: 0,
          jobVector: [],
          cvVector: [],
          commonTerms: [],
        };
      }

      // 3. Calculer IDF
      const idf = this.calculateIDF(vocabulary, jobTokens, cvTokens);

      // 4. Créer vecteurs TF-IDF
      const jobVector = this.createTFIDFVector(jobTokens, vocabulary, idf);
      const cvVector = this.createTFIDFVector(cvTokens, vocabulary, idf);

      // 5. Normaliser les vecteurs
      const normalizedJobVector = this.normalizeVector(jobVector);
      const normalizedCvVector = this.normalizeVector(cvVector);

      // 6. Calculer similarité cosinus
      const similarity = this.cosineSimilarity(
        normalizedJobVector,
        normalizedCvVector
      );

      // 7. Convertir en score 0-100
      const score = Math.max(0, Math.min(100, similarity * 100));

      // 8. Identifier termes communs
      const commonTerms = this.findCommonTerms(jobTokens, cvTokens);

      console.log(
        `[VECTOR_SCORING] Processed ${jobTokens.length} job tokens, ${cvTokens.length} CV tokens`
      );
      console.log(
        `[VECTOR_SCORING] Vocabulary: ${vocabulary.length} terms, Common: ${
          commonTerms.length
        }, Similarity: ${similarity.toFixed(4)}`
      );

      return {
        score: Math.round(score),
        similarity,
        jobVector: normalizedJobVector,
        cvVector: normalizedCvVector,
        commonTerms: commonTerms.slice(0, 10), // Top 10 termes communs
      };
    } catch (error) {
      console.error('[VECTOR_SCORING] Error:', error);
      return {
        score: 0,
        similarity: 0,
        jobVector: [],
        cvVector: [],
        commonTerms: [],
      };
    }
  }

  /**
   * Analyser la diversité du vocabulaire
   */
  public analyzeVocabularyDiversity(text: string): {
    totalTerms: number;
    uniqueTerms: number;
    diversity: number; // ratio unique/total
  } {
    const tokens = this.preprocessText(text);
    const uniqueTokens = Array.from(new Set(tokens));

    return {
      totalTerms: tokens.length,
      uniqueTerms: uniqueTokens.length,
      diversity: tokens.length > 0 ? uniqueTokens.length / tokens.length : 0,
    };
  }
}

// Export singleton
export const vectorScoringService = new VectorScoringService();
