import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notification-service';
import { resend } from '@/lib/email-client';

// Mock Resend
vi.mock('@/lib/email-client', () => ({
    resend: {
        emails: {
            send: vi.fn(),
        },
    },
}));

describe('NotificationService', () => {
    let service: NotificationService;

    beforeEach(() => {
        service = new NotificationService();
        vi.clearAllMocks();
    });

    describe('sendRejectionEmail', () => {
        it('should send an email with the correct rejection details', async () => {
            await service.sendRejectionEmail('test@example.com', 'Project A', 'Budget too high', 'http://link');

            expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Governance Request Rejected: Project A',
                html: expect.stringContaining('Budget too high'),
            }));
        });
    });

    describe('sendReadyToBookEmail', () => {
        it('should send an email with the correct validation details', async () => {
            await service.sendReadyToBookEmail('test@example.com', 'Project B', 'http://book');

            expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Governance Request Validated: Project B',
                html: expect.stringContaining('Book Slot'),
            }));
        });
    });

    describe('sendConfirmationEmail', () => {
        it('should send an email with ICS attachment', async () => {
            const date = new Date('2026-02-01T10:00:00Z');
            await service.sendConfirmationEmail('test@example.com', 'Project C', date, 60);

            expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Booking Confirmed: Project C',
                attachments: expect.arrayContaining([
                    expect.objectContaining({
                        filename: 'invite.ics',
                        content: expect.any(String), // We'll assume untyped buffer/string for mock
                    })
                ])
            }));
        });
    });
});
