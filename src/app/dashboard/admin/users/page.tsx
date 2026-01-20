import { getUsersList } from "@/actions/admin-actions";
import { UserTable } from "@/components/features/admin/user-table";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const { success, data, error } = await getUsersList();

    if (!success || !data) {
        // Handle unauthorized access or error
        if (error === "Unauthorized") {
            // redirect("/login");
            console.log("Debug: Unauthorized redirect suppressed");
        }
        // For other errors, we might show an error state
        return (
            <div className="p-8 text-destructive">
                <h1 className="text-2xl font-bold">Error</h1>
                <p>Failed to load users: {error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and access permissions.
                    </p>
                </div>
            </div>

            <UserTable users={data} />
        </div>
    );
}
