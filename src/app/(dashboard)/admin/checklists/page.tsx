
import React from 'react';
import { getChecklistConfig } from "@/actions/admin-actions";
import { ChecklistEditor } from "@/components/admin/checklist-editor";
import { AlertCircle } from 'lucide-react';

export default async function ChecklistsPage() {
    const { data: config, error } = await getChecklistConfig();

    if (error || !config) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold">Failed to load configuration</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                    {error || "An unexpected error occurred while loading governance topics."}
                </p>
            </div>
        );
    }

    return (
        <ChecklistEditor
            initialTopics={config.topics}
            allProofTypes={config.proofTypes}
        />
    );
}
