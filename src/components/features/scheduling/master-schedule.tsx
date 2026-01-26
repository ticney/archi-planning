'use client';

import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, addDays, format, isSameDay } from 'date-fns';
import { getMasterScheduleAction, confirmSlotAction } from '@/actions/scheduling-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GovernanceRequest } from '@/types/schemas/governance-schema';
import { toast } from 'sonner';

type ScheduledRequest = GovernanceRequest & {
    booking_end_at: string; // Serialized
};

export function MasterSchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedule, setSchedule] = useState<ScheduledRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    const loadSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getMasterScheduleAction({
                start: weekStart.toISOString(),
                end: weekEnd.toISOString(),
            });

            if (result.success && result.data) {
                setSchedule(result.data as ScheduledRequest[]);
            } else {
                setError(result.error || 'Failed to load schedule');
            }
        } catch (err) {
            setError('An error occurred while loading');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedule();
    }, [currentDate]);

    const handleConfirm = async (requestId: string) => {
        // Optimistic update
        setSchedule(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'confirmed' } : req
        ) as ScheduledRequest[]);

        const result = await confirmSlotAction(requestId);
        if (result.success) {
            toast.success("Slot confirmed");
            // Optionally reload to ensure data consistency
            // loadSchedule(); 
        } else {
            toast.error(result.error || "Failed to confirm");
            loadSchedule(); // Revert/Refresh
        }
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const today = () => setCurrentDate(new Date());

    const days = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i)); // Mon-Fri

    const getRequestsForDay = (day: Date) => {
        return schedule.filter(req => {
            if (!req.booking_start_at) return false;
            return isSameDay(new Date(req.booking_start_at), day);
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Master Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-32 text-center">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={today}>
                        Today
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>}

                {error && <div className="text-red-500 text-sm text-center p-2">{error}</div>}

                {!loading && !error && (
                    <div className="grid grid-cols-5 gap-2 min-h-[400px]">
                        {days.map((day) => {
                            const dayRequests = getRequestsForDay(day);
                            return (
                                <div key={day.toISOString()} className="border rounded-md p-2 bg-slate-50 dark:bg-slate-900">
                                    <div className="text-center font-medium border-b pb-1 mb-2 text-sm text-slate-500">
                                        {format(day, 'EEE d')}
                                    </div>
                                    <div className="space-y-2">
                                        {dayRequests.length === 0 && (
                                            <div className="text-xs text-center text-slate-400 py-4 italic">No items</div>
                                        )}
                                        {dayRequests.map(req => (
                                            <ScheduleItem key={req.id} request={req} onConfirm={handleConfirm} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ScheduleItem({ request, onConfirm }: { request: ScheduledRequest; onConfirm: (id: string) => void }) {
    const startTime = new Date(request.booking_start_at!);
    const endTime = new Date(request.booking_end_at); // Pre-calculated/serialized

    // Color coding
    const statusColor = (request.status as any) === 'confirmed'
        ? 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800'
        : 'bg-yellow-100 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={cn(
                    "p-2 rounded border text-xs cursor-pointer hover:shadow-md transition-all",
                    statusColor
                )}>
                    <div className="font-semibold truncate">{request.title}</div>
                    <div className="flex justify-between items-center mt-1 text-[10px] opacity-80">
                        <span>{format(startTime, 'HH:mm')}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">{request.project_code}</Badge>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">{request.title}</h4>
                    <p className="text-xs text-muted-foreground">{request.description || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                        <div>
                            <span className="font-semibold">Time:</span> {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                        </div>
                        <div>
                            <span className="font-semibold">Type:</span> {request.topic}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span>
                            <Badge variant={(request.status as any) === 'confirmed' ? 'default' : 'outline'} className="ml-1 text-[10px]">
                                {request.status}
                            </Badge>
                        </div>
                        <div>
                            <span className="font-semibold">Leader:</span> <span className="font-mono">{request.created_by.slice(0, 8)}...</span>
                        </div>
                    </div>

                    {(request.status as any) === 'tentative' && (
                        <Button
                            className="w-full mt-2"
                            size="sm"
                            onClick={() => onConfirm(request.id)}
                        >
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Confirm Booking
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
