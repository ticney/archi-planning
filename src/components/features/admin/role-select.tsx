"use client";

import { useTransition, useState } from "react";
import { UserRole } from "@/types";
import { updateRole } from "@/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleSelectProps {
    userId: string;
    currentRole: UserRole;
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
    const [isPending, startTransition] = useTransition();
    // Local state for immediate feedback effectively functioning as optimistic UI
    // In a full list, useOptimistic would be better at the table level, 
    // but here local state + revalidatePath works well.
    const [role, setRole] = useState<UserRole>(currentRole);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as UserRole;
        setRole(newRole); // Optimistic update locally

        startTransition(async () => {
            const result = await updateRole({ userId, role: newRole });
            if (!result.success) {
                // Revert on failure
                setRole(currentRole);
                alert(`Failed to update role: ${result.error}`);
            }
        });
    };

    const isAdmin = role === "admin";

    return (
        <div className="flex items-center gap-2">
            <div className={cn("relative", isPending && "opacity-50")}>
                <select
                    value={role}
                    onChange={handleChange}
                    disabled={isPending}
                    className={cn(
                        "h-8 w-[140px] rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        // Add custom arrow styling or keep native for simplicity
                    )}
                >
                    <option value="project_leader">Project Leader</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            {isAdmin && <Badge variant="default" className="ml-2">Admin</Badge>}
        </div>
    );
}
