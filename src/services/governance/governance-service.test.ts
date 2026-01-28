import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GovernanceService } from './governance-service';

// Mock Supabase client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        from: mockFrom,
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
        }
    })),
}));

describe('GovernanceService', () => {
    let service: GovernanceService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new GovernanceService();

        // Setup chain mock
        const chain = {
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            eq: mockEq,
            single: mockSingle,
            order: mockOrder,
            limit: vi.fn().mockImplementation(function (this: any) { return this; }), // Return chain for .limit()
            then: (resolve: any) => resolve({ data: [{ id: '123' }], error: null }) // Make chain awaitable for updates, returning dummy data
        };

        mockFrom.mockReturnValue(chain);
        mockInsert.mockReturnValue(chain);
        mockSelect.mockReturnValue(chain);
        mockUpdate.mockReturnValue(chain);
        mockEq.mockReturnValue(chain);
        mockOrder.mockReturnValue(chain);
    });

    it('should create a governance request successfully', async () => {
        const input = {
            title: 'New Project',
            project_code: 'PROJ-001',
            description: 'A test project'
        };

        const mockResponse = {
            id: '123',
            ...input,
            status: 'draft',
            created_by: 'user-123',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // For createRequest: .insert().select().single()
        mockSingle.mockResolvedValueOnce({ data: mockResponse, error: null });

        const result = await service.createRequest(input);

        expect(mockFrom).toHaveBeenCalledWith('governance_requests');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            title: input.title,
            project_code: input.project_code,
            description: input.description
        }));
        expect(result).toEqual(mockResponse);
    });

    it('should throw error when creation fails', async () => {
        const input = {
            title: 'Fail Project',
            project_code: 'FAIL-001'
        };

        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } });

        await expect(service.createRequest(input)).rejects.toThrow('Failed to create governance request: DB Error');
    });

    it('should submit request successfully with valid proofs', async () => {
        const requestId = '123';
        const mockRequest = {
            id: requestId,
            topic: 'standard',
            status: 'draft'
        };
        const mockAttachments = [
            { document_type: 'dat_sheet' },
            { document_type: 'architecture_diagram' }
        ];

        // 1. getRequestById -> select().eq().single()
        mockSingle.mockResolvedValueOnce({ data: mockRequest, error: null });

        // 2. getAttachments -> select().eq().order()
        mockOrder.mockResolvedValueOnce({ data: mockAttachments, error: null });

        await service.submitRequest(requestId);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            status: 'pending_review',
        }));
        expect(mockEq).toHaveBeenCalledWith('id', requestId);
    });

    it('should throw error if request not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: null }); // Not found

        await expect(service.submitRequest('123')).rejects.toThrow('Request not found');
    });

    it('should throw error if mandatory proofs are missing (Standard)', async () => {
        const requestId = '123';
        const mockRequest = {
            id: requestId,
            topic: 'standard',
            status: 'draft'
        };
        // Only DAT Sheet, missing Architecture Diagram
        const mockAttachments = [
            { document_type: 'dat_sheet' },
        ];

        mockSingle.mockResolvedValueOnce({ data: mockRequest, error: null });
        mockOrder.mockResolvedValueOnce({ data: mockAttachments, error: null });

        await expect(service.submitRequest(requestId)).rejects.toThrow(/Missing mandatory documents/);
    });

    describe('getPendingRequests', () => {
        it('should fetch all requests with status pending_review', async () => {
            const mockData = [
                { id: '1', title: 'Project A', status: 'pending_review' },
                { id: '2', title: 'Project B', status: 'pending_review' }
            ];

            // Setup select().eq().order()
            const chain = {
                select: mockSelect,
                eq: mockEq,
                order: mockOrder,
                limit: vi.fn().mockReturnThis(),
                then: (resolve: any) => resolve({ data: mockData, error: null })
            };
            mockFrom.mockReturnValue(chain);
            mockSelect.mockReturnValue(chain);
            mockEq.mockReturnValue(chain);
            mockOrder.mockReturnValue(chain);

            const result = await service.getPendingRequests();

            expect(mockFrom).toHaveBeenCalledWith('governance_requests');
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('*'));
            expect(mockEq).toHaveBeenCalledWith('status', 'pending_review');
            expect(result).toHaveLength(2);
        });
    });

    describe('calculateMaturityScore', () => {
        it('should calculate score based on proofs count relative to topic rules', async () => {
            const request: any = {
                id: '123',
                topic: 'standard',
                status: 'pending_review'
            };
            const attachments = [
                { document_type: 'dat_sheet' },
                { document_type: 'architecture_diagram' }
            ];

            mockOrder.mockResolvedValue({ data: attachments, error: null });

            const score = await service.calculateMaturityScore(request);

            // Standard requires 2 docs. 2/2 = 100
            expect(score).toBe(100);
        });

        it('should return 0 if no topic set', async () => {
            const request: any = { id: '123', status: 'pending_review' }; // No topic
            mockOrder.mockResolvedValue({ data: [], error: null });
            const score = await service.calculateMaturityScore(request);
            expect(score).toBe(0);
        });
    });
    describe('validateRequest', () => {
        it('should validate a pending request successfully', async () => {
            const requestId = '123';
            const reviewerId = 'reviewer-1';
            const mockRequest = {
                id: requestId,
                status: 'pending_review'
            };

            mockSingle.mockResolvedValueOnce({ data: mockRequest, error: null }); // getRequestById

            await service.validateRequest(requestId, reviewerId);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                status: 'validated',
                validated_by: reviewerId,
            }));
            expect(mockEq).toHaveBeenCalledWith('id', requestId);
        });

        it('should throw error if request is not pending_review', async () => {
            const requestId = '123';
            const reviewerId = 'reviewer-1';
            const mockRequest = {
                id: requestId,
                status: 'draft' // Not pending
            };

            mockSingle.mockResolvedValueOnce({ data: mockRequest, error: null });

            await expect(service.validateRequest(requestId, reviewerId))
                .rejects.toThrow('Request is not pending review');
        });

        it('should throw error if request not found', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: null });
            await expect(service.validateRequest('999', 'reviewer-1'))
                .rejects.toThrow('Request not found');
        });
    });

    describe('getValidatedRequests', () => {
        it('should fetch all requests with status validated', async () => {
            const mockData = [
                { id: '1', status: 'validated' }
            ];

            const chain = {
                select: mockSelect,
                eq: mockEq,
                order: mockOrder,
                limit: vi.fn().mockReturnThis(),
                then: (resolve: any) => resolve({ data: mockData, error: null })
            };
            mockFrom.mockReturnValue(chain);
            mockSelect.mockReturnValue(chain);
            mockEq.mockReturnValue(chain);
            mockOrder.mockReturnValue(chain);

            const result = await service.getValidatedRequests();

            expect(mockEq).toHaveBeenCalledWith('status', 'validated');
            expect(result).toHaveLength(1);
        });
    });

    describe('updateTopic', () => {
        it('should update topic and save requirements_snapshot', async () => {
            const requestId = '123';
            const topicSlug = 'standard';
            const expectedDuration = 30;

            // Mock getRequestById returning draft request
            mockSingle.mockResolvedValueOnce({ data: { id: requestId, status: 'draft' }, error: null });

            // Mock fetching topic proofs (snapshot)
            // 1. Get Topic ID and rules
            // We need to return the joined data: topic_proofs -> proof_types
            // This is likely a complex query: from(topics).select(id, name, slug, governance_topic_proofs(...))
            // OR the service will do multiple queries.
            // Let's assume the service does:
            // 1. Get topic by slug -> { id, estimated_duration }
            // 2. Get proofs for topic -> ['dat_sheet', 'architecture_diagram']

            // Mock getTopicBySlug
            // Mock select from 'governance_topics'
            // Mock select from 'governance_topic_proofs' + join 'governance_proof_types'

            // Simplifying the mock setup might be hard without knowing implementation details.
            // But we can check that update is called with requirements_snapshot.

            // Let's assume implementation logic:
            // const snapshot = ['dat_sheet', 'architecture_diagram'];

            // We need to mock the DB calls that produce this snapshot.
            // Mock topics query
            const topicMock = { id: 't1', slug: 'standard', estimated_duration: 30 };
            // Mock proofs query
            const proofsMock = [
                { governance_proof_types: { slug: 'dat_sheet' } },
                { governance_proof_types: { slug: 'architecture_diagram' } }
            ];

            // We need to setup the mock chain to return these in sequence?
            // Or rely on specific table names invocation.

            // This existing mock setup with `mockFrom` returning the same chain is tricky for multiple different queries.
            // We might need to refine the mock strategy if we want to distinguish table calls.
            // But for now, let's assume we can mock the values returned in order.

            // 1. getRequestById (done above)
            // 2. getTopic (by slug)
            mockSingle.mockResolvedValueOnce({ data: topicMock, error: null });
            // 3. getProofs
            mockOrder.mockResolvedValueOnce({ data: proofsMock, error: null });

            // 4. Update
            mockSingle.mockResolvedValueOnce({ data: { id: requestId }, error: null });

            await service.updateTopic(requestId, topicSlug);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                topic: topicSlug,
                estimated_duration: expectedDuration,
                requirements_snapshot: ['dat_sheet', 'architecture_diagram']
            }));
        });
    });

    describe('calculateMaturityScore (Dynamic)', () => {
        it('should calculate score using requirements_snapshot', async () => {
            const request: any = {
                id: '123',
                topic: 'standard',
                status: 'pending_review',
                requirements_snapshot: ['dat_sheet', 'architecture_diagram'] // Snapshot present
            };
            const attachments = [
                { document_type: 'dat_sheet' },
                { document_type: 'architecture_diagram' }
            ];

            mockOrder.mockResolvedValue({ data: attachments, error: null });

            const score = await service.calculateMaturityScore(request);

            expect(score).toBe(100);
        });

        it('should fallback to legacy rules if snapshot is missing', async () => {
            // ... existing behavior ...
            const request: any = {
                id: '123',
                topic: 'standard',
                status: 'pending_review',
                requirements_snapshot: null // Legacy
            };
            const attachments = [
                { document_type: 'dat_sheet' },
                { document_type: 'architecture_diagram' }
            ];

            mockOrder.mockResolvedValue({ data: attachments, error: null });

            // Implicitly testing fallback to static rules
            const score = await service.calculateMaturityScore(request);
            expect(score).toBe(100);
        });
    });
});
