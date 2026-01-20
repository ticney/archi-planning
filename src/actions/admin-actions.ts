"use server";

import { createClient } from "@/lib/supabase/server";
import { AdminUserService, UserWithRole } from "@/services/admin/user-service";
import { updateRoleSchema, UpdateRoleValues } from "@/types/schemas/admin-schema";
import { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function getUsersList(): Promise<ActionResult<UserWithRole[]>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const users = await AdminUserService.getAllUsers(user.id);

    if (!users) {
        return { success: false, error: "Failed to fetch users" };
    }

    return { success: true, data: users };
}

export async function updateRole(data: UpdateRoleValues): Promise<ActionResult<void>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = updateRoleSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid input" };
    }

    const success = await AdminUserService.updateUserRole(
        user.id,
        validated.data.userId,
        validated.data.role
    );

    if (!success) {
        return { success: false, error: "Failed to update role" };
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
}
