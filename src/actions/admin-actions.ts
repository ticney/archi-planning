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

    // CRITICAL: Self-Lockout Prevention
    // Prevent Admins from removing their own admin status
    if (user.id === validated.data.userId && validated.data.role !== 'admin') {
        return { success: false, error: "You cannot remove your own Admin privileges." };
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

// Governance Checklist Configuration Actions

import { GovernanceAdminService } from "@/services/governance/admin-service";
import { AuthService } from "@/services/auth/auth-service";

export async function getChecklistConfig(): Promise<ActionResult<{ topics: any[], proofTypes: any[] }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const isAdmin = await AuthService.ensureUserRole(user.id, ["admin"]);
    if (!isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const service = new GovernanceAdminService();
    try {
        const topics = await service.getTopics();
        const proofTypes = await service.getProofTypes();
        return { success: true, data: { topics, proofTypes } };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function addRequirementAction(topicSlug: string, proofTypeSlug: string): Promise<ActionResult<void>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const isAdmin = await AuthService.ensureUserRole(user.id, ["admin"]);
    if (!isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const service = new GovernanceAdminService();
    try {
        await service.addProofRequirement(topicSlug, proofTypeSlug);
        revalidatePath("/dashboard/admin/checklists");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function removeRequirementAction(topicSlug: string, proofTypeSlug: string): Promise<ActionResult<void>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const isAdmin = await AuthService.ensureUserRole(user.id, ["admin"]);
    if (!isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    const service = new GovernanceAdminService();
    try {
        await service.removeProofRequirement(topicSlug, proofTypeSlug);
        revalidatePath("/dashboard/admin/checklists");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
