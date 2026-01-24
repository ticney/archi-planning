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
                then: (resolve: any) => resolve({ data: mockData, error: null })
            };
            mockFrom.mockReturnValue(chain);
            mockSelect.mockReturnValue(chain);
            mockEq.mockReturnValue(chain);
            mockOrder.mockResolvedValue({ data: mockData, error: null });

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
});
