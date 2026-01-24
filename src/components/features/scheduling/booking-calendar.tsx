'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { bookSlotAction, getSlotsAction } from '@/actions/scheduling-actions';
import { BookingSlot } from '@/services/scheduling/scheduling-service';
import { toast } from 'sonner';

// Define Client-side shape where dates are strings (from JSON)
interface SerializedBookingSlot extends Omit<BookingSlot, 'start' | 'end'> {
    start: string;
    end: string;
}

interface BookingCalendarProps {
    requestId: string;
    // We can pass initial availability if we want SSR, but client side fetching for slots is easier for interaction
}

export function BookingCalendar({ requestId }: BookingCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [booking, setBooking] = useState(false);

    // Fetch slots when date changes
    // Since getAvailableSlots is a server-side function, we can invoke it via a Server Action Wrapper or API
    // Wait, getAvailableSlots is in 'services/scheduling/scheduling-service.ts', which is server-side.
    // I need a Server Action to fetch slots or use a Route Handler.
    // I can make a simple action to fetch slots.

    // For now, let's assume we have an action or we can just make it part of the same action file?
    // Let's create a small client-side fetcher or server action for slots.
    // I'll add `getSlotsAction` to `scheduling-actions.ts` in next step or use a temporary approach.
    // Actually, I should have planned for `getSlotsAction`.
    // I will mock it here or assumes it exists. 
    // I will ADD it to `scheduling-actions.ts` shortly.

    const handleDateSelect = async (newDate: Date | undefined) => {
        setDate(newDate);
        setSelectedSlot(null);
        if (newDate) {
            setLoadingSlots(true);
            try {
                const serializedSlots = await getSlotsAction(newDate.toISOString());
                // Deserialize back to Date objects for local state
                const parsedSlots: BookingSlot[] = serializedSlots.map((s: SerializedBookingSlot) => ({
                    ...s,
                    start: new Date(s.start),
                    end: new Date(s.end)
                }));
                setSlots(parsedSlots);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load slots");
            } finally {
                setLoadingSlots(false);
            }
        } else {
            setSlots([]);
        }
    };

    const handleBook = async () => {
        if (!selectedSlot || !date) return;
        setBooking(true);
        try {
            const result = await bookSlotAction({
                requestId,
                bookingStartAt: selectedSlot.start.toISOString() // Pass validated string
            });

            if (result.success) {
                toast.success("Slot booked successfully!");
                // Router refresh happen in action, but maybe we need to redirect or hide modal?
            } else {
                toast.error(result.error || "Failed to book slot");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        } finally {
            setBooking(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Schedule Board Review</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
                <div>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        className="rounded-md border shadow"
                        disabled={(date) => date < new Date() || date.getDay() !== 5} // Disable past dates and non-Fridays (mock rule)
                    />
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold mb-4">
                        Available Slots for {date ? format(date, 'MMMM d, yyyy') : '...'}
                    </h3>

                    {loadingSlots ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin h-6 w-6" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {slots.length === 0 && date && (
                                <div className="col-span-2 text-muted-foreground text-sm text-center p-4">
                                    No slots available for this date.
                                </div>
                            )}
                            {slots.map((slot, i) => (
                                <Button
                                    key={i}
                                    variant={selectedSlot === slot ? "default" : "outline"}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot)}
                                    className="w-full justify-start text-sm"
                                >
                                    {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 pt-4 border-t">
                        <Button
                            className="w-full"
                            disabled={!selectedSlot || booking}
                            onClick={handleBook}
                        >
                            {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


