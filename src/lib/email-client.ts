import { Resend } from 'resend';
import { env } from '@/lib/env';

// env.RESEND_API_KEY is guaranteed to be a string if validation passed (or we are in test mode where we might mock it anyway)
const apiKey = env.RESEND_API_KEY || 're_mock_key_for_test';

export const resend = new Resend(apiKey);
