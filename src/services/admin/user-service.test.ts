import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminUserService } from "@/services/admin/user-service";
import { AuthService } from "@/services/auth/auth-service";

// Mock dependencies
vi.mock("@/services/auth/auth-service", () => ({
    AuthService: {
        ensureUserRole: vi.fn(),
    },
}));

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockListUsers = vi.fn();

// Mock supabase admin client
vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: () => ({
        auth: {
            admin: {
                listUsers: mockListUsers,
            },
        },
        from: () => ({
            select: mockSelect,
            update: mockUpdate,
        }),
    }),
}));

describe("AdminUserService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAllUsers", () => {
        it("should return null if user is not admin", async () => {
            vi.mocked(AuthService.ensureUserRole).mockResolvedValue(false);
            const result = await AdminUserService.getAllUsers("user-123");
            expect(result).toBeNull();
        });

        it("should return users merged with profiles", async () => {
            vi.mocked(AuthService.ensureUserRole).mockResolvedValue(true);

            // Mock Auth users
            mockListUsers.mockResolvedValue({
                data: {
                    users: [
                        { id: "u1", email: "user1@example.com", created_at: "2023-01-01" },
                        { id: "u2", email: "user2@example.com", created_at: "2023-01-02" },
                    ],
                },
                error: null,
            });

            // Mock Profiles
            mockSelect.mockResolvedValue({
                data: [
                    { user_id: "u1", role: "admin" },
                    { user_id: "u2", role: "reviewer" },
                ],
                error: null,
            });

            const result = await AdminUserService.getAllUsers("admin-1");

            expect(result).toHaveLength(2);
            expect(result?.[0].role).toBe("admin");
            expect(result?.[1].role).toBe("reviewer");
        });
    });

    describe("updateUserRole", () => {
        it("should return false if user is not admin", async () => {
            vi.mocked(AuthService.ensureUserRole).mockResolvedValue(false);
            const result = await AdminUserService.updateUserRole("user-123", "target-1", "admin");
            expect(result).toBe(false);
        });

        it("should update role successfully", async () => {
            vi.mocked(AuthService.ensureUserRole).mockResolvedValue(true);
            mockUpdate.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            const result = await AdminUserService.updateUserRole("admin-1", "target-1", "reviewer");

            expect(result).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith({ role: "reviewer" });
        });
    });
});
