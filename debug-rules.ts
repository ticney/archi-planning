import { getMissingProofs } from './src/services/governance/governance-rules';

const required = ['dat_sheet', 'architecture_diagram'];
const attachments = [
    { document_type: 'dat_sheet' } as any,
    { document_type: 'architecture_diagram' } as any
];

const missing = getMissingProofs(required, attachments);
console.log('Missing:', missing);
console.log('Expected: []');
console.log('Is Correct:', missing.length === 0);

const required2 = ['dat_sheet', 'architecture_diagram'];
const attachments2 = [
    { document_type: 'dat_sheet' } as any
];
const missing2 = getMissingProofs(required2, attachments2);
console.log('Missing2:', missing2);
console.log('Expected: ["architecture_diagram"]');
console.log('Is Correct:', missing2.length === 1 && missing2[0] === 'architecture_diagram');
