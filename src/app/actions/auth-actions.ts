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
    const role = result.data.role;

    switch (role) {
        case "admin":
            redirect("/dashboard/admin/users");
            break;
        case "reviewer":
            redirect("/dashboard/reviewer");
            break;
        case "organizer":
            redirect("/dashboard/organizer");
            break;
        case "project_leader":
        default:
            redirect("/dashboard/project");
            break;
    }
}

export async function logoutAction(): Promise<ActionResult<void>> {
    await AuthService.logout();
    redirect("/login");
}
