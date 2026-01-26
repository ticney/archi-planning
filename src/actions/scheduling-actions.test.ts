import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmSlotAction, exportAgendaAction } from './scheduling-actions';
// We mock the implementations. Since they are imported in the file, we mock the modules.
// But the file uses dynamic imports for AuthService and Supabase in getMasterScheduleAction.
// For the new actions, we should probably stick to static imports if possible, or support dynamic mocking?
// Vitest hoisting mocks modules.

vi.mock('@/services/scheduling/scheduling-service', () => ({
    bookSlot: vi.fn(),
    getAvailableSlots: vi.fn(),
    getAllScheduledRequests: vi.fn(),
    confirmSlot: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('@/services/scheduling/agenda-exporter', () => ({
    generateDailyAgenda: vi.fn().mockResolvedValue('Time, Project\n14:00, A')
}));

vi.mock('@/services/auth/auth-service', () => ({
    AuthService: {
        ensureUserRole: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn().mockResolvedValue({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
        }
    })
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

import { AuthService } from '@/services/auth/auth-service';
import { confirmSlot } from '@/services/scheduling/scheduling-service';
import { generateDailyAgenda } from '@/services/scheduling/agenda-exporter';

describe('SchedulingServerActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default allowable role
        (AuthService.ensureUserRole as any).mockResolvedValue(true);
    });

    describe('confirmSlotAction', () => {
        it('fails if unauthorized', async () => {
            (AuthService.ensureUserRole as any).mockResolvedValue(false);
            const result = await confirmSlotAction('req-1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Forbidden');
        });

        it('calls confirmSlot service and revalidates if authorized', async () => {
            const result = await confirmSlotAction('req-1');
            expect(result.success).toBe(true);
            expect(confirmSlot).toHaveBeenCalledWith('req-1', 'user-1');
        });
    });

    describe('exportAgendaAction', () => {
        it('fails if unauthorized', async () => {
            (AuthService.ensureUserRole as any).mockResolvedValue(false);
            const result = await exportAgendaAction('2026-01-23');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Forbidden');
        });

        it('returns agenda data', async () => {
            const result = await exportAgendaAction('2026-01-23');
            expect(result.success).toBe(true);
            expect(result.data).toContain('Time, Project');
            expect(generateDailyAgenda).toHaveBeenCalled();
        });
    });
});
