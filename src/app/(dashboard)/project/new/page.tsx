import { WizardShell } from '@/components/features/governance-wizard/wizard-shell';
import { Step1Initialization } from '@/components/features/governance-wizard/step-1-initialization';

export default function NewProjectPage() {
    return (
        <WizardShell>
            <Step1Initialization />
        </WizardShell>
    );
}
