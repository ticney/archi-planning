import { create } from 'zustand';
import { CreateGovernanceRequestInput } from '@/types/schemas/governance-schema';

interface WizardState {
    currentStep: number;
    formData: Partial<CreateGovernanceRequestInput>;
    setFormData: (data: Partial<CreateGovernanceRequestInput>) => void;
    setStep: (step: number) => void;
    reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
    currentStep: 1,
    formData: {},
    setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
    setStep: (step) => set({ currentStep: step }),
    reset: () => set({ currentStep: 1, formData: {} }),
}));
