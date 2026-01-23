'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GovernanceRequest, Attachment } from '@/types/schemas/governance-schema';
import { submitRequestAction } from '@/actions/governance-actions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PROOF_NAME_TO_TYPE } from '@/services/governance/governance-rules';

interface Step4ReviewProps {
    request: GovernanceRequest;
    initialAttachments: Attachment[];
}

export function Step4Review({ request, initialAttachments }: Step4ReviewProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatFileName = (path: string) => path.split('/').pop() || path;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitRequestAction(request.id);
            if (result && !result.success) {
                throw new Error(result.error);
            }
            toast({
                title: "Success",
                description: "Request submitted successfully!",
            });
        } catch (error) {
            setIsSubmitting(false);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error instanceof Error ? error.message : "An error occurred",
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Request Details</h3>
                    </div>
                    <div className="p-6 pt-0 grid gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-muted-foreground">Title</div>
                            <div className="col-span-2 font-semibold">{request.title}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-muted-foreground">Project Code</div>
                            <div className="col-span-2">{request.project_code}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-muted-foreground">Description</div>
                            <div className="col-span-2 text-sm">{request.description || '-'}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-muted-foreground">Topic</div>
                            <div className="col-span-2 capitalize"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{request.topic}</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 pl-6 pt-6 pr-6 pb-2">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">Attached Documents</h3>
                        <p className="text-sm text-muted-foreground">Documents verified for this request.</p>
                    </div>
                    <div className="p-6 pt-0">
                        {initialAttachments.length === 0 ? (
                            <div className="text-muted-foreground text-sm italic">No documents found.</div>
                        ) : (
                            <ul className="space-y-3">
                                {initialAttachments.map(file => {
                                    const proofName = Object.keys(PROOF_NAME_TO_TYPE).find(key => PROOF_NAME_TO_TYPE[key] === file.document_type) || file.document_type;

                                    return (
                                        <li key={file.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <div className="font-medium text-sm">{proofName}</div>
                                                    <div className="text-xs text-muted-foreground">{file.filename}</div>
                                                </div>
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={() => router.push(`/governance/wizard/${request.id}/step-3`)}
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back: Documents
                </Button>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Request
                </Button>
            </div>
        </div>
    );
}
