'use server';

import { bookSlot, confirmSlot } from '@/services/scheduling/scheduling-service';
import { generateDailyAgenda } from '@/services/scheduling/agenda-exporter';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const bookSlotSchema = z.object({
    requestId: z.string().uuid(),
    bookingStartAt: z.string().datetime(), // Expecting ISO string
});

export async function bookSlotAction(date: { requestId: string; bookingStartAt: string }) {
    try {
        const validated = bookSlotSchema.parse(date);
        const startAt = new Date(validated.bookingStartAt);

        const result = await bookSlot(validated.requestId, startAt);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/dashboard/project');
        return { success: true };
    } catch (error) {
        console.error('Booking failed:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getSlotsAction(dateString: string) {
    try {
        const date = new Date(dateString);
        // Import internally to avoid circular deps if any, but service is separate
        const { getAvailableSlots } = await import('@/services/scheduling/scheduling-service');
        const slots = await getAvailableSlots(date);

        // Serialize Dates to strings for client consumption
        return slots.map(slot => ({
            ...slot,
            start: slot.start.toISOString(),
            end: slot.end.toISOString()
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getMasterScheduleAction(range: { start: string; end: string }) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { AuthService } = await import('@/services/auth/auth-service');
        const allowedRoles: ("project_leader" | "reviewer" | "organizer" | "admin")[] = ['organizer', 'admin'];
        const isAuthorized = await AuthService.ensureUserRole(user.id, allowedRoles);

        if (!isAuthorized) {
            return { success: false, error: 'Forbidden' };
        }

        const startDate = new Date(range.start);
        const endDate = new Date(range.end);

        const { getAllScheduledRequests } = await import('@/services/scheduling/scheduling-service');
        const requests = await getAllScheduledRequests(startDate, endDate);

        // Serialize Dates
        const serialized = requests.map(req => ({
            ...req,
            // Ensure booking_end_at is serialized
            booking_end_at: req.booking_end_at.toISOString(),
        }));

        return { success: true, data: serialized };

    } catch (error) {
        console.error('Failed to get master schedule:', error);
        return { success: false, error: 'Failed to fetch schedule' };
    }
}

export async function confirmSlotAction(requestId: string) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Unauthorized' };

        const { AuthService } = await import('@/services/auth/auth-service');
        const allowedRoles: ("project_leader" | "reviewer" | "organizer" | "admin")[] = ['organizer', 'admin'];
        const isAuthorized = await AuthService.ensureUserRole(user.id, allowedRoles);
        if (!isAuthorized) return { success: false, error: 'Forbidden' };

        const result = await confirmSlot(requestId, user.id);

        if (result.success) {
            revalidatePath('/dashboard/project');
        }

        return result;
    } catch (error) {
        console.error('Confirm failed:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function exportAgendaAction(dateString: string) {
    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Unauthorized' };

        const { AuthService } = await import('@/services/auth/auth-service');
        const allowedRoles: ("project_leader" | "reviewer" | "organizer" | "admin")[] = ['organizer', 'admin'];
        const isAuthorized = await AuthService.ensureUserRole(user.id, allowedRoles);
        if (!isAuthorized) return { success: false, error: 'Forbidden' };

        const date = new Date(dateString);
        const text = await generateDailyAgenda(date);

        return { success: true, data: text };
    } catch (error) {
        console.error('Export failed:', error);
        return { success: false, error: 'Failed to export agenda' };
    }
}
