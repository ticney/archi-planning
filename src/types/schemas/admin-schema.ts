import { z } from "zod";

export const updateRoleSchema = z.object({
    userId: z.string().uuid("Invalid User ID"),
    role: z.enum(["project_leader", "reviewer", "organizer", "admin"]),
});

export type UpdateRoleValues = z.infer<typeof updateRoleSchema>;
