import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyAgenda } from './agenda-exporter';
import * as SchedulingService from './scheduling-service';
import { format } from 'date-fns';

vi.mock('./scheduling-service', () => ({
    getAllScheduledRequests: vi.fn(),
}));

describe('AgendaExportService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generates CSV with confirmed slots only', async () => {
        const date = new Date('2026-01-23T00:00:00Z');

        const mockRequests: any[] = [
            {
                id: '1',
                booking_start_at: '2026-01-23T14:00:00Z',
                booking_end_at: new Date('2026-01-23T14:30:00Z'),
                status: 'confirmed',
                title: 'Project A',
                topic: 'standard',
                created_by: 'user-1'
            },
            {
                id: '2',
                booking_start_at: '2026-01-23T14:30:00Z',
                booking_end_at: new Date('2026-01-23T15:00:00Z'),
                status: 'tentative',
                title: 'Project B',
                topic: 'standard',
            }
        ];

        (SchedulingService.getAllScheduledRequests as any).mockResolvedValue(mockRequests);

        const csv = await generateDailyAgenda(date);

        const expectedTime = format(new Date('2026-01-23T14:00:00Z'), 'HH:mm');
        expect(csv).toContain('Time, Project, Leader, Topic');
        // We implemented quote wrapping for Project A if it has comma, but here it doesn't.
        // Wait, in implementation: `req.title.includes(',') ? ... : ...`.
        // 'Project A' doesn't include comma, so no quotes.
        expect(csv).toContain(`${expectedTime}, Project A, user-1, standard`);
        expect(csv).not.toContain('Project B');
    });

    it('returns empty message if no slots', async () => {
        const date = new Date('2026-01-23T00:00:00Z');
        (SchedulingService.getAllScheduledRequests as any).mockResolvedValue([]);
        const csv = await generateDailyAgenda(date);
        expect(csv).toContain('Time, Project, Leader, Topic');
        expect(csv.split('\n').length).toBe(1); // Just header
    });
});
