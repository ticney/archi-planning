import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableSlots, bookSlot } from './scheduling-service';
import { createClient } from '@/lib/supabase/server';
import { startOfDay, endOfDay, setHours, setMinutes, addMinutes } from 'date-fns';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}));

describe('Scheduling Service', () => {
    const mockSupabase = {
        from: vi.fn(),
        select: vi.fn(),
        not: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        eq: vi.fn(),
        single: vi.fn(),
        neq: vi.fn(),
        update: vi.fn()
    };

    // Helper for chaining mocks
    const mockChain = (returnValue: any) => {
        const chain: any = { ...mockSupabase };
        Object.keys(chain).forEach(key => {
            chain[key] = vi.fn().mockImplementation(() => {
                if (key === 'select' || key === 'not' || key === 'gte' || key === 'lte' || key === 'eq' || key === 'neq' || key === 'update') {
                    // Last call returns the value or promisable
                    return chain;
                }
                if (key === 'single') return Promise.resolve(returnValue);
                // If it's the end of chain without single/update?
                // We need to handle 'then' or just return the object if it's awaitable?
                // Supabase query builder is thenable.
                return chain;
            });
            // Make chain ensure it returns the data at the end? 
            // Simplified:
            chain.then = (resolve: any) => Promise.resolve(returnValue).then(resolve);
        });
        return chain;
    };

    // Better Mocking strategy for Supabase chaining
    const mockResult = (data: any, error: any = null) => Promise.resolve({ data, error });

    beforeEach(() => {
        vi.clearAllMocks();
        (createClient as any).mockResolvedValue(mockSupabase);

        // Reset chain behavior
        mockSupabase.from.mockReturnValue(mockSupabase);
        mockSupabase.select.mockReturnValue(mockSupabase);
        mockSupabase.not.mockReturnValue(mockSupabase);
        mockSupabase.gte.mockReturnValue(mockSupabase);
        mockSupabase.lte.mockReturnValue(mockSupabase);
        mockSupabase.eq.mockReturnValue(mockSupabase);
        mockSupabase.neq.mockReturnValue(mockSupabase);
        mockSupabase.update.mockReturnValue(mockSupabase);
        mockSupabase.single.mockReturnValue(mockResult(null));
    });

    describe('getAvailableSlots', () => {
        it('returns empty list if not Friday', async () => {
            const thursday = new Date('2026-01-22T10:00:00Z'); // Thursday
            const slots = await getAvailableSlots(thursday);
            expect(slots).toEqual([]);
        });

        it('returns slots for Friday when no bookings exist', async () => {
            const friday = new Date('2026-01-23T10:00:00Z'); // Friday

            // Mock empty bookings
            // Chain: from -> select -> not -> gte -> lte -> promise
            // We need to intercept the property access or return 'this' until await
            // Simple approach: mock implementation of last call in chain

            // Re-setup mock for this specific call pattern
            mockSupabase.lte.mockResolvedValue({ data: [], error: null });

            const slots = await getAvailableSlots(friday);

            // Expect slots from 14:00 to 17:00 (30 min intervals -> 6 slots)
            // 14:00-14:30, 14:30-15:00, 15:00-15:30, 15:30-16:00, 16:00-16:30, 16:30-17:00
            expect(slots.length).toBe(6);
            expect(slots[0].available).toBe(true);
            expect(slots[0].start.getHours()).toBe(14);
        });

        it('marks slots as unavailable if conflict exists', async () => {
            const friday = new Date('2026-01-23T10:00:00Z');

            const bookingStart = setMinutes(setHours(friday, 14), 0); // 14:00

            // Mock one booking at 14:00
            mockSupabase.lte.mockResolvedValue({
                data: [{ booking_start_at: bookingStart.toISOString(), topic: 'standard' }], // 30 min duration
                error: null
            });

            const slots = await getAvailableSlots(friday);

            expect(slots.length).toBe(6);
            expect(slots[0].available).toBe(false); // 14:00-14:30 occupied
            expect(slots[1].available).toBe(true);  // 14:30-15:00 free
        });
    });

    describe('bookSlot', () => {
        it('fails if request not found', async () => {
            mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

            const result = await bookSlot('req-1', new Date());
            expect(result.success).toBe(false);
            expect(result.error).toContain('Request not found');
        });

        it('fails if status is not validated', async () => {
            mockSupabase.single.mockResolvedValue({ data: { status: 'draft' }, error: null });

            const result = await bookSlot('req-1', new Date());
            expect(result.success).toBe(false);
            expect(result.error).toContain('not in validated status');
        });

        it('fails if slot is conflicted', async () => {
            const startAt = new Date('2026-01-23T14:00:00Z');

            // Mock request
            const mockRequest = { id: 'req-1', status: 'validated', topic: 'standard' };

            // Mock conflict check response chain
            // First call is checking request -> single
            // Second call is checking conflicts -> lte (returns conflicts)
            // Third call is update -> (should not be reached)

            mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });

            // Conflict check
            mockSupabase.lte.mockResolvedValueOnce({
                data: [{ booking_start_at: startAt.toISOString(), topic: 'standard' }],
                error: null
            });

            const result = await bookSlot('req-1', startAt);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Slot is no longer available');
        });

        it('books slot successfully if valid', async () => {
            const startAt = new Date('2026-01-23T14:30:00Z');
            const mockRequest = { id: 'req-1', status: 'validated', topic: 'standard' };

            mockSupabase.single.mockResolvedValueOnce({ data: mockRequest, error: null });

            // No conflicts
            mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null });

            // Update succeeds
            mockSupabase.update.mockReturnValue({ // .update returns builder
                eq: vi.fn().mockResolvedValue({ error: null }) // .eq returns promise
            });

            const result = await bookSlot('req-1', startAt);
            expect(result.success).toBe(true);
        });
    });


    describe('getAllScheduledRequests', () => {
        it('returns scheduled requests with booking_end_at calculation', async () => {
            const startRange = new Date('2026-01-20');
            const endRange = new Date('2026-01-25');

            // Mock response
            const mockData = [
                {
                    id: '1',
                    booking_start_at: '2026-01-23T14:00:00Z',
                    topic: 'standard', // 30 mins
                    title: 'Project A',
                    status: 'tentative'
                }
            ];

            // Chain: select -> not -> gte -> lte
            mockSupabase.lte.mockResolvedValue({ data: mockData, error: null });

            const { getAllScheduledRequests } = await import('./scheduling-service');
            const results = await getAllScheduledRequests(startRange, endRange);

            expect(results.length).toBe(1);
            expect(results[0].title).toBe('Project A');
            // 14:00 + 30 mins = 14:30
            expect(results[0].booking_end_at).toEqual(new Date('2026-01-23T14:30:00Z'));
        });
    });

});
