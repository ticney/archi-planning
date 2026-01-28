import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChecklistEditor from './checklist-editor';
import * as actions from '@/actions/admin-actions';

// Mock actions
vi.mock('@/actions/admin-actions', () => ({
    getChecklistConfig: vi.fn(),
    addRequirementAction: vi.fn(),
    removeRequirementAction: vi.fn()
}));

const mockTopics = [
    {
        id: 't1',
        slug: 'standard',
        name: 'Standard',
        governance_topic_proofs: [
            {
                proof_type_id: 'p1',
                governance_proof_types: { id: 'p1', slug: 'dat', name: 'DAT Sheet' }
            }
        ]
    }
];
const mockProofTypes = [
    { id: 'p1', slug: 'dat', name: 'DAT Sheet' },
    { id: 'p2', slug: 'arch', name: 'Arch Diagram' }
];

describe('ChecklistEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        actions.getChecklistConfig.mockResolvedValue({
            success: true,
            data: { topics: mockTopics, proofTypes: mockProofTypes }
        });
    });

    it('should render topics and proof types', async () => {
        render(<ChecklistEditor />);
        // screen.debug();

        await waitFor(() => {
            // Using regex to match flexible space/case
            expect(screen.getByText(/Standard/i)).toBeDefined();
            expect(screen.getByText(/DAT Sheet/i)).toBeDefined();
        });
    });
});
