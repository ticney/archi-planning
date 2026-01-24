'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rejectGovernanceRequest } from '@/actions/reviewer-actions';

interface RejectionModalProps {
    requestId: string;
}

export function RejectionModal({ requestId }: RejectionModalProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleReject = () => {
        if (reason.length < 10) {
            toast.error("Rejection reason must be at least 10 characters");
            return;
        }

        startTransition(async () => {
            try {
                const result = await rejectGovernanceRequest(requestId, reason);
                if (result.success) {
                    toast.success("Request rejected successfully");
                    setOpen(false);
                    setReason("");
                } else {
                    toast.error(result.error || "Failed to reject request");
                }
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "An unexpected error occurred");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reject Governance Request</DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejection. The request will be returned to draft status for the Project Leader to address.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Rejection Reason (Required)</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Missing architectural diagram, Security compliance not met..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {reason.length}/10 chars minimum
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isPending || reason.length < 10}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <X className="mr-2 h-4 w-4" />
                        )}
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
