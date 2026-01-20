"use server";

import { AuthService } from "@/services/auth/auth-service";
import { loginSchema, LoginFormValues } from "@/types/schemas/auth-schema";
import { ActionResult } from "@/types";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginFormValues): Promise<ActionResult<void>> {
    const result = await AuthService.login(data);

    if (!result.success) {
        return { success: false, error: result.error };
    }

    // Implement RBAC redirection logic
    const role = await AuthService.getUserRole(result.data.user.id || "");

    switch (role) {
        case "admin":
            redirect("/dashboard/admin/users");
        case "reviewer":
            redirect("/dashboard/reviewer");
        case "organizer":
            redirect("/dashboard/organizer");
        case "project_leader":
        default:
            redirect("/dashboard/project");
    }
}

export async function logoutAction(): Promise<ActionResult<void>> {
    await AuthService.logout();
    redirect("/login");
}
