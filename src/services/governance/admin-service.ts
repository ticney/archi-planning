import { createClient } from '@/lib/supabase/server';

export class GovernanceAdminService {
    async getTopics() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('governance_topics')
            .select('*, governance_topic_proofs(proof_type_id, governance_proof_types(*))')
            .order('name');

        if (error) throw new Error(`Failed to fetch topics: ${error.message}`);
        return data;
    }

    async getProofTypes() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('governance_proof_types')
            .select('*')
            .order('name');

        if (error) throw new Error(`Failed to fetch proof types: ${error.message}`);
        return data;
    }

    async addProofRequirement(topicSlug: string, proofTypeSlug: string) {
        const supabase = await createClient();

        // 1. Get Topic ID
        const { data: topic, error: topicError } = await supabase
            .from('governance_topics')
            .select('id')
            .eq('slug', topicSlug)
            .single();

        if (topicError || !topic) throw new Error(`Topic not found: ${topicSlug}`);

        // 2. Get Proof Type ID
        const { data: proof, error: proofError } = await supabase
            .from('governance_proof_types')
            .select('id')
            .eq('slug', proofTypeSlug)
            .single();

        if (proofError || !proof) throw new Error(`Proof Type not found: ${proofTypeSlug}`);

        // 3. Insert Link
        const { error } = await supabase
            .from('governance_topic_proofs')
            .insert({
                topic_id: topic.id,
                proof_type_id: proof.id
            });

        if (error) throw new Error(`Failed to add requirement: ${error.message}`);
    }

    async removeProofRequirement(topicSlug: string, proofTypeSlug: string) {
        const supabase = await createClient();

        // 1. Get Topic ID
        const { data: topic, error: topicError } = await supabase
            .from('governance_topics')
            .select('id')
            .eq('slug', topicSlug)
            .single();

        if (topicError || !topic) throw new Error(`Topic not found: ${topicSlug}`);

        // 2. Get Proof Type ID
        const { data: proof, error: proofError } = await supabase
            .from('governance_proof_types')
            .select('id')
            .eq('slug', proofTypeSlug)
            .single();

        if (proofError || !proof) throw new Error(`Proof Type not found: ${proofTypeSlug}`);

        const { error } = await supabase
            .from('governance_topic_proofs')
            .delete()
            .eq('topic_id', topic.id)
            .eq('proof_type_id', proof.id);

        if (error) throw new Error(`Failed to remove requirement: ${error.message}`);
    }
}
