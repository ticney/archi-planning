'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ActionResult } from '@/types';
import { GovernanceService } from '@/services/governance/governance-service';
import { createGovernanceRequestSchema, GovernanceRequest } from '@/types/schemas/governance-schema';

const governanceService = new GovernanceService();

// ... (other imports)

export async function createRequestAction(
    prevState: ActionResult<GovernanceRequest> | null,
    formData: FormData
): Promise<ActionResult<GovernanceRequest>> {
    try {
        const rawData = {
            title: formData.get('title')?.toString(),
            project_code: formData.get('project_code')?.toString(),
            description: formData.get('description')?.toString() || undefined,
        };

        const parseResult = createGovernanceRequestSchema.safeParse(rawData);

        if (!parseResult.success) {
            const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        const request = await governanceService.createRequest(parseResult.data);

        // Revalidate paths where this data might appear

        return {
            success: true,
            data: request
        };
    } catch (error) {
        console.error('Action Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

import { updateGovernanceRequestTopicSchema, Attachment, recordAttachmentSchema } from '@/types/schemas/governance-schema';

export async function updateRequestTopicAction(
    requestId: string,
    prevState: ActionResult<GovernanceRequest> | null,
    formData: FormData
): Promise<ActionResult<GovernanceRequest>> {
    try {
        const rawData = {
            topic: formData.get('topic')?.toString(),
        };

        const parseResult = updateGovernanceRequestTopicSchema.safeParse(rawData);

        if (!parseResult.success) {
            const errorMessage = parseResult.error.issues.map((e) => e.message).join(', ');
            return { success: false, error: errorMessage };
        }

        const request = await governanceService.updateTopic(requestId, parseResult.data.topic);

        revalidatePath(`/governance/wizard/${requestId}`);

        return {
            success: true,
            data: request
        };
    } catch (error) {
        console.error('Action Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function recordAttachmentAction(
    prevState: ActionResult<Attachment> | null,
    formData: FormData
): Promise<ActionResult<Attachment>> {
    try {
        const rawData = {
            request_id: formData.get('request_id')?.toString(),
            document_type: formData.get('document_type')?.toString(),
            storage_path: formData.get('storage_path')?.toString(),
            filename: formData.get('filename')?.toString(),
        };

        const parseResult = recordAttachmentSchema.safeParse(rawData);

        if (!parseResult.success) {
            return { success: false, error: parseResult.error.issues[0].message };
        }

        const attachment = await governanceService.recordAttachment(parseResult.data);
        revalidatePath(`/governance/wizard/${parseResult.data.request_id}`);

        return { success: true, data: attachment };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function deleteAttachmentAction(
    attachmentId: string,
    requestId: string
): Promise<ActionResult<void>> {
    try {
        await governanceService.deleteAttachment(attachmentId);
        revalidatePath(`/governance/wizard/${requestId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function getAttachmentsAction(requestId: string): Promise<ActionResult<Attachment[]>> {
    try {
        const attachments = await governanceService.getAttachments(requestId);
        return { success: true, data: attachments };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
