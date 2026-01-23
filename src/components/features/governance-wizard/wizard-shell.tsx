'use client';

import React from 'react';
import { useWizardStore } from '@/store/wizard-store';

export function WizardShell({ children }: { children: React.ReactNode }) {
    const currentStep = useWizardStore((state) => state.currentStep);

    return (
        <div className="max-w-3xl mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">New Governance Request</h1>
                <div className="flex items-center space-x-4 text-sm">
                    <div className={`px-3 py-1 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1. Initiation</div>
                    <div className={`px-3 py-1 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2. Topic</div>
                    <div className={`px-3 py-1 rounded-full ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3. Documents</div>
                    <div className={`px-3 py-1 rounded-full ${currentStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>4. Review</div>
                </div>
            </div>
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                {children}
            </div>
        </div>
    );
}
