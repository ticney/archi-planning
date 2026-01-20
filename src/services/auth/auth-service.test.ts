import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth-service";

// Mock chainable supabase calls
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

const mockCreateClient = vi.fn(() => ({
    auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
    },
    from: mockFrom,
}));

vi.mock("@/lib/supabase/server", () => ({
    createClient: () => mockCreateClient(),
}));

describe("AuthService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should validate input schema", async () => {
        const result = await AuthService.login({
            email: "invalid-email",
            password: "password",
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Invalid input");
        expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });

    it("should call supabase signInWithPassword on valid input", async () => {
        mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "1" } }, error: null });

        const result = await AuthService.login({
            email: "test@example.com",
            password: "password",
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "password",
        });
    });

    it("should return error from supabase", async () => {
        mockSignInWithPassword.mockResolvedValue({ data: null, error: { message: "Invalid credentials" } });

        const result = await AuthService.login({
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Invalid credentials");
    });

    describe("getUserRole", () => {
        it("should return role when found", async () => {
            mockSingle.mockResolvedValue({ data: { role: "admin" }, error: null });

            const role = await AuthService.getUserRole("user-123");
            expect(role).toBe("admin");
            expect(mockFrom).toHaveBeenCalledWith("profiles");
            expect(mockSelect).toHaveBeenCalledWith("role");
            expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
        });

        it("should return null on error", async () => {
            mockSingle.mockResolvedValue({ data: null, error: { message: "Error" } });
            const role = await AuthService.getUserRole("user-123");
            expect(role).toBeNull();
        });
    });

    describe("ensureUserRole", () => {
        it("should return true if user has required role", async () => {
            // Mock getUserRole internally or mock the DB call again? 
            // Since getUserRole calls DB, we mock the DB call again
            mockSingle.mockResolvedValue({ data: { role: "admin" }, error: null });

            const allowed = await AuthService.ensureUserRole("user-123", ["admin", "project_leader"]);
            expect(allowed).toBe(true);
        });

        it("should return false if role does not match", async () => {
            mockSingle.mockResolvedValue({ data: { role: "project_leader" }, error: null });

            const allowed = await AuthService.ensureUserRole("user-123", ["admin"]);
            expect(allowed).toBe(false);
        });
    });
});
