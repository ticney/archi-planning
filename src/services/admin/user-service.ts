import { createAdminClient } from "@/lib/supabase/admin";
import { AuthService } from "@/services/auth/auth-service";
import { UserRole } from "@/types";
import { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type UserWithRole = {
    id: string;
    email: string;
    role: UserRole;
    last_sign_in_at: string | null;
    created_at: string;
};

export const AdminUserService = {
    async getAllUsers(currentUserId: string): Promise<UserWithRole[] | null> {
        // Double check admin privileges at API level
        const isAdmin = await AuthService.ensureUserRole(currentUserId, ["admin"]);
        if (!isAdmin) {
            console.error("Unauthorized attempt to access AdminUserService.getAllUsers");
            return null;
        }

        const supabaseAdmin = createAdminClient();

        // 1. Fetch all users from Auth (requires Service Role)
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError || !authUsers) {
            console.error("Error fetching auth users:", authError);
            return null;
        }

        // 2. Fetch all profiles (requires Service Role or Admin RLS)
        // Using admin client ensures we bypass RLS or use Admin RLS policies
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("*");

        if (profileError || !profiles) {
            console.error("Error fetching profiles:", profileError);
            return null;
        }

        // 3. Merge data
        // Map profiles by user_id for O(1) lookup
        const profileMap = new Map<string, Profile>(profiles.map((p) => [p.user_id, p]));

        const mergedUsers: UserWithRole[] = authUsers.users.map((user) => {
            const profile = profileMap.get(user.id);
            // Default to project_leader if no profile found (should not happen due to trigger)
            const role = (profile?.role as UserRole) || "project_leader";

            return {
                id: user.id,
                email: user.email || "",
                role: role,
                last_sign_in_at: user.last_sign_in_at || null,
                created_at: user.created_at,
            };
        });

        return mergedUsers;
    },

    async updateUserRole(currentUserId: string, targetUserId: string, newRole: UserRole): Promise<boolean> {
        // Double check admin privileges
        const isAdmin = await AuthService.ensureUserRole(currentUserId, ["admin"]);
        if (!isAdmin) {
            console.error("Unauthorized attempt to access AdminUserService.updateUserRole");
            return false;
        }

        const supabaseAdmin = createAdminClient();

        const { error } = await supabaseAdmin
            .from("profiles")
            .update({ role: newRole })
            .eq("user_id", targetUserId);

        if (error) {
            console.error("Error updating user role:", error);
            return false;
        }

        return true;
    }
};
