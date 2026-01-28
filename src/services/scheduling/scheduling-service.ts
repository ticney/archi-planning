import { createClient } from '@/lib/supabase/server';
import { GovernanceRequest, governanceRequestStatusSchema, GovernanceTopic } from '@/types/schemas/governance-schema';
import { calculateSlotDuration } from './slot-rules';
import { addMinutes, startOfDay, endOfDay, setHours, setMinutes, isBefore, isAfter, isWeekend } from 'date-fns';
import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationService } from '../notification/notification-service';
import { AuditService } from '../audit/audit-service';


export interface BookingSlot {
    start: Date;
    end: Date;
    available: boolean;
}

/**
 * Returns available slots for a given date.
 * Currently uses mock logic: Fridays 14:00 - 17:00 are available, unless booked.
 * Checks against existing bookings in the database.
 */
export async function getAvailableSlots(date: Date): Promise<BookingSlot[]> {
    const supabase = await createClient();

    // Mock Availability Rule: Fridays only, 14:00 - 17:00
    // This aligns with "Default Board Time" rule in Dev Notes
    const dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday

    if (dayOfWeek !== 5) {
        return [];
    }

    const slots: BookingSlot[] = [];
    const startTime = setMinutes(setHours(date, 14), 0);
    const endTime = setMinutes(setHours(date, 17), 0);

    // Standard duration is 30 mins for 'standard', but we don't know the topic here?
    // The story says "based on estimated_duration".
    // We should probably take duration as input OR assume standard slots of 30 mins for the grid.
    // Let's assume 30 minute chunks for the grid.
    const slotDurationMinutes = 30;

    let currentSlotStart = startTime;

    // Fetch existing bookings for this day to check conflicts
    // We look for any request that overlaps with the day
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const { data: bookings, error } = await supabase
        .from('governance_requests')
        .select('booking_start_at, topic')
        .not('booking_start_at', 'is', null)
        .gte('booking_start_at', dayStart.toISOString())
        .lte('booking_start_at', dayEnd.toISOString());

    if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('Failed to fetch availability');
    }

    while (isBefore(currentSlotStart, endTime)) {
        const currentSlotEnd = addMinutes(currentSlotStart, slotDurationMinutes);

        // Check if conflict
        const isConflict = bookings?.some((booking) => {
            if (!booking.booking_start_at) return false;
            const bookingStart = new Date(booking.booking_start_at);
            // Calculate booking end based on its topic
            const duration = calculateSlotDuration(booking.topic as GovernanceTopic);
            // casting topic as GovernanceTopic because generic select might return string and TS doesn't know it matches enum
            const bookingEnd = addMinutes(bookingStart, duration);

            // Check overlap
            // Overlap if (StartA < EndB) and (EndA > StartB)
            return isBefore(currentSlotStart, bookingEnd) && isAfter(currentSlotEnd, bookingStart);
        });

        slots.push({
            start: currentSlotStart,
            end: currentSlotEnd,
            available: !isConflict
        });

        currentSlotStart = currentSlotEnd;
    }

    return slots;
}

/**
 * Books a slot for a request.
 */
export async function bookSlot(requestId: string, startAt: Date): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. Get Request to check status and topic
    const { data: request, error: reqError } = await supabase
        .from('governance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (reqError || !request) {
        return { success: false, error: 'Request not found' };
    }

    // 2. Validate Status
    // Story says: "Given a request that has been 'Validated'" -> "ready_for_board" / "validated"
    if (request.status !== 'validated') {
        return { success: false, error: 'Request is not in validated status' };
    }

    // 3. Calculate Check Duration
    const topic = request.topic as GovernanceTopic; // Cast as we checked status is valid(ated)
    if (!topic) return { success: false, error: 'Topic not set' };
    const duration = calculateSlotDuration(topic);
    const endAt = addMinutes(startAt, duration);

    // 4. Check Availability (Concurrency Check)
    // We check if any OTHER request overlaps
    // Overlap: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)

    // We need to query generically for overlaps. 
    // Since we can't easily do calculated columns in query, we can check ranges.
    // However, topic duration varies. 
    // Simplified MVP approach: 
    // Fetch all bookings around that time and check in code (Optimistic Locking needed? Or simple check)
    // For MVP, simple check is fine. A SQL function would be better for race conditions.

    const checkStart = startAt.toISOString();

    // Fetch bookings that might overlap. 
    // We only have booking_start_at. We assume max duration is 60 mins.
    // So we check bookings starting between (AttemptStart - 60m) and (AttemptEnd)

    const searchWindowStart = addMinutes(startAt, -240).toISOString(); // Max booking size safety margin (4 hours)
    const searchWindowEnd = endAt.toISOString();

    const { data: conflicts, error: conflictError } = await supabase
        .from('governance_requests')
        .select('id, booking_start_at, topic')
        .neq('id', requestId) // Exclude self if updating
        .not('booking_start_at', 'is', null)
        .gte('booking_start_at', searchWindowStart)
        .lte('booking_start_at', searchWindowEnd);

    if (conflictError) {
        return { success: false, error: 'Failed to check conflicts' };
    }

    const hasConflict = conflicts?.some((booking) => {
        if (!booking.booking_start_at) return false;
        const existStart = new Date(booking.booking_start_at);
        const existDuration = calculateSlotDuration(booking.topic as GovernanceTopic);
        const existEnd = addMinutes(existStart, existDuration);

        return isBefore(startAt, existEnd) && isAfter(endAt, existStart);
    });

    if (hasConflict) {
        return { success: false, error: 'Slot is no longer available' };
    }

    // 5. Update Request
    const { error: updateError } = await supabase
        .from('governance_requests')
        .update({
            booking_start_at: startAt.toISOString(),
            status: 'tentative'
        })
        .eq('id', requestId);

    if (updateError) {
        return { success: false, error: 'Failed to update booking' };
    }

    return { success: true };
}

/**
 * Returns all scheduled requests within a date range.
 * Includes derived booking_end_at based on topic duration.
 */
export async function getAllScheduledRequests(startDate: Date, endDate: Date): Promise<(GovernanceRequest & { booking_end_at: Date })[]> {
    const supabase = await createClient();

    const { data: requests, error } = await supabase
        .from('governance_requests')
        .select('*')
        .not('booking_start_at', 'is', null)
        .gte('booking_start_at', startDate.toISOString())
        .lte('booking_start_at', endDate.toISOString());

    if (error) {
        console.error('Error fetching schedule:', error);
        throw new Error('Failed to fetch schedule');
    }

    if (!requests) return [];

    return requests.map(req => {
        const start = new Date(req.booking_start_at!);
        const duration = calculateSlotDuration(req.topic as GovernanceTopic);
        return {
            ...req,
            booking_end_at: addMinutes(start, duration)
        };
    });
}

/**
 * Confirms a tentative slot.
 */
export async function confirmSlot(requestId: string, actorId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. Get Request
    const { data: request, error: reqError } = await supabase
        .from('governance_requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (reqError || !request) {
        return { success: false, error: 'Request not found' };
    }

    // 2. Validate Status
    if (request.status !== 'tentative') {
        return { success: false, error: 'Validation failed: Request is not in tentative status' };
    }

    // 3. Update Request
    const { error: updateError } = await supabase
        .from('governance_requests')
        .update({ status: 'confirmed' })
        .eq('id', requestId);

    if (updateError) {
        return { success: false, error: 'Failed to confirm booking' };
    }

    // 4. Side Effects (Notifications & Audit)
    try {
        const admin = createAdminClient();

        // Fetch requester email
        const { data: { user: requester } } = await admin.auth.admin.getUserById(request.created_by);
        const recipients: string[] = [];
        if (requester?.email) recipients.push(requester.email);

        // Fetch Board Members (Reviewers) emails
        // MVP: Assuming 'reviewer' role constitutes the Board
        const { data: boardProfiles } = await admin
            .from('profiles')
            .select('user_id')
            .eq('role', 'reviewer');

        if (boardProfiles && boardProfiles.length > 0) {
            // We need to fetch emails for these users. auth.admin.listUsers() returns all, checking one by one is slow.
            // But listUsers supports page? Or we can just iterate. Board members shouldn't be too many.
            // Or better: use the mapping if we have few.
            // Actually, we can just loop getUserById in parallel.
            const boardUserPromises = boardProfiles.map(p => admin.auth.admin.getUserById(p.user_id));
            const boardUsers = await Promise.all(boardUserPromises);
            boardUsers.forEach(u => {
                if (u.data.user?.email) recipients.push(u.data.user.email);
            });
        }

        if (recipients.length > 0) {
            const notificationService = new NotificationService();
            const slotDate = new Date(request.booking_start_at!); // Confirmed to exist
            const topic = request.topic as GovernanceTopic;
            const duration = calculateSlotDuration(topic);

            // Send to each recipient? Or one email with multiple TO/BCC?
            // resend supports string[] for to.
            // But ICS invite usually works best if sent individually or as main recipient.
            // Let's send individually to ensure privacy or cleaner headers, OR just send to all.
            // Story: "sent/attached to the Project Leader and Board Members"
            // Let's send to all in 'to'.

            // Deduplicate emails
            const uniqueRecipients = Array.from(new Set(recipients));

            // Wait, NotificationService.sendConfirmationEmail takes 'to: string'. 
            // I should update it to array or loop.
            // loop is safer for now if I don't want to change the service signature (though I defined it myself).
            // Actually `resend` allows array. But my service signature is `to: string`.
            // I'll loop.

            await Promise.all(uniqueRecipients.map(email =>
                notificationService.sendConfirmationEmail(
                    email,
                    request.title,
                    slotDate,
                    duration
                )
            ));
        }

        await AuditService.logAction('confirm_slot', {
            requestId: request.id,
            user_id: actorId,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error('Side effect failed', e);
        // Continue, as DB update succeeded
    }

    return { success: true };
}
