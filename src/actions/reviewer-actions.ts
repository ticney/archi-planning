'use server';

import { ActionResult } from '@/types';
import { GovernanceService } from '@/services/governance/governance-service';
import { GovernanceRequest, rejectGovernanceRequestSchema } from '@/types/schemas/governance-schema';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const governanceService = new GovernanceService();

export type ReviewerDashboardData = {
    pendingRequests: (GovernanceRequest & { maturityScore: number, projectName: string })[];
    validatedRequests: (GovernanceRequest & { maturityScore: number, projectName: string })[];
};

export async function fetchReviewerDashboardData(): Promise<ActionResult<ReviewerDashboardData>> {
    try {
        // Fetch Pending
        const pending = await governanceService.getPendingRequests();
        // Fetch Validated
        const validated = await governanceService.getValidatedRequests();

        const allRequests = [...pending, ...validated];

        // Optimized: Batch fetch attachments to resolve N+1 query
        const requestIds = allRequests.map(r => r.id);
        const attachmentsMap = await governanceService.getAttachmentsForRequests(requestIds);

        const enrichRequest = (req: GovernanceRequest) => {
            const reqAttachments = attachmentsMap[req.id] || [];
            const score = governanceService.calculateMaturityScoreSync(req, reqAttachments);
            return {
                ...req,
                maturityScore: score,
                projectName: req.title,
            };
        };

        return {
            success: true,
            data: {
                pendingRequests: pending.map(enrichRequest),
                validatedRequests: validated.map(enrichRequest),
            }
        };
    } catch (error) {
        console.error('fetchReviewerDashboardData Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function validateGovernanceRequest(requestId: string): Promise<ActionResult<void>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Verify Reviewer Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!profile || profile.role !== 'reviewer') {
            return { success: false, error: 'Forbidden: Reviewer role required' };
        }

        await governanceService.validateRequest(requestId, user.id);

        revalidatePath('/dashboard/reviewer');

        return { success: true };
    } catch (error) {
        console.error('validateGovernanceRequest Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function rejectGovernanceRequest(requestId: string, reason: string): Promise<ActionResult<void>> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Verify Reviewer Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!profile || profile.role !== 'reviewer') {
            return { success: false, error: 'Forbidden: Reviewer role required' };
        }

        const validationResult = rejectGovernanceRequestSchema.safeParse({ requestId, reason });
        if (!validationResult.success) {
            return { success: false, error: validationResult.error.issues[0].message };
        }

        await governanceService.rejectRequest(requestId, reason, user.id);

        revalidatePath('/dashboard/reviewer');

        return { success: true };
    } catch (error) {
        console.error('rejectGovernanceRequest Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
