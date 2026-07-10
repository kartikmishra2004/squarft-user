import { describe, expect, it } from '@jest/globals';
import { getProjectPropertyCardConfig } from '../services/propertyConfiguration';

describe('project-detail property card configuration', () => {
    it('shows BHK and sub_type for residential properties', () => {
        expect(getProjectPropertyCardConfig({
            type: 'residential',
            bedrooms: 3,
            sub_type: 'apartment',
        })).toBe('3 BHK • Apartment');
    });

    it('shows only sub_type for commercial properties', () => {
        expect(getProjectPropertyCardConfig({
            type: 'commercial',
            bedrooms: 2,
            sub_type: 'showroom',
        })).toBe('Showroom');
    });

    it('prefers sub_type over the legacy property_subtype field', () => {
        expect(getProjectPropertyCardConfig({
            property_type: 'commercial',
            sub_type: 'office',
            property_subtype: 'commercial_unit',
        })).toBe('Office');
    });
});
