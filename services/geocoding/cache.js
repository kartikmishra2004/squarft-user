/**
 * Geocoding cache implementation with LRU eviction
 */

import { normalizeAddress, isCacheExpired } from './utils';

export class GeocodeCacheImpl {
  constructor(maxSize = 500, ttl = 7 * 24 * 60 * 60 * 1000) {
    this.cache = {
      entries: new Map(),
      maxSize,
      ttl,
    };
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get coordinate from cache
   * Returns null if not found or expired
   */
  get(address) {
    const key = normalizeAddress(address);
    const entry = this.cache.entries.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (isCacheExpired(entry, this.cache.ttl)) {
      this.cache.entries.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.coordinate;
  }

  /**
   * Set coordinate in cache
   * Evicts oldest entry if cache exceeds maxSize
   */
  set(address, coordinate) {
    const key = normalizeAddress(address);

    // Create new entry
    const entry = {
      address,
      coordinate,
      timestamp: new Date(),
      hits: 0,
    };

    this.cache.entries.set(key, entry);

    // Evict oldest entry if cache is full
    if (this.cache.entries.size > this.cache.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Evict oldest entry from cache
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries.entries()) {
      const entryTime = new Date(entry.timestamp).getTime();
      if (entryTime < oldestTime) {
        oldestTime = entryTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.entries.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;
    const missRate = total > 0 ? this.misses / total : 0;

    return {
      size: this.cache.entries.size,
      hitRate,
      missRate,
    };
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.entries.clear();
    this.hits = 0;
    this.misses = 0;
  }
}
