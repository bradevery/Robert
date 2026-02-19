/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from 'crypto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  mostHitEntry: string;
}

interface ScoringCacheConfig {
  maxEntries: number;
  defaultTTL: number; // en millisecondes
  cleanupInterval: number;
  memoryLimit: number; // en MB
}

export class ScoringCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  private config: ScoringCacheConfig = {
    maxEntries: 1000,
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    memoryLimit: 100, // 100MB
  };

  constructor(config?: Partial<ScoringCacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.startCleanupTimer();
    console.log(
      '[CACHE_SCORING] Cache service initialized with config:',
      this.config
    );
  }

  /**
   * Générer une clé de cache unique pour un calcul de scoring
   */
  private generateCacheKey(
    type: string,
    jobText: string,
    cvText: string,
    options?: any
  ): string {
    const content = JSON.stringify({
      type,
      jobHash: this.hashText(jobText),
      cvHash: this.hashText(cvText),
      options: options || {},
    });

    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Hacher du texte pour réduire la taille de la clé
   */
  private hashText(text: string): string {
    return createHash('sha256')
      .update(text.substring(0, 1000))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Obtenir une entrée du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data as T;
  }

  /**
   * Stocker une entrée dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // Vérifier si on dépasse la limite d'entrées
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }

    // Vérifier la limite mémoire (estimation approximative)
    if (this.estimateMemoryUsage() > this.config.memoryLimit * 1024 * 1024) {
      this.evictOldestEntries();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      hitCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    console.log(
      `[CACHE_SCORING] Cached entry: ${key} (expires in ${Math.round(
        (expiresAt - now) / 1000
      )}s)`
    );
  }

  /**
   * Cache pour les calculs vectoriels (TF-IDF + cosinus)
   */
  cacheVectorScore(
    jobText: string,
    cvText: string,
    result: any,
    ttl?: number
  ): void {
    const key = this.generateCacheKey('vector', jobText, cvText);
    this.set(key, result, ttl);
  }

  getCachedVectorScore(jobText: string, cvText: string): any | null {
    const key = this.generateCacheKey('vector', jobText, cvText);
    return this.get(key);
  }

  /**
   * Cache pour les calculs de mots-clés sectoriels
   */
  cacheKeywordScore(
    jobText: string,
    cvText: string,
    result: any,
    ttl?: number
  ): void {
    const key = this.generateCacheKey('keyword', jobText, cvText);
    this.set(key, result, ttl);
  }

  getCachedKeywordScore(jobText: string, cvText: string): any | null {
    const key = this.generateCacheKey('keyword', jobText, cvText);
    return this.get(key);
  }

  /**
   * Cache pour les embeddings OpenAI
   */
  cacheEmbedding(text: string, embedding: number[], ttl?: number): void {
    const key = `embedding_${this.hashText(text)}`;
    this.set(key, embedding, ttl || 24 * 60 * 60 * 1000); // 24h pour les embeddings
  }

  getCachedEmbedding(text: string): number[] | null {
    const key = `embedding_${this.hashText(text)}`;
    return this.get(key);
  }

  /**
   * Cache pour les analyses sémantiques
   */
  cacheSemanticScore(
    jobText: string,
    cvText: string,
    result: any,
    ttl?: number
  ): void {
    const key = this.generateCacheKey('semantic', jobText, cvText);
    this.set(key, result, ttl);
  }

  getCachedSemanticScore(jobText: string, cvText: string): any | null {
    const key = this.generateCacheKey('semantic', jobText, cvText);
    return this.get(key);
  }

  /**
   * Cache pour le scoring hybride final
   */
  cacheHybridScore(
    jobText: string,
    cvText: string,
    options: any,
    result: any,
    ttl?: number
  ): void {
    const key = this.generateCacheKey('hybrid', jobText, cvText, options);
    this.set(key, result, ttl);
  }

  getCachedHybridScore(
    jobText: string,
    cvText: string,
    options: any
  ): any | null {
    const key = this.generateCacheKey('hybrid', jobText, cvText, options);
    return this.get(key);
  }

  /**
   * Éviction LRU (Least Recently Used)
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestAccess = Date.now();

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(`[CACHE_SCORING] Evicted LRU entry: ${oldestKey}`);
    }
  }

  /**
   * Éviction des entrées les plus anciennes
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    const toEvict = Math.floor(this.cache.size * 0.2); // Éviction 20%

    for (let i = 0; i < toEvict && i < entries.length; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.stats.evictions++;
    }

    console.log(
      `[CACHE_SCORING] Evicted ${toEvict} oldest entries for memory management`
    );
  }

  /**
   * Estimer l'usage mémoire approximatif
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      // Estimation grossière de la taille en bytes
      const keySize = key.length * 2; // Caractères Unicode
      const dataSize = JSON.stringify(entry.data).length * 2;
      const metadataSize = 32; // timestamp, expiresAt, hitCount, lastAccessed

      totalSize += keySize + dataSize + metadataSize;
    });

    return totalSize;
  }

  /**
   * Nettoyage automatique des entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[CACHE_SCORING] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Démarrer le timer de nettoyage automatique
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Arrêter le timer de nettoyage
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    // Trouver l'entrée la plus sollicitée
    let mostHitEntry = '';
    let maxHits = 0;
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.hitCount > maxHits) {
        maxHits = entry.hitCount;
        mostHitEntry = key.substring(0, 8) + '...';
      }
    });

    const oldestEntry =
      entries.length > 0
        ? Math.min(...entries.map((e) => e.timestamp))
        : Date.now();

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage:
        Math.round((this.estimateMemoryUsage() / (1024 * 1024)) * 100) / 100, // MB
      oldestEntry,
      mostHitEntry,
    };
  }

  /**
   * Vider le cache complètement
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    console.log('[CACHE_SCORING] Cache cleared completely');
  }

  /**
   * Pré-charger des calculs fréquents (pour les postes populaires)
   */
  async preload(
    popularJobTexts: string[],
    popularCvTexts: string[]
  ): Promise<void> {
    console.log(
      `[CACHE_SCORING] Preloading cache for ${popularJobTexts.length} jobs x ${popularCvTexts.length} CVs`
    );

    // Cette méthode peut être appelée pour pré-calculer des scores
    // pour les combinaisons les plus fréquentes (exemple: 5 postes les plus consultés
    // x 10 CVs les plus populaires)

    // Note: L'implémentation réelle nécessiterait d'appeler les services de scoring
    // mais nous préparons juste la structure pour l'optimisation
  }

  /**
   * Obtenir les métriques détaillées
   */
  getDetailedMetrics(): any {
    const stats = this.getStats();
    const now = Date.now();

    const ageDistribution = {
      '<1min': 0,
      '1-5min': 0,
      '5-30min': 0,
      '>30min': 0,
    };

    Array.from(this.cache.values()).forEach((entry) => {
      const age = now - entry.timestamp;
      if (age < 60000) ageDistribution['<1min']++;
      else if (age < 5 * 60000) ageDistribution['1-5min']++;
      else if (age < 30 * 60000) ageDistribution['5-30min']++;
      else ageDistribution['>30min']++;
    });

    return {
      ...stats,
      rawStats: this.stats,
      ageDistribution,
      config: this.config,
    };
  }
}

// Export singleton
export const cacheScoringService = new ScoringCacheService();
