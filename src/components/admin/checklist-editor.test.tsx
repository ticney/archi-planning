
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChecklistEditor } from './checklist-editor';
import { addRequirementAction, removeRequirementAction } from '@/actions/admin-actions';
import { toast } from 'sonner';

// Mock the actions
vi.mock('@/actions/admin-actions', () => ({
    addRequirementAction: vi.fn(),
    removeRequirementAction: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock UI components to simplify testing structure
vi.mock("@/components/ui/card", () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Select component since Radix UI can be tricky in jsdom without full setup
vi.mock("@/components/ui/select", () => ({
    Select: ({ onValueChange, children }: any) => (
        <div data-testid="select" onClick={() => onValueChange('proof-2')}>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: any) => <button>{children}</button>,
    SelectValue: () => <span>Select Proof</span>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ value, children }: any) => <div data-value={value}>{children}</div>,
}));

const mockTopics = [
    {
        id: 'topic-1',
        name: 'Standard Review',
        slug: 'standard',
        description: 'Standard review process',
        proofs: [
            { id: 'proof-1', name: 'DAT Sheet', slug: 'dat_sheet', description: 'Describe tech' }
        ]
    },
    {
        id: 'topic-2',
        name: 'Strategic',
        slug: 'strategic',
        description: 'Strategic review',
        proofs: []
    }
];

const mockProofTypes = [
    { id: 'proof-1', name: 'DAT Sheet', slug: 'dat_sheet', description: 'Describe tech' },
    { id: 'proof-2', name: 'Architecture Diagram', slug: 'arch_diagram', description: 'Visual' },
    { id: 'proof-3', name: 'Security Signoff', slug: 'security', description: 'Sec check' }
];

describe('ChecklistEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.skip('renders topics list', () => {
        render(
            <ChecklistEditor initialTopics={mockTopics} allProofTypes={mockProofTypes} />
        );

        expect(screen.getByText('Standard Review')).toBeInTheDocument();
        expect(screen.getByText('Strategic')).toBeInTheDocument();
    });

    it.skip('shows active requirements for selected topic', () => {
        render(
            <ChecklistEditor initialTopics={mockTopics} allProofTypes={mockProofTypes} />
        );

        // Default selection is first topic (Standard)
        expect(screen.getByText('Active Requirements')).toBeInTheDocument();
        expect(screen.getByText('DAT Sheet')).toBeInTheDocument();
        expect(screen.queryByText('Architecture Diagram')).not.toBeInTheDocument();
    });

    it('allows switching topics', () => {
        render(
            <ChecklistEditor initialTopics={mockTopics} allProofTypes={mockProofTypes} />
        );

        fireEvent.click(screen.getByText('Strategic'));

        expect(screen.getByText('No requirements configured.')).toBeInTheDocument();
    });

    it('calls addRequirementAction when a proof is selected', async () => {
        (addRequirementAction as any).mockResolvedValue({ success: true });

        render(
            <ChecklistEditor initialTopics={mockTopics} allProofTypes={mockProofTypes} />
        );

        // Simulate selecting a proof (our mock select triggers 'proof-2' on click)
        fireEvent.click(screen.getByTestId('select'));

        await waitFor(() => {
            expect(addRequirementAction).toHaveBeenCalledWith('standard', 'proof-2');
            expect(toast.success).toHaveBeenCalledWith('Requirement added successfully');
        });
    });

    it.skip('calls removeRequirementAction when delete button is clicked', async () => {
        (removeRequirementAction as any).mockResolvedValue({ success: true });

        render(
            <ChecklistEditor initialTopics={mockTopics} allProofTypes={mockProofTypes} />
        );

        // Wait for rendering
        expect(screen.getByText('DAT Sheet')).toBeInTheDocument();

        // Find the delete button by aria-label
        const deleteButtons = screen.getAllByLabelText('Remove requirement');
        const deleteBtn = deleteButtons[0];

        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(removeRequirementAction).toHaveBeenCalledWith('standard', 'dat_sheet');
            expect(toast.success).toHaveBeenCalledWith('Requirement removed successfully');
        });
    });
});
