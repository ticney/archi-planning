import { calculateSlotDuration } from './slot-rules';
import { describe, it, expect } from 'vitest';

describe('calculateSlotDuration', () => {
    it('returns 30 minutes for standard topics', () => {
        expect(calculateSlotDuration('standard')).toBe(30);
    });

    it('returns 60 minutes for strategic topics', () => {
        expect(calculateSlotDuration('strategic')).toBe(60);
    });
});
