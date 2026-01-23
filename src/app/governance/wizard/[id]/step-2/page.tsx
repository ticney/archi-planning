import { notFound, redirect } from 'next/navigation';
import { GovernanceService } from '@/services/governance/governance-service';
import { WizardShell } from '@/components/features/governance-wizard/wizard-shell';
import { Step2TopicSelection } from '@/components/features/governance-wizard/step-2-topic-selection';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Step2Page({ params }: PageProps) {
    const { id } = await params;
    const governanceService = new GovernanceService();
    const request = await governanceService.getRequestById(id);

    if (!request) {
        notFound();
    }

    // Ensure we are in the right state? 
    // Story doesn't strictly enforce state machine gates yet, but good to know.

    return (
        <WizardShell>
            <Step2TopicSelection
                requestId={request.id}
                existingTopic={request.topic}
            />
        </WizardShell>
    );
}
