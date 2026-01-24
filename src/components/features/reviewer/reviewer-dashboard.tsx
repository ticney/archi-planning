'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MaturityGauge } from "@/components/features/governance/maturity-gauge";
import { ReviewerDashboardData, validateGovernanceRequest } from "@/actions/reviewer-actions";
import { RejectionModal } from "./rejection-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { GovernanceRequest } from "@/types/schemas/governance-schema";

function timeAgo(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

interface ReviewerDashboardProps {
    initialData: ReviewerDashboardData;
}

export function ReviewerDashboard({ initialData }: ReviewerDashboardProps) {
    const router = useRouter();
    const supabase = createClient();
    const { pendingRequests, validatedRequests } = initialData;

    useEffect(() => {
        const channel = supabase
            .channel('reviewer-dashboard')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'governance_requests'
                },
                () => {
                    // Refresh for any status change
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router]);

    return (
        <div className="space-y-4">
            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">
                        Pending Reviews
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            {pendingRequests.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="validated">
                        Validated
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            {validatedRequests.length}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <RequestsTable requests={pendingRequests} type="pending" />
                </TabsContent>

                <TabsContent value="validated">
                    <RequestsTable requests={validatedRequests} type="validated" />
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface ExtendedRequest extends GovernanceRequest {
    maturityScore: number;
    projectName: string;
}

function RequestsTable({ requests, type }: { requests: ExtendedRequest[], type: 'pending' | 'validated' }) {
    if (requests.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No {type} requests found.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Maturity Score</TableHead>
                        <TableHead>Submission Date</TableHead>
                        {type === 'pending' && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell className="font-medium">
                                {request.projectName || request.project_code}
                            </TableCell>
                            <TableCell className="capitalize">
                                {request.topic || 'N/A'}
                            </TableCell>
                            <TableCell>
                                <MaturityGauge score={request.maturityScore} />
                            </TableCell>
                            <TableCell>
                                {timeAgo(request.submitted_at)}
                            </TableCell>
                            {type === 'pending' && (
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <RejectionModal requestId={request.id} />
                                        <ValidateButton requestId={request.id} />
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function ValidateButton({ requestId }: { requestId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleValidate = () => {
        startTransition(async () => {
            try {
                const result = await validateGovernanceRequest(requestId);
                if (result.success) {
                    toast.success("Request validated successfully");
                } else {
                    toast.error(result.error || "Failed to validate");
                }
            } catch (e) {
                toast.error("An unexpected error occurred");
            }
        });
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleValidate}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Check className="mr-2 h-4 w-4" />
            )}
            Validate
        </Button>
    );
}
