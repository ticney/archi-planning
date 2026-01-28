"use client";

import React, { useEffect, useState } from 'react';
import { getChecklistConfig, addRequirementAction, removeRequirementAction } from '@/actions/admin-actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type ProofType = {
    id: string;
    slug: string;
    name: string;
};

type Topic = {
    id: string;
    slug: string;
    name: string;
    governance_topic_proofs: {
        proof_type_id: string;
        governance_proof_types: ProofType;
    }[];
};

export default function ChecklistEditor() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [proofTypes, setProofTypes] = useState<ProofType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = async () => {
        setLoading(true);
        console.log('Fetching config...');
        try {
            const res = await getChecklistConfig();
            console.log('Config Res:', res);
            if (res.success && res.data) {
                setTopics(res.data.topics);
                setProofTypes(res.data.proofTypes);
            } else {
                setError(res.error || "Failed to load config");
            }
        } catch (e) {
            console.error(e);
            setError("Exception fetching config");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleAdd = async (topicSlug: string, proofSlug: string) => {
        if (!proofSlug) return;
        const res = await addRequirementAction(topicSlug, proofSlug);
        if (res.success) {
            fetchConfig();
        } else {
            alert(res.error);
        }
    };

    const handleRemove = async (topicSlug: string, proofSlug: string) => {
        if (!confirm("Are you sure you want to remove this requirement?")) return;
        const res = await removeRequirementAction(topicSlug, proofSlug);
        if (res.success) {
            fetchConfig();
        } else {
            alert(res.error);
        }
    };

    if (loading) return <div>Loading checklists...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            {topics.map(topic => (
                <Card key={topic.id}>
                    <CardHeader>
                        <CardTitle>{topic.name} ({topic.slug})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2">Required Proofs:</h4>
                        <div className="space-y-2 mb-4">
                            {topic.governance_topic_proofs?.map(link => {
                                const proof = link.governance_proof_types;
                                return (
                                    <div key={proof.id} className="flex items-center justify-between p-2 border rounded bg-slate-50">
                                        <span>{proof.name}</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemove(topic.slug, proof.slug)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                );
                            })}
                            {(!topic.governance_topic_proofs || topic.governance_topic_proofs.length === 0) && (
                                <div className="text-slate-500 italic">No requirements set</div>
                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            <select
                                className="border rounded p-2 h-10 w-[200px]"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAdd(topic.slug, e.target.value);
                                        e.target.value = ""; // Reset
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Add Requirement...</option>
                                {proofTypes.map(pt => (
                                    <option key={pt.id} value={pt.slug}>
                                        {pt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
