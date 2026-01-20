import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UserWithRole } from "@/services/admin/user-service";
import { RoleSelect } from "./role-select";

interface UserTableProps {
    users: UserWithRole[];
}

export function UserTable({ users }: UserTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                                <RoleSelect userId={user.id} currentRole={user.role} />
                            </TableCell>
                            <TableCell>
                                {user.last_sign_in_at
                                    ? new Date(user.last_sign_in_at).toLocaleDateString() +
                                    " " +
                                    new Date(user.last_sign_in_at).toLocaleTimeString()
                                    : "Never"}
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
