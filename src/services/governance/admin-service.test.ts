import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GovernanceAdminService } from './admin-service';

// Mock Supabase client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        from: mockFrom,
    })),
}));

describe('GovernanceAdminService', () => {
    let service: GovernanceAdminService;

    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore - Service might not exist yet
        service = new GovernanceAdminService();

        const chain = {
            select: mockSelect,
            insert: mockInsert,
            delete: mockDelete,
            eq: mockEq,
            single: mockSingle,
            order: mockOrder,
            limit: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve({ data: [], error: null })
        };

        mockFrom.mockReturnValue(chain);
        mockInsert.mockReturnValue(chain);
        mockSelect.mockReturnValue(chain);
        mockDelete.mockReturnValue(chain);
        mockEq.mockReturnValue(chain);
        mockOrder.mockReturnValue(chain);
    });

    describe('getTopics', () => {
        it('should return all topics', async () => {
            const mockTopics = [
                { id: '1', slug: 'standard', name: 'Standard' },
                { id: '2', slug: 'strategic', name: 'Strategic' }
            ];
            // @ts-ignore
            mockOrder.mockResolvedValueOnce({ data: mockTopics, error: null });

            const result = await service.getTopics();

            expect(mockFrom).toHaveBeenCalledWith('governance_topics');
            expect(result).toEqual(mockTopics);
        });
    });

    describe('getProofTypes', () => {
        it('should return all proof types', async () => {
            const mockProofs = [
                { id: 'p1', slug: 'dat', name: 'DAT' }
            ];
            // @ts-ignore
            mockOrder.mockResolvedValueOnce({ data: mockProofs, error: null });

            const result = await service.getProofTypes();

            expect(mockFrom).toHaveBeenCalledWith('governance_proof_types');
            expect(result).toEqual(mockProofs);
        });
    });

    describe('addProofRequirement', () => {
        it('should add a proof requirement link', async () => {
            const topicSlug = 'standard';
            const proofSlug = 'new-proof';

            // Mock finding IDs
            // Topic lookup
            mockSingle
                .mockResolvedValueOnce({ data: { id: 't1' }, error: null }) // Topic
                .mockResolvedValueOnce({ data: { id: 'p1' }, error: null }); // Proof

            // Mock insert
            mockSelect.mockReturnValue({
                single: mockSingle,
                eq: mockEq
            });

            await service.addProofRequirement(topicSlug, proofSlug);

            expect(mockFrom).toHaveBeenCalledWith('governance_topics');
            expect(mockFrom).toHaveBeenCalledWith('governance_proof_types');
            expect(mockFrom).toHaveBeenCalledWith('governance_topic_proofs');
            expect(mockInsert).toHaveBeenCalledWith({
                topic_id: 't1',
                proof_type_id: 'p1'
            });
        });
    });

    describe('removeProofRequirement', () => {
        it('should remove a proof requirement link', async () => {
            const topicSlug = 'standard';
            const proofSlug = 'old-proof';

            // Mock finding IDs
            mockSingle
                .mockResolvedValueOnce({ data: { id: 't1' }, error: null }) // Topic
                .mockResolvedValueOnce({ data: { id: 'p1' }, error: null }); // Proof

            await service.removeProofRequirement(topicSlug, proofSlug);

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('topic_id', 't1');
            expect(mockEq).toHaveBeenCalledWith('proof_type_id', 'p1');
        });
    });
});
