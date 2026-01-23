'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateGovernanceRequestTopicSchema, UpdateGovernanceRequestTopicInput, GovernanceTopic } from '@/types/schemas/governance-schema';
import { updateRequestTopicAction } from '@/actions/governance-actions';
// import { useWizardStore } from '@/store/wizard-store'; // Might not need validation in store for this simple step? Logic is minimal.
import { Button } from '@/components/ui/button';
import { ActionResult } from '@/types';
import { GovernanceRequest } from '@/types/schemas/governance-schema';
import { cn } from '@/lib/utils';
import { Check, Shield, Zap } from 'lucide-react'; // Icons
import { TOPIC_RULES } from '@/services/governance/governance-rules';

const initialState: ActionResult<GovernanceRequest> = {
    success: false,
};

interface Step2Props {
    requestId: string;
    existingTopic?: string | null;
}

// UI-specific details merged with Business Rules
const TOPIC_UI: Record<GovernanceTopic, {
    label: string;
    description: string;
    icon: React.ElementType;
}> = {
    standard: {
        label: 'Standard Review',
        description: 'For routine changes and standard architectural patterns.',
        icon: Zap,
    },
    strategic: {
        label: 'Strategic Review',
        description: 'For major initiatives, new platforms, or high-risk changes.',
        icon: Shield,
    }
};

export function Step2TopicSelection({ requestId, existingTopic }: Step2Props) {
    const updateRequestTopicActionWithId = updateRequestTopicAction.bind(null, requestId);
    const [state, formAction, isPending] = useActionState(updateRequestTopicActionWithId, initialState);
    const router = useRouter();

    const {
        setValue,
        watch,
        formState: { errors },
    } = useForm<UpdateGovernanceRequestTopicInput>({
        resolver: zodResolver(updateGovernanceRequestTopicSchema),
        defaultValues: {
            topic: (existingTopic as GovernanceTopic) || undefined,
        },
    });

    const selectedTopic = watch('topic');

    // Sync with router on success
    useEffect(() => {
        if (state.success) {
            router.push(`/governance/wizard/${state.data!.id}/step-3`);
        }
    }, [state, router]);

    return (
        <form action={formAction} className="space-y-8">
            {/* Hidden input for FormData submission */}
            <input type="hidden" name="topic" value={selectedTopic || ''} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Object.entries(TOPIC_UI) as [GovernanceTopic, typeof TOPIC_UI[GovernanceTopic]][]).map(([key, ui]) => {
                    const isSelected = selectedTopic === key;
                    const Icon = ui.icon;
                    const rules = TOPIC_RULES[key];

                    return (
                        <div
                            key={key}
                            className={cn(
                                "relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:border-primary/50",
                                isSelected ? "border-primary bg-primary/5 shadow-md" : "border-muted-foreground/20 bg-card"
                            )}
                            onClick={() => setValue('topic', key, { shouldValidate: true })}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-background rounded-lg border">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                {isSelected && <Check className="w-6 h-6 text-primary" />}
                            </div>

                            <h3 className="font-semibold text-lg mb-2">{ui.label}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{ui.description}</p>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Required Proofs</p>
                                <ul className="space-y-1">
                                    {rules.proofs.map(proof => (
                                        <li key={proof} className="text-sm flex items-center text-foreground">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                                            {proof}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Est. Duration</span>
                                <span className="font-medium bg-secondary px-2 py-1 rounded">{rules.duration} min</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {errors.topic && <p className="text-destructive text-sm text-center">{errors.topic.message}</p>}
            {state.error && <p className="text-destructive text-sm text-center">{state.error}</p>}

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending || !selectedTopic} size="lg">
                    {isPending ? 'Saving...' : 'Next Step'}
                </Button>
            </div>
        </form>
    );
}
