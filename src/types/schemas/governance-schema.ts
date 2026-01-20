import { z } from 'zod';
import { Database } from '../supabase';

export const governanceRequestStatusSchema = z.enum([
    'draft',
    'pending',
    'validated',
    'rejected',
]);

export const createGovernanceRequestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    project_code: z.string().min(1, 'Project code is required').max(20, 'Project code is too long'),
    description: z.string().optional(),
});

export type CreateGovernanceRequestInput = z.infer<typeof createGovernanceRequestSchema>;
export type GovernanceRequestStatus = z.infer<typeof governanceRequestStatusSchema>;

export type GovernanceRequest = Database['public']['Tables']['governance_requests']['Row'];
