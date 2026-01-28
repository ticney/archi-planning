import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChecklistConfig, addRequirementAction, removeRequirementAction } from './admin-actions';

// Mocks
const mockGetTopics = vi.fn();
const mockGetProofTypes = vi.fn();
const mockAdd = vi.fn();
const mockRemove = vi.fn();

vi.mock('@/services/governance/admin-service', () => ({
    GovernanceAdminService: vi.fn().mockImplementation(function () {
        return {
            getTopics: mockGetTopics,
            getProofTypes: mockGetProofTypes,
            addProofRequirement: mockAdd,
            removeProofRequirement: mockRemove
        };
    })
}));

// Mock Auth Service
vi.mock('@/services/auth/auth-service', () => ({
    AuthService: {
        ensureUserRole: vi.fn().mockImplementation(async (uid, roles) => {
            return uid === 'admin-1'; // Simple logic for test
        })
    }
}));

// Mock Auth Check (Supabase level, if needed, but AuthService covers it)
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: mockGetUser
        },
        // We don't need 'from' mock anymore if AuthService is mocked handling roles
    }))
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('Admin Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default: Admin User
        mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
    });

    describe('getChecklistConfig', () => {
        it('should return topics and proofs for admin', async () => {
            mockGetTopics.mockResolvedValue(['t1']);
            mockGetProofTypes.mockResolvedValue(['p1']);

            const result = await getChecklistConfig();
            console.log('Test Result:', result);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ topics: ['t1'], proofTypes: ['p1'] });
        });

        it('should fail for non-admin', async () => {
            mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null });

            const result = await getChecklistConfig();

            expect(result.success).toBe(false);
            expect(result.error).toMatch(/Unauthorized/);
        });
    });

    describe('addRequirementAction', () => {
        it('should call service addProofRequirement', async () => {
            const result = await addRequirementAction('standard', 'dat');

            expect(result.success).toBe(true);
            expect(mockAdd).toHaveBeenCalledWith('standard', 'dat');
        });
    });

    describe('removeRequirementAction', () => {
        it('should call service removeProofRequirement', async () => {
            const result = await removeRequirementAction('standard', 'dat');

            expect(result.success).toBe(true);
            expect(mockRemove).toHaveBeenCalledWith('standard', 'dat');
        });
    });
});
