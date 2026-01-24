import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookingCalendar } from '@/components/features/scheduling/booking-calendar';
import { format } from 'date-fns';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: request, error } = await supabase
        .from('governance_requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !request) {
        notFound();
    }

    return (
        <div className="p-10 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">{request.title}</h1>
                <p className="text-muted-foreground mt-2">Project Code: {request.project_code}</p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
                <h2 className="font-semibold mb-2">Status</h2>
                <div className="capitalize">{request.status.replace('_', ' ')}</div>

                {request.booking_start_at && (
                    <div className="mt-2 text-green-600 font-medium">
                        Booked for: {format(new Date(request.booking_start_at), 'MMMM d, yyyy @ HH:mm')}
                    </div>
                )}
            </div>

            {request.status === 'validated' && !request.booking_start_at && (
                <div>
                    <BookingCalendar requestId={request.id} />
                </div>
            )}

            {request.status === 'tentative' && (
                <div>
                    {/* Show visual confirmation or re-book option? For now just status */}
                    <p className="text-sm text-muted-foreground">Your slot is tentatively booked. The organizer will confirm shortly.</p>
                </div>
            )}
        </div>
    );
}
