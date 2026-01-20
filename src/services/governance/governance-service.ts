import { createClient } from '@/lib/supabase/server';
import { CreateGovernanceRequestInput, GovernanceRequest } from '@/types/schemas/governance-schema';

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
}
