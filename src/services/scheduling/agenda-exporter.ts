import { getAllScheduledRequests, BookingSlot } from './scheduling-service';
import { startOfDay, endOfDay, format } from 'date-fns';

export async function generateDailyAgenda(date: Date): Promise<string> {
    const start = startOfDay(date);
    const end = endOfDay(date);

    // Fetch all requests
    const requests = await getAllScheduledRequests(start, end);

    // Filter for confirmed only
    const confirmedRequests = requests.filter(req => (req.status as any) === 'confirmed');

    // Sort by start time
    confirmedRequests.sort((a, b) =>
        new Date(a.booking_start_at!).getTime() - new Date(b.booking_start_at!).getTime()
    );

    const header = "Time, Project, Leader, Topic";
    const lines = confirmedRequests.map(req => {
        const time = format(new Date(req.booking_start_at!), 'HH:mm');
        // Robust CSV handling: escape quotes and wrap in quotes if needed
        let project = req.title;
        if (project.includes(',') || project.includes('"')) {
            project = `"${project.replace(/"/g, '""')}"`;
        }
        const leader = req.created_by;
        const topic = req.topic;

        return `${time}, ${project}, ${leader}, ${topic}`;
    });

    return [header, ...lines].join('\n');
}
