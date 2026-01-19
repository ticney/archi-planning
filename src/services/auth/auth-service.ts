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

    async getUserRole(userId: string): Promise<"project_leader" | "reviewer" | "organizer"> {
        // TODO: Replace with actual DB query when roles table exists
        // For now, return a default role to satisfy the interface
        return "project_leader";
    },
};
