import { createClient } from '@/lib/supabase/server';
import { CreateGovernanceRequestInput, GovernanceRequest, GovernanceTopic, RecordAttachmentInput, Attachment } from '@/types/schemas/governance-schema';
import { TOPIC_RULES, getMissingProofs } from './governance-rules';

export class GovernanceService {
    async createRequest(input: CreateGovernanceRequestInput): Promise<GovernanceRequest> {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
            .from('governance_requests')
            .insert({
                title: input.title,
                project_code: input.project_code,
                description: input.description,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to create governance request: ${error.message}`);
        }

        return data;
    }

    async updateTopic(requestId: string, topic: GovernanceTopic): Promise<GovernanceRequest> {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { duration } = TOPIC_RULES[topic];

        const { data, error } = await supabase
            .from('governance_requests')
            .update({
                topic: topic,
                estimated_duration: duration,
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to update governance request topic: ${error.message}`);
        }

        return data;
    }

    async getRequestById(id: string): Promise<GovernanceRequest | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('governance_requests')
            .select()
            .eq('id', id)
            .single();

        if (error) {
            console.error('GovernanceService Error:', error);
            return null;
        }

        return data;
    }

    async recordAttachment(input: RecordAttachmentInput): Promise<Attachment> {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('request_attachments')
            .insert({
                request_id: input.request_id,
                document_type: input.document_type,
                storage_path: input.storage_path,
                filename: input.filename,
                uploaded_by: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to record attachment: ${error.message}`);
        }

        return data;
    }

    async deleteAttachment(attachmentId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Get the attachment details first to know the storage path
        const { data: attachment, error: fetchError } = await supabase
            .from('request_attachments')
            .select('storage_path')
            .eq('id', attachmentId)
            .single();

        if (fetchError) {
            console.error('GovernanceService Error (Fetch for Delete):', fetchError);
            throw new Error(`Failed to find attachment: ${fetchError.message}`);
        }

        if (!attachment) {
            throw new Error("Attachment not found");
        }

        // 2. Delete from Storage
        const { error: storageError } = await supabase
            .storage
            .from('governance-proofs')
            .remove([attachment.storage_path]);

        if (storageError) {
            console.error('GovernanceService Error (Storage Delete):', storageError);
            throw new Error(`Failed to delete file from storage: ${storageError.message}`);
        }

        // 3. Delete from Database
        const { error: dbError } = await supabase
            .from('request_attachments')
            .delete()
            .eq('id', attachmentId);

        if (dbError) {
            console.error('GovernanceService Error (DB Delete):', dbError);
            throw new Error(`Failed to delete attachment record: ${dbError.message}`);
        }
    }

    async getAttachments(requestId: string): Promise<Attachment[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('request_attachments')
            .select('*')
            .eq('request_id', requestId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('GovernanceService Error:', error);
            return [];
        }

        return data;
    }
    async submitRequest(requestId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Fetch the request to check topic
        const request = await this.getRequestById(requestId);
        if (!request) throw new Error("Request not found");

        // 2. Fetch attachments
        const attachments = await this.getAttachments(requestId);

        // 3. Validate Proofs
        const missing = getMissingProofs(request.topic as GovernanceTopic, attachments);
        if (missing.length > 0) {
            console.error(`[submitRequest] Missing proofs: ${missing.join(', ')} for topic ${request.topic}`);
            console.error(`[submitRequest] Attachments found: ${JSON.stringify(attachments.map(a => a.document_type))}`);
            throw new Error(`Missing mandatory documents: ${missing.join(', ')}`);
        }

        // 4. Update Status
        const { data: updatedData, error } = await supabase
            .from('governance_requests')
            .update({
                status: 'pending_review',
                submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId)
            .select();

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to submit request: ${error.message}`);
        }

        if (!updatedData || updatedData.length === 0) {
            console.error('GovernanceService Error: No rows updated. RLS check failed?');
            throw new Error("Failed to submit request: Permission denied or request not found.");
        }
    }
}
