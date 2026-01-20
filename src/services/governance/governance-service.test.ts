import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GovernanceService } from './governance-service';

// Mock Supabase client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        from: mockFrom,
    })),
}));

describe('GovernanceService', () => {
    let service: GovernanceService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new GovernanceService();

        // Setup chain mock
        mockFrom.mockReturnValue({ insert: mockInsert });
        mockInsert.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ single: mockSingle });
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

        mockSingle.mockResolvedValue({ data: mockResponse, error: null });

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

        mockSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        await expect(service.createRequest(input)).rejects.toThrow('Failed to create governance request: DB Error');
    });
});
