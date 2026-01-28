import { resend } from '@/lib/email-client';
import { getRejectionEmailTemplate, getReadyToBookEmailTemplate, getConfirmationEmailTemplate } from './email-templates';
import { createEvent, DateArray } from 'ics';

export class NotificationService {
    async sendRejectionEmail(to: string, projectTitle: string, reason: string, link: string) {
        const html = getRejectionEmailTemplate(projectTitle, reason, link);
        await resend.emails.send({
            from: 'Governance <onboarding@resend.dev>',
            to,
            subject: `Governance Request Rejected: ${projectTitle}`,
            html,
        });
    }

    async sendReadyToBookEmail(to: string, projectTitle: string, link: string) {
        const html = getReadyToBookEmailTemplate(projectTitle, link);
        await resend.emails.send({
            from: 'Governance <onboarding@resend.dev>',
            to,
            subject: `Governance Request Validated: ${projectTitle}`,
            html,
        });
    }

    async sendConfirmationEmail(to: string, projectTitle: string, slotDate: Date, duration: number) {
        const icsContent = await new Promise<string>((resolve, reject) => {
            const start: DateArray = [
                slotDate.getFullYear(),
                slotDate.getMonth() + 1,
                slotDate.getDate(),
                slotDate.getHours(),
                slotDate.getMinutes(),
            ];

            createEvent({
                start,
                duration: { minutes: duration },
                title: `Project Presentation: ${projectTitle}`,
                description: `Presentation for verified project: ${projectTitle}`,
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
            }, (error, value) => {
                if (error) reject(error);
                else resolve(value);
            });
        });

        const html = getConfirmationEmailTemplate(projectTitle, slotDate, duration);

        await resend.emails.send({
            from: 'Governance <onboarding@resend.dev>',
            to,
            subject: `Booking Confirmed: ${projectTitle}`,
            html,
            attachments: [
                {
                    filename: 'invite.ics',
                    content: icsContent,
                },
            ],
        });
    }
}
