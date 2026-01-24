'use server';

import { bookSlot } from '@/services/scheduling/scheduling-service';
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
