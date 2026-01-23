import { createClient } from '@/lib/supabase/server';
import { CreateGovernanceRequestInput, GovernanceRequest, GovernanceTopic } from '@/types/schemas/governance-schema';
import { TOPIC_RULES } from './governance-rules';

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
}
