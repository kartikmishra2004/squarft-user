/**
 * Utility functions for geocoding operations
 */

/**
 * Build address string from city, area, and pincode
 * Returns formatted address: "area, city, pincode" with non-empty components
 */
export function buildAddressString(city, area, pincode) {
  const components = [area, city, pincode]
    .map((comp) => (comp ? String(comp).trim() : ''))
    .filter((comp) => comp.length > 0);

  return components.join(', ');
}

/**
 * Normalize address string for consistent cache keys
 * Converts to lowercase, trims whitespace, replaces multiple spaces with single space
 */
export function normalizeAddress(address) {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Validate if coordinate is within valid geographic ranges
 */
export function isValidCoordinate(coord) {
  if (!coord) return false;
  return (
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
}

/**
 * Check if cache entry has expired
 * Null coordinates (failed geocodes) have 1-hour TTL, successful results use configured TTL
 */
export function isCacheExpired(entry, ttl) {
  const now = new Date().getTime();
  const entryTime = new Date(entry.timestamp).getTime();
  const age = now - entryTime;

  // Failed geocodes (null coordinates) expire after 1 hour
  if (entry.coordinate === null) {
    const ONE_HOUR = 60 * 60 * 1000;
    return age > ONE_HOUR;
  }

  // Successful geocodes use configured TTL
  return age > ttl;
}

/**
 * Extract stored coordinates from project object
 * Returns null if coordinates are missing or invalid
 */
export function getStoredProjectCoordinate(project) {
  const latitude = Number(project?.latitude);
  const longitude = Number(project?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude === 0 ||
    longitude === 0
  ) {
    return null;
  }

  const coord = { latitude, longitude };
  return isValidCoordinate(coord) ? coord : null;
}

/**
 * Delay utility for rate limiting
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
