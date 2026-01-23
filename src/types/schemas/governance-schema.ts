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

export const governanceTopicSchema = z.enum(['standard', 'strategic']);
export type GovernanceTopic = z.infer<typeof governanceTopicSchema>;

export const updateGovernanceRequestTopicSchema = z.object({
    topic: governanceTopicSchema,
});
export type UpdateGovernanceRequestTopicInput = z.infer<typeof updateGovernanceRequestTopicSchema>;

export const attachmentTypeSchema = z.enum([
    'dat_sheet',
    'architecture_diagram',
    'security_signoff',
    'finops_approval',
    'other',
]);
export type AttachmentType = z.infer<typeof attachmentTypeSchema>;

export const attachmentSchema = z.object({
    id: z.string().uuid(),
    request_id: z.string().uuid(),
    document_type: attachmentTypeSchema, // Using Zod version of enum
    storage_path: z.string(),
    filename: z.string(),
    uploaded_at: z.string(),
    uploaded_by: z.string().uuid(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

// Input for recording an attachment (server action)
export const recordAttachmentSchema = z.object({
    request_id: z.string().uuid(),
    document_type: attachmentTypeSchema,
    storage_path: z.string(),
    filename: z.string(),
});
export type RecordAttachmentInput = z.infer<typeof recordAttachmentSchema>;
