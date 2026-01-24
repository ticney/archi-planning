'use server';

import { ActionResult } from '@/types';
import { GovernanceService } from '@/services/governance/governance-service';
import { GovernanceRequest } from '@/types/schemas/governance-schema';

const governanceService = new GovernanceService();

export type ReviewerDashboardData = {
    requests: (GovernanceRequest & { maturityScore: number, projectName: string })[];
};

export async function fetchReviewerDashboardData(): Promise<ActionResult<ReviewerDashboardData>> {
    try {
        const requests = await governanceService.getPendingRequests();

        // Optimized: Batch fetch attachments to resolve N+1 query
        const requestIds = requests.map(r => r.id);
        const attachmentsMap = await governanceService.getAttachmentsForRequests(requestIds);

        const requestsWithScore = requests.map((req) => {
            const reqAttachments = attachmentsMap[req.id] || [];
            const score = governanceService.calculateMaturityScoreSync(req, reqAttachments);

            return {
                ...req,
                maturityScore: score,
                projectName: req.title, // Mapping title to Project Name for now as per AC
            };
        });

        return {
            success: true,
            data: {
                requests: requestsWithScore
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
