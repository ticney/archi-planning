import { notFound } from 'next/navigation';
import { WizardShell } from '@/components/features/governance-wizard/wizard-shell';
import { Step3Documents } from '@/components/features/governance-wizard/step-3-documents';
import { GovernanceService } from '@/services/governance/governance-service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Step3Page({ params }: PageProps) {
    const { id } = await params;
    const governanceService = new GovernanceService();
    const request = await governanceService.getRequestById(id);

    if (!request) {
        notFound();
    }

    return (
        <WizardShell>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Step 3: Document Upload</h2>
                <Step3Documents request={request} />
            </div>
        </WizardShell>
    );
}
