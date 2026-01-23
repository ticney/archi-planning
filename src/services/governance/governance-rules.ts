import { GovernanceTopic, Attachment } from '../../types/schemas/governance-schema';
import { GovernanceRequest } from '../../types/schemas/governance-schema';

export const TOPIC_RULES: Record<GovernanceTopic, { duration: number; proofs: string[] }> = {
    standard: {
        duration: 30,
        proofs: ['DAT Sheet', 'Architecture Diagram'],
    },
    strategic: {
        duration: 60,
        proofs: ['DAT Sheet', 'Security Sign-off', 'FinOps Approval'],
    },
};

// Shared mapping between UI names and database Enum types
export const PROOF_NAME_TO_TYPE: Record<string, string> = {
    'DAT Sheet': 'dat_sheet',
    'Architecture Diagram': 'architecture_diagram',
    'Security Sign-off': 'security_signoff',
    'FinOps Approval': 'finops_approval',
};

export function getMissingProofs(topic: GovernanceTopic | null, attachments: Attachment[]): string[] {
    if (!topic || !TOPIC_RULES[topic]) return [];

    const required = TOPIC_RULES[topic].proofs;
    const uploadedTypes = attachments.map(a => a.document_type as string);

    return required.filter(proofName => {
        const requiredType = PROOF_NAME_TO_TYPE[proofName];
        if (!requiredType) return false;

        return !uploadedTypes.includes(requiredType);
    });
}
