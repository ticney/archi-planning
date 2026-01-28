
"use client";

import React, { useState } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { addRequirementAction, removeRequirementAction } from "@/actions/admin-actions";

type ProofType = {
    id: string;
    name: string;
    slug: string;
    description: string;
};

type Topic = {
    id: string;
    name: string;
    slug: string;
    description: string;
    proofs: ProofType[];
};

interface ChecklistEditorProps {
    initialTopics: Topic[];
    allProofTypes: ProofType[];
}

export function ChecklistEditor({ initialTopics, allProofTypes }: ChecklistEditorProps) {
    const [topics, setTopics] = useState<Topic[]>(initialTopics);
    const [loading, setLoading] = useState(false);
    const [selectedTopicSlug, setSelectedTopicSlug] = useState<string>(
        initialTopics.length > 0 ? initialTopics[0].slug : ""
    );

    const selectedTopic = topics.find(t => t.slug === selectedTopicSlug);

    const handleAddProof = async (proofSlug: string) => {
        if (!selectedTopic) return;

        setLoading(true);
        try {
            const result = await addRequirementAction(selectedTopic.slug, proofSlug);
            if (result.success) {
                setTopics(prev => prev.map(t => {
                    if (t.slug === selectedTopic.slug) {
                        const proofToAdd = allProofTypes.find(p => p.slug === proofSlug);
                        if (proofToAdd && !t.proofs.find(p => p.slug === proofSlug)) {
                            return { ...t, proofs: [...t.proofs, proofToAdd] };
                        }
                    }
                    return t;
                }));
                toast.success("Requirement added successfully");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to add requirement");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProof = async (proofSlug: string) => {
        if (!selectedTopic) return;

        setLoading(true);
        try {
            const result = await removeRequirementAction(selectedTopic.slug, proofSlug);
            if (result.success) {
                setTopics(prev => prev.map(t => {
                    if (t.slug === selectedTopic.slug) {
                        return { ...t, proofs: t.proofs.filter(p => p.slug !== proofSlug) };
                    }
                    return t;
                }));
                toast.success("Requirement removed successfully");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to remove requirement");
        } finally {
            setLoading(false);
        }
    };

    if (initialTopics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Topics Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    There are no governance topics defined in the system.
                </p>
            </div>
        );
    }

    // Filter out proofs that are already active for the selected topic
    const availableProofs = allProofTypes.filter(
        pt => !selectedTopic?.proofs.some(existing => existing.slug === pt.slug)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Checklist configurations</h2>
                    <p className="text-muted-foreground">Manage ongoing requirements for each governance pathway.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 shrink-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Topics</CardTitle>
                        </CardHeader>
                        <div className="p-2 pt-0 grid gap-1">
                            {topics.map(topic => (
                                <div
                                    key={topic.id}
                                    onClick={() => setSelectedTopicSlug(topic.slug)}
                                    className={`
                                cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors
                                ${selectedTopicSlug === topic.slug
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground"}
                            `}
                                >
                                    {topic.name}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="flex-1">
                    {selectedTopic && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedTopic.name}</CardTitle>
                                <CardDescription>{selectedTopic.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium leading-none">Active Requirements</h4>

                                    {selectedTopic.proofs.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No requirements configured.</p>
                                    ) : (
                                        <div className="grid gap-2">
                                            {selectedTopic.proofs.map(proof => (
                                                <div key={proof.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-sm">{proof.name}</span>
                                                        <span className="text-xs text-muted-foreground">{proof.description}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveProof(proof.slug)}
                                                        disabled={loading}
                                                        className="text-muted-foreground hover:text-destructive"
                                                        aria-label="Remove requirement"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-medium mb-4">Add Requirement</h4>
                                    <div className="flex gap-2">
                                        <Select onValueChange={handleAddProof} disabled={loading || availableProofs.length === 0}>
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue placeholder="Select a proof type to add..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableProofs.map(proof => (
                                                    <SelectItem key={proof.id} value={proof.slug}>
                                                        {proof.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {availableProofs.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">All available proof types are already assigned to this topic.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
