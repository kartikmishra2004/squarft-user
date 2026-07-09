/**
 * Google Maps Geocoding Service
 * Handles address-to-coordinate conversion with caching and error handling
 */

import { GeocodeCacheImpl } from './cache';
import { delay } from './utils';

export class GeocodingService {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.cache = new GeocodeCacheImpl(
      config.maxCacheSize || 500,
      config.cacheTTL || 7 * 24 * 60 * 60 * 1000
    );
  }

  /**
   * Geocode a single address
   * Returns coordinates or null on failure
   */
  async geocodeAddress(address) {
    if (!address || address.trim().length === 0) {
      return null;
    }

    // Check cache first
    const cached = this.cache.get(address);
    if (cached !== null) {
      return cached;
    }

    // Build API URL
    const url = this.buildGeocodingUrl(address);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Geocoding HTTP error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Log the full response for debugging
      if (data.status !== 'OK') {
        console.log('Geocoding API Response:', JSON.stringify(data, null, 2));
      }

      // Handle different response statuses
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const coordinate = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        // Cache successful result
        this.cache.set(address, coordinate);
        return coordinate;
      } else if (data.status === 'ZERO_RESULTS') {
        // Cache null result to prevent repeated failed lookups
        this.cache.set(address, null);
        return null;
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.warn('Geocoding API rate limit exceeded');
        return null;
      } else if (data.status === 'REQUEST_DENIED') {
        const errorMsg = data.error_message || 'Unknown error';
        console.error('Geocoding API request denied:', errorMsg);
        console.log('Please enable the Geocoding API in Google Cloud Console:');
        console.log('https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com');
        return null;
      } else {
        console.error(`Geocoding failed: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Geocode multiple addresses in batches with rate limiting
   * Returns map of address to coordinates (or null)
   */
  async geocodeBatch(addresses, onProgress) {
    const results = new Map();
    const BATCH_SIZE = 10;
    const DELAY_MS = 200;

    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
      const batch = addresses.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchPromises = batch.map(async (address) => {
        const coordinate = await this.geocodeAddress(address);
        return { address, coordinate };
      });

      const batchResults = await Promise.all(batchPromises);

      // Store results
      for (const { address, coordinate } of batchResults) {
        results.set(address, coordinate);
      }

      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, addresses.length), addresses.length);
      }

      // Rate limiting delay
      if (i + BATCH_SIZE < addresses.length) {
        await delay(DELAY_MS);
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getCacheStats();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Build Google Geocoding API URL
   */
  buildGeocodingUrl(address) {
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = new URLSearchParams({
      address: address,
      key: this.apiKey,
      region: 'in',
      components: 'country:IN',
    });

    return `${baseUrl}?${params.toString()}`;
  }
}
