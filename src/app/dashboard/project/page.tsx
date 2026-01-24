import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProjectDashboardPage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    const { data: requests, error } = await supabase
        .from('governance_requests')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching requests:', error);
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your governance requests and project status.</p>
                </div>
                <Link href="/dashboard/project/new">
                    <Button>New Request</Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {!requests || requests.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <h3 className="text-lg font-medium">No requests found</h3>
                        <p className="text-muted-foreground mb-4">Start your first governance request to get started.</p>
                        <Link href="/dashboard/project/new">
                            <Button variant="outline">Create Request</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground border-b">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Project Name</th>
                                    <th className="px-6 py-3 font-medium">Code</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{req.title}</td>
                                        <td className="px-6 py-4">{req.project_code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${req.status === 'validated' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
