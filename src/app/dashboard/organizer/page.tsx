import { MasterSchedule } from '@/components/features/scheduling/master-schedule';
import { AgendaExport } from '@/components/features/scheduling/agenda-export';

export default function OrganizerDashboardPage() {
    return (
        <div className="p-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
                    <p className="text-muted-foreground">Manage schedule and bookings.</p>
                </div>
                <AgendaExport />
            </div>

            <MasterSchedule />
        </div>
    );
}
