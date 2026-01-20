'use server';

import { revalidatePath } from 'next/cache';
import { ActionResult } from '@/types';
import { GovernanceService } from '@/services/governance/governance-service';
import { createGovernanceRequestSchema, GovernanceRequest } from '@/types/schemas/governance-schema';

const governanceService = new GovernanceService();

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
        revalidatePath('/dashboard');

        return { success: true, data: request };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
