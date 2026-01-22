'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGovernanceRequestSchema, CreateGovernanceRequestInput } from '@/types/schemas/governance-schema';
import { createRequestAction } from '@/actions/governance-actions';
import { useWizardStore } from '@/store/wizard-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ActionResult } from '@/types';
import { GovernanceRequest } from '@/types/schemas/governance-schema';

const initialState: ActionResult<GovernanceRequest> = {
    success: false,
};

export function Step1Initialization() {
    const { formData, setFormData } = useWizardStore();
    const [state, formAction, isPending] = useActionState(createRequestAction, initialState);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateGovernanceRequestInput>({
        resolver: zodResolver(createGovernanceRequestSchema),
        defaultValues: {
            title: formData.title || '',
            project_code: formData.project_code || '',
            description: formData.description || '',
        },
    });

    useEffect(() => {
        console.log('Wizard State Update:', state);
        // Redirect is now handled by Server Action
    }, [state]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                    id="title"
                    placeholder="e.g. NextGen Platform"
                    {...register('title')}
                    defaultValue={formData.title}
                />
                {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_code">Project Code</Label>
                <Input
                    id="project_code"
                    placeholder="e.g. PROJ-XYZ"
                    {...register('project_code')}
                    defaultValue={formData.project_code}
                />
                {errors.project_code && <p className="text-destructive text-sm">{errors.project_code.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Optional description..."
                    {...register('description')}
                    defaultValue={formData.description || ''}
                />
                {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
            </div>

            {state.error && <p className="text-destructive text-sm">{state.error}</p>}
            {state.success && <p className="text-green-600 text-sm">Draft Created!</p>}

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Next'}
                </Button>
            </div>
        </form>
    );
}
