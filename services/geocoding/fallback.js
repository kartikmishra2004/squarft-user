/**
 * Fallback coordinate provider for failed geocoding attempts
 */

// Predefined city centers for known cities
const CITY_CENTERS = {
  indore: { latitude: 22.7196, longitude: 75.8577 },
  delhi: { latitude: 28.6139, longitude: 77.2090 },
  mumbai: { latitude: 19.0760, longitude: 72.8777 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
};

// Default region center (Indore)
const DEFAULT_CENTER = { latitude: 22.7196, longitude: 75.8577 };

/**
 * Get fallback coordinate for a city
 * Returns predefined city center for known cities, or default region center
 */
export function getFallbackCoordinate(city) {
  if (!city) {
    return DEFAULT_CENTER;
  }

  const normalizedCity = city.toLowerCase().trim();
  return CITY_CENTERS[normalizedCity] || DEFAULT_CENTER;
}
