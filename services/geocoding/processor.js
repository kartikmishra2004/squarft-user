/**
 * Process projects for map display with geocoding
 */

import { buildAddressString, getStoredProjectCoordinate } from './utils';
import { getFallbackCoordinate } from './fallback';

/**
 * Process projects for map display
 * - Uses stored coordinates when available
 * - Geocodes addresses for projects without coordinates
 * - Applies fallback coordinates for failed geocoding
 */
export async function processProjectsForMap(projects, geocodingService) {
  const results = [];
  const toGeocode = [];

  // Step 1: Separate projects with stored coordinates
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const storedCoord = getStoredProjectCoordinate(project);

    if (storedCoord !== null) {
      // Use stored coordinates
      results.push({
        project,
        coordinate: storedCoord,
        source: 'stored',
      });
    } else {
      // Queue for geocoding
      toGeocode.push({ project, index: i });
    }
  }

  // Step 2: Batch geocode addresses
  if (toGeocode.length > 0) {
    const addresses = toGeocode.map(({ project }) =>
      buildAddressString(project.city, project.area, project.pincode)
    );

    const geocodeResults = await geocodingService.geocodeBatch(addresses);

    // Step 3: Process geocoding results with fallback
    for (let i = 0; i < toGeocode.length; i++) {
      const { project } = toGeocode[i];
      const address = addresses[i];
      const coordinate = geocodeResults.get(address);

      if (coordinate !== null) {
        results.push({
          project,
          coordinate,
          source: 'geocoded',
          geocodedAt: new Date(),
        });
      } else {
        // Fallback: Use city center or default region center
        const fallbackCoord = getFallbackCoordinate(project.city);
        results.push({
          project,
          coordinate: fallbackCoord,
          source: 'fallback',
        });
      }
    }
  }

  return results;
}
