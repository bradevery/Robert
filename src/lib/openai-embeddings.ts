import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Using smaller model for cost efficiency
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Extract keywords from text for embedding
 */
export function extractKeywords(text: string): string {
  // Simple keyword extraction - can be improved with NLP
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          'avec',
          'dans',
          'pour',
          'sur',
          'par',
          'de',
          'du',
          'des',
          'le',
          'la',
          'les',
          'un',
          'une',
          'et',
          'ou',
          'mais',
          'donc',
          'car',
          'comme',
          'si',
          'que',
          'qui',
          'quoi',
          'dont',
          'où',
        ].includes(word)
    );

  return Array.from(new Set(words)).slice(0, 50).join(' ');
}
