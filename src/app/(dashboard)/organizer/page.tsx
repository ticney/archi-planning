import { MasterSchedule } from "@/components/features/scheduling/master-schedule";

export default function OrganizerDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage board agenda and view master schedule.
                </p>
            </div>

            <div className="grid gap-4">
                <MasterSchedule />
            </div>
        </div>
    );
}
