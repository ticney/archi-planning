import { createClient } from "@/lib/supabase/server";
import { loginSchema, LoginFormValues } from "@/types/schemas/auth-schema";
import { ActionResult } from "@/types";

export const AuthService = {
    async login(formData: LoginFormValues): Promise<ActionResult<any>> {
        const supabase = await createClient();

        const validated = loginSchema.safeParse(formData);
        if (!validated.success) {
            return {
                success: false,
                error: "Invalid input",
            };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    },

    async logout(): Promise<ActionResult<void>> {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return { success: true };
    },

    async getUserRole(userId: string): Promise<import("@/types").UserRole | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            console.error("Error fetching user role:", error);
            return null;
        }

        return data.role;
    },

    async ensureUserRole(userId: string, requiredRoles: import("@/types").UserRole[]): Promise<boolean> {
        const role = await this.getUserRole(userId);
        if (!role || !requiredRoles.includes(role)) {
            return false;
        }
        return true;
    },
};
