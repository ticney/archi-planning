'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GovernanceRequest, Attachment, AttachmentType } from '@/types/schemas/governance-schema';
import { getMissingProofs } from '@/services/governance/governance-rules';
import { FileUploader } from './file-uploader';
import { getAttachmentsAction, deleteAttachmentAction } from '@/actions/governance-actions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Display labels for proof types
const PROOF_LABELS: Record<string, string> = {
    dat_sheet: "DAT Sheet",
    architecture_diagram: "Architecture Diagram",
    security_signoff: "Security Sign-off",
    finops_approval: "FinOps Approval",
    other: "Other Document"
};

// Legacy fallback for requests created before dynamic rules
const LEGACY_TOPIC_RULES: Record<string, string[]> = {
    standard: ['dat_sheet', 'architecture_diagram'],
    strategic: ['dat_sheet', 'security_signoff', 'finops_approval']
};

interface Step3DocumentsProps {
    request: GovernanceRequest;
}

export function Step3Documents({ request }: Step3DocumentsProps) {
    const router = useRouter();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    const topic = request.topic as string;

    // Determine required proofs: use snapshot if available, else legacy fallback
    let requiredProofs: string[] = [];
    if (request.requirements_snapshot && Array.isArray(request.requirements_snapshot)) {
        requiredProofs = request.requirements_snapshot as string[];
    } else if (topic && LEGACY_TOPIC_RULES[topic]) {
        requiredProofs = LEGACY_TOPIC_RULES[topic];
    }

    // Calculate details
    const missingProofs = getMissingProofs(requiredProofs, attachments);
    const isValid = missingProofs.length === 0;

    const fetchAttachments = useCallback(async () => {
        const result = await getAttachmentsAction(request.id);
        if (result.success && result.data) {
            setAttachments(result.data);
        }
        setIsLoading(false);
    }, [request.id]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    const handleUploadComplete = () => {
        toast({
            title: "Document Uploaded",
            description: "Your document has been successfully saved.",
        });
        fetchAttachments();
    };

    const handleDelete = async (attachmentId: string) => {
        try {
            const result = await deleteAttachmentAction(attachmentId, request.id);
            if (result.success) {
                toast({
                    title: "Document Removed",
                    description: "Attachment deleted successfully.",
                });
                fetchAttachments();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete",
            });
        }
    };

    if (requiredProofs.length === 0) {
        return <div className="p-4 text-amber-600">No document requirements found for this topic.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Mandatory Documents ({requiredProofs.length})</h3>
                <p className="text-sm text-muted-foreground">
                    Please upload the following documents required for a <strong>{topic}</strong> review.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requiredProofs.map((slug) => {
                        const docType = slug as AttachmentType;
                        const label = PROOF_LABELS[slug] || slug; // Fallback to slug if no label

                        const existingFile = attachments.find(a => a.document_type === docType);

                        return (
                            <FileUploader
                                key={slug}
                                requestId={request.id}
                                documentType={docType}
                                label={label}
                                onUploadComplete={handleUploadComplete}
                                existingFile={existingFile ? {
                                    filename: existingFile.filename,
                                    uploadedAt: existingFile.uploaded_at
                                } : undefined}
                                onDelete={existingFile ? () => handleDelete(existingFile.id) : undefined}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="border-t pt-6 flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={() => router.push(`/governance/wizard/${request.id}/step-2`)}
                    disabled={isNavigating}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back: Topic Selection
                </Button>

                <div className="flex items-center space-x-4">
                    {!isValid && (
                        <div className="flex items-center text-amber-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span>Missing {missingProofs.length} document(s)</span>
                        </div>
                    )}
                    <Button
                        onClick={() => {
                            setIsNavigating(true);
                            router.push(`/governance/wizard/${request.id}/step-4`); // Next step (future)
                        }}
                        disabled={!isValid || isNavigating}
                        className={cn(isValid ? "bg-green-600 hover:bg-green-700" : "")}
                    >
                        {isNavigating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Next: Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
