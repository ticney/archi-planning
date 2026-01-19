import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth-service";

// Mock the createClient
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockCreateClient = vi.fn(() => ({
    auth: {
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
    },
}));

vi.mock("@/lib/supabase/server", () => ({
    createClient: () => mockCreateClient(), // return promise or object depending on implementation
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
});
