'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GovernanceRequest, Attachment, AttachmentType } from '@/types/schemas/governance-schema';
import { TOPIC_RULES, getMissingProofs, PROOF_NAME_TO_TYPE } from '@/services/governance/governance-rules';
import { FileUploader } from './file-uploader';
import { getAttachmentsAction, deleteAttachmentAction } from '@/actions/governance-actions';
import { toast } from '@/hooks/use-toast';

interface Step3DocumentsProps {
    request: GovernanceRequest;
}

export function Step3Documents({ request }: Step3DocumentsProps) {
    const router = useRouter();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    const topic = request.topic as keyof typeof TOPIC_RULES;
    // getMissingProofs now handles topic being potentially raw string from DB if cast properly
    const missingProofs = getMissingProofs(topic, attachments);
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

    // If topic is not set or valid, we shouldn't be here really
    if (!topic || !TOPIC_RULES[topic as keyof typeof TOPIC_RULES]) {
        return <div className="p-4 text-red-500">Invalid topic configuration. Please return to Step 2.</div>;
    }

    const { proofs } = TOPIC_RULES[topic as keyof typeof TOPIC_RULES];

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Mandatory Documents ({proofs.length})</h3>
                <p className="text-sm text-muted-foreground">
                    Please upload the following documents required for a <strong>{topic}</strong> review.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {proofs.map((proofName) => {
                        const docType = PROOF_NAME_TO_TYPE[proofName] as AttachmentType;
                        if (!docType) return null;

                        const existingFile = attachments.find(a => a.document_type === docType);

                        return (
                            <FileUploader
                                key={proofName}
                                requestId={request.id}
                                documentType={docType}
                                label={proofName}
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

// Helper for cn (usually in lib/utils but repeated for safety if not importing)
import { cn } from '@/lib/utils';
