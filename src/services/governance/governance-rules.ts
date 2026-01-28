import { Attachment } from '../../types/schemas/governance-schema';

// LEGACY CONSTANTS - Kept for backward compatibility during migration
// These should eventually be replaced by DB-driven values via Server Actions

export const PROOF_NAME_TO_TYPE: Record<string, string> = {
    "DAT Sheet": "dat_sheet",
    "Architecture Diagram": "architecture_diagram",
    "Security Sign-off": "security_signoff",
    "FinOps Approval": "finops_approval",
    "Other Document": "other"
};

export const PROOF_TYPE_TO_NAME: Record<string, string> = {
    "dat_sheet": "DAT Sheet",
    "architecture_diagram": "Architecture Diagram",
    "security_signoff": "Security Sign-off",
    "finops_approval": "FinOps Approval",
    "other": "Other Document"
};

export const TOPIC_RULES: Record<string, { proofs: string[]; duration: number }> = {
    standard: {
        proofs: ['DAT Sheet', 'Architecture Diagram'],
        duration: 30
    },
    strategic: {
        proofs: ['DAT Sheet', 'Security Sign-off', 'FinOps Approval'],
        duration: 60
    }
};

export function getMissingProofs(requiredSlugs: string[] | string | null, attachments: Attachment[]): string[] {
    // Handle overload: if string (topic name) is passed, fallback to legacy
    if (typeof requiredSlugs === 'string') {
        const rules = TOPIC_RULES[requiredSlugs];
        if (!rules) return [];
        // Map legacy names to slugs
        const slugs = rules.proofs.map(name => PROOF_NAME_TO_TYPE[name]);
        return getMissingProofs(slugs, attachments);
    }

    if (!requiredSlugs || requiredSlugs.length === 0) return [];

    const uploadedTypes = attachments.map(a => a.document_type as string);

    return (requiredSlugs as string[]).filter(slug => !uploadedTypes.includes(slug));
}
