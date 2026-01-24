import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth/auth-service';
import { fetchReviewerDashboardData } from '@/actions/reviewer-actions';
import { ReviewerDashboard } from '@/components/features/reviewer/reviewer-dashboard';

export default async function ReviewerDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const role = await AuthService.getUserRole(user.id);

    if (role !== 'reviewer') {
        return (
            <div className="container py-8">
                <div className="bg-destructive/15 text-destructive p-4 rounded-md">
                    <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                    <p>You must be logged in as a Reviewer to access this dashboard.</p>
                </div>
            </div>
        );
    }

    const { success, data, error } = await fetchReviewerDashboardData();

    if (!success || !data) {
        return (
            <div className="container py-8">
                <div className="bg-destructive/15 text-destructive p-4 rounded-md">
                    <h1 className="text-xl font-bold mb-2">Error Loading Dashboard</h1>
                    <p>{error || "Failed to fetch dashboard data."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviewer Cockpit</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and review pending governance requests.
                    </p>
                </div>
            </div>

            <ReviewerDashboard initialData={data} />
        </div>
    );
}
