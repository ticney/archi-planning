import { notFound } from 'next/navigation';
import { WizardShell } from '@/components/features/governance-wizard/wizard-shell';
import { Step4Review } from '@/components/features/governance-wizard/step-4-review';
import { GovernanceService } from '@/services/governance/governance-service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Step4Page({ params }: PageProps) {
    const { id } = await params;
    const governanceService = new GovernanceService();
    const request = await governanceService.getRequestById(id);

    if (!request) {
        notFound();
    }

    const attachments = await governanceService.getAttachments(id);

    return (
        <WizardShell>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Step 4: Review & Submit</h2>
                <Step4Review request={request} initialAttachments={attachments} />
            </div>
        </WizardShell>
    );
}
