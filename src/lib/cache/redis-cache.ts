/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from '@upstash/redis';
import { createHash } from 'crypto';

// Configuration Redis
const redis = new Redis({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  url: process.env.UPSTASH_REDIS_REST_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisCache {
  private static instance: RedisCache;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  // Cache pour les embeddings
  async getCachedEmbedding(text: string): Promise<number[] | null> {
    try {
      const hash = this.generateHash(text);
      const cached = await this.redis.get(`emb:${hash}`);

      if (cached) {
        // Mettre à jour les statistiques d'accès
        await this.redis.hincrby(`stats:emb:${hash}`, 'hits', 1);
        await this.redis.expire(`stats:emb:${hash}`, 86400); // 24h

        return JSON.parse(cached as string);
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération cache embedding:', error);
      return null;
    }
  }

  async cacheEmbedding(text: string, embedding: number[]): Promise<void> {
    try {
      const hash = this.generateHash(text);
      const key = `emb:${hash}`;

      // Cache l'embedding pour 24h
      await this.redis.setex(key, 86400, JSON.stringify(embedding));

      // Initialiser les statistiques
      await this.redis.hset(`stats:emb:${hash}`, {
        hits: 0,
        created: Date.now(),
      });
      await this.redis.expire(`stats:emb:${hash}`, 86400);

      console.log(`💾 Embedding mis en cache: ${hash.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Erreur mise en cache embedding:', error);
    }
  }

  // Cache pour les équivalences de diplômes
  async getCachedDiplomaEquivalence(
    diploma1: string,
    diploma2: string
  ): Promise<{
    isEquivalent: boolean;
    confidence: number;
    explanation: string;
  } | null> {
    try {
      const key = `equiv:${this.generateHash(diploma1)}:${this.generateHash(
        diploma2
      )}`;
      const cached = await this.redis.get(key);

      if (cached) {
        await this.redis.hincrby(`stats:${key}`, 'hits', 1);
        return JSON.parse(cached as string);
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération cache équivalence:', error);
      return null;
    }
  }

  async cacheDiplomaEquivalence(
    diploma1: string,
    diploma2: string,
    result: {
      isEquivalent: boolean;
      confidence: number;
      explanation: string;
    }
  ): Promise<void> {
    try {
      const key = `equiv:${this.generateHash(diploma1)}:${this.generateHash(
        diploma2
      )}`;

      // Cache pour 7 jours (les équivalences changent rarement)
      await this.redis.setex(key, 604800, JSON.stringify(result));

      // Statistiques
      await this.redis.hset(`stats:${key}`, {
        hits: 0,
        created: Date.now(),
      });
      await this.redis.expire(`stats:${key}`, 604800);

      console.log(`💾 Équivalence mise en cache: ${diploma1} ↔ ${diploma2}`);
    } catch (error) {
      console.error('❌ Erreur mise en cache équivalence:', error);
    }
  }

  // Cache pour les analyses complètes
  async getCachedAnalysis(
    cvHash: string,
    jobHash: string
  ): Promise<any | null> {
    try {
      const key = `analysis:${cvHash}:${jobHash}`;
      const cached = await this.redis.get(key);

      if (cached) {
        await this.redis.hincrby(`stats:${key}`, 'hits', 1);
        return JSON.parse(cached as string);
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération cache analyse:', error);
      return null;
    }
  }

  async cacheAnalysis(
    cvHash: string,
    jobHash: string,
    analysis: any
  ): Promise<void> {
    try {
      const key = `analysis:${cvHash}:${jobHash}`;

      // Cache pour 1 heure (les analyses peuvent changer)
      await this.redis.setex(key, 3600, JSON.stringify(analysis));

      // Statistiques
      await this.redis.hset(`stats:${key}`, {
        hits: 0,
        created: Date.now(),
      });
      await this.redis.expire(`stats:${key}`, 3600);

      console.log(`💾 Analyse mise en cache: ${cvHash.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Erreur mise en cache analyse:', error);
    }
  }

  // Cache pour les données françaises
  async getCachedFrenchData(type: string, key: string): Promise<any | null> {
    try {
      const cacheKey = `french:${type}:${this.generateHash(key)}`;
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        await this.redis.hincrby(`stats:${cacheKey}`, 'hits', 1);
        return JSON.parse(cached as string);
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération cache données françaises:', error);
      return null;
    }
  }

  async cacheFrenchData(type: string, key: string, data: any): Promise<void> {
    try {
      const cacheKey = `french:${type}:${this.generateHash(key)}`;

      // Cache pour 30 jours (données de référence)
      await this.redis.setex(cacheKey, 2592000, JSON.stringify(data));

      // Statistiques
      await this.redis.hset(`stats:${cacheKey}`, {
        hits: 0,
        created: Date.now(),
      });
      await this.redis.expire(`stats:${cacheKey}`, 2592000);

      console.log(`💾 Données françaises mises en cache: ${type}/${key}`);
    } catch (error) {
      console.error('❌ Erreur mise en cache données françaises:', error);
    }
  }

  // Cache pour les suggestions
  async getCachedSuggestions(
    cvHash: string,
    jobHash: string
  ): Promise<any[] | null> {
    try {
      const key = `suggestions:${cvHash}:${jobHash}`;
      const cached = await this.redis.get(key);

      if (cached) {
        await this.redis.hincrby(`stats:${key}`, 'hits', 1);
        return JSON.parse(cached as string);
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération cache suggestions:', error);
      return null;
    }
  }

  async cacheSuggestions(
    cvHash: string,
    jobHash: string,
    suggestions: any[]
  ): Promise<void> {
    try {
      const key = `suggestions:${cvHash}:${jobHash}`;

      // Cache pour 2 heures
      await this.redis.setex(key, 7200, JSON.stringify(suggestions));

      // Statistiques
      await this.redis.hset(`stats:${key}`, {
        hits: 0,
        created: Date.now(),
      });
      await this.redis.expire(`stats:${key}`, 7200);

      console.log(
        `💾 Suggestions mises en cache: ${cvHash.substring(0, 8)}...`
      );
    } catch (error) {
      console.error('❌ Erreur mise en cache suggestions:', error);
    }
  }

  // Méthodes utilitaires
  private generateHash(text: string): string {
    return createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
  }

  // Nettoyage du cache
  async clearExpiredCache(): Promise<void> {
    try {
      // Redis gère automatiquement l'expiration avec TTL
      // Cette méthode peut être utilisée pour un nettoyage manuel si nécessaire
      console.log('🧹 Cache nettoyé automatiquement par Redis');
    } catch (error) {
      console.error('❌ Erreur nettoyage cache:', error);
    }
  }

  // Statistiques du cache
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    topKeys: Array<{ key: string; hits: number }>;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keys = await this.redis.keys('*');

      // Calculer le taux de hit (simplifié)
      const statsKeys = await this.redis.keys('stats:*');
      let totalHits = 0;
      const topKeys: Array<{ key: string; hits: number }> = [];

      for (const key of statsKeys.slice(0, 10)) {
        const hits = await this.redis.hget(key, 'hits');
        if (hits) {
          totalHits += parseInt(hits as string);
          topKeys.push({
            key: key.replace('stats:', ''),
            hits: parseInt(hits as string),
          });
        }
      }

      return {
        totalKeys: keys.length,
        memoryUsage:
          info
            .split('\n')
            .find((line) => line.startsWith('used_memory_human:'))
            ?.split(':')[1] || 'N/A',
        hitRate: totalHits > 0 ? totalHits / keys.length : 0,
        topKeys: topKeys.sort((a, b) => b.hits - a.hits),
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats cache:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'N/A',
        hitRate: 0,
        topKeys: [],
      };
    }
  }

  // Test de connectivité
  async testConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      console.log('✅ Connexion Redis OK');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion Redis:', error);
      return false;
    }
  }
}

// Instance singleton
export const redisCache = RedisCache.getInstance();
