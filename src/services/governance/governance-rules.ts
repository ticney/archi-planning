import { GovernanceTopic } from '../../types/schemas/governance-schema';

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
