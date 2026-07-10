import { describe, expect, it } from '@jest/globals';
import { isDealApiId } from '../store/slices/dealsSlice';

describe('deal API identifier validation', () => {
    it('accepts a standard RFC UUID', () => {
        expect(isDealApiId('0c1ab534-8f45-4a22-bde3-2b85fd68b504')).toBe(true);
    });

    it('accepts UUID-shaped identifiers returned by the deals API', () => {
        expect(isDealApiId('11111111-1111-1111-1111-111111111111')).toBe(true);
    });

    it('rejects display IDs and malformed values', () => {
        expect(isDealApiId('#DL-1234')).toBe(false);
        expect(isDealApiId('11111111-1111')).toBe(false);
        expect(isDealApiId(null)).toBe(false);
    });
});
