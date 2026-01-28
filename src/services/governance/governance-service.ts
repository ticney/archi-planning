import { createClient } from '@/lib/supabase/server';
import { CreateGovernanceRequestInput, GovernanceRequest, GovernanceTopic, RecordAttachmentInput, Attachment } from '@/types/schemas/governance-schema';
import { getMissingProofs } from './governance-rules';
import { calculateSlotDuration } from '../scheduling/slot-rules';

// Legacy fallback for requests created before dynamic rules
const LEGACY_TOPIC_RULES: Record<string, string[]> = {
    standard: ['dat_sheet', 'architecture_diagram'],
    strategic: ['dat_sheet', 'security_signoff', 'finops_approval']
};

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

        // 1. Fetch current status to ensure it's editable
        const request = await this.getRequestById(requestId);
        if (!request) throw new Error("Request not found");

        if ((request.status as unknown as string) !== 'draft') {
            throw new Error("Cannot update topic for requests that are not in draft status");
        }

        // 2. Fetch Topic & Requirements from DB
        const { data: topicData, error: topicError } = await supabase
            .from('governance_topics')
            .select('id, slug')
            .eq('slug', topic)
            .single();

        if (topicError || !topicData) throw new Error(`Topic not found: ${topic}`);

        const { data: proofs, error: proofsError } = await supabase
            .from('governance_topic_proofs')
            .select('governance_proof_types(slug)')
            .eq('topic_id', topicData.id);

        if (proofsError) throw new Error(`Failed to fetch topic proofs: ${proofsError.message}`);

        // Flatten to array of slugs
        const requirementsSnapshot = proofs.map((p: any) => p.governance_proof_types.slug);

        const duration = calculateSlotDuration(topic);

        const { data, error } = await supabase
            .from('governance_requests')
            .update({
                topic: topic,
                estimated_duration: duration,
                requirements_snapshot: requirementsSnapshot,
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

    async getAttachmentsForRequests(requestIds: string[]): Promise<Record<string, Attachment[]>> {
        if (requestIds.length === 0) return {};

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('request_attachments')
            .select('*')
            .in('request_id', requestIds)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('GovernanceService Error (Batch):', error);
            return {};
        }

        // Group by request_id
        const grouped: Record<string, Attachment[]> = {};
        requestIds.forEach(id => grouped[id] = []);

        data.forEach(attachment => {
            if (grouped[attachment.request_id]) {
                grouped[attachment.request_id].push(attachment);
            }
        });

        return grouped;
    }

    async submitRequest(requestId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Fetch the request to check topic
        const request = await this.getRequestById(requestId);
        if (!request) throw new Error("Request not found");

        // 2. Fetch attachments
        const attachments = await this.getAttachments(requestId);

        // 3. Validate Proofs
        // Use snapshot if available, else usage legacy fallback
        let requiredProofs: string[] = [];
        if (request.requirements_snapshot && Array.isArray(request.requirements_snapshot)) {
            requiredProofs = request.requirements_snapshot as string[];
        } else if (request.topic && LEGACY_TOPIC_RULES[request.topic]) {
            requiredProofs = LEGACY_TOPIC_RULES[request.topic];
        }

        const missing = getMissingProofs(requiredProofs, attachments);
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

    async getPendingRequests(): Promise<GovernanceRequest[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('governance_requests')
            .select('*')
            .eq('status', 'pending_review')
            .order('submitted_at', { ascending: true }) // Oldest first
            .limit(50);

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to fetch pending requests: ${error.message}`);
        }

        return data || [];
    }

    async calculateMaturityScore(request: GovernanceRequest): Promise<number> {
        const attachments = await this.getAttachments(request.id);
        return this.calculateMaturityScoreSync(request, attachments);
    }

    calculateMaturityScoreSync(request: GovernanceRequest, attachments: Attachment[]): number {
        console.error(`[DEBUG START] Request Topic: ${request.topic}`);
        let requiredProofs: string[] = [];

        if (request.requirements_snapshot && Array.isArray(request.requirements_snapshot)) {
            requiredProofs = request.requirements_snapshot as string[];
        } else if (request.topic && LEGACY_TOPIC_RULES[request.topic]) {
            requiredProofs = LEGACY_TOPIC_RULES[request.topic];
        } else {
            return 0; // No topic
        }

        const requiredCount = requiredProofs.length;
        if (requiredCount === 0) return 100;

        const missing = getMissingProofs(requiredProofs, attachments);
        console.error(`[DEBUG] Topic: ${request.topic}`);
        console.error(`[DEBUG] Required: ${JSON.stringify(requiredProofs)}`);
        console.error(`[DEBUG] Attachments Types: ${JSON.stringify(attachments.map(a => a.document_type))}`);
        console.error(`[DEBUG] Missing: ${JSON.stringify(missing)}`);

        const uploadedCount = requiredCount - missing.length;

        // Simple percentage calculation
        return Math.round((uploadedCount / requiredCount) * 100);
    }
    async validateRequest(requestId: string, reviewerId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Fetch current status
        const request = await this.getRequestById(requestId);
        if (!request) throw new Error("Request not found");

        if ((request.status as unknown as string) !== 'pending_review') {
            throw new Error("Request is not pending review");
        }

        // 2. Update status
        const { error } = await supabase
            .from('governance_requests')
            .update({
                status: 'validated',
                validated_by: reviewerId,
                validated_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to validate request: ${error.message}`);
        }

        // TODO: Send notification stub
        console.log(`[Notification] Request ${requestId} validated by ${reviewerId}`);
    }

    async getValidatedRequests(): Promise<GovernanceRequest[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('governance_requests')
            .select('*')
            .eq('status', 'validated')
            .order('validated_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to fetch validated requests: ${error.message}`);
        }

        return data || [];
    }

    async rejectRequest(requestId: string, reason: string, reviewerId: string): Promise<void> {
        const supabase = await createClient();

        // 1. Fetch current status
        const request = await this.getRequestById(requestId);
        if (!request) throw new Error("Request not found");

        if ((request.status as unknown as string) !== 'pending_review') {
            throw new Error("Request is not pending review");
        }

        // 2. Update status
        const { error } = await supabase
            .from('governance_requests')
            .update({
                status: 'draft',
                rejection_reason: reason,
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (error) {
            console.error('GovernanceService Error:', error);
            throw new Error(`Failed to reject request: ${error.message}`);
        }

        // TODO: Send notification stub
        console.log(`[Notification] Request ${requestId} rejected by ${reviewerId}. Reason: ${reason}`);
    }

}
