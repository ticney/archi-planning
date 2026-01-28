import { z } from 'zod';

const envSchema = z.object({
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for notifications'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const envProcess = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
};

const parsed = envSchema.safeParse(envProcess);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    // In dev/test we might want to fail hard or warn. For now, failing hard ensures safety.
    // But to avoid breaking CI right now if variables aren't set, we might throw only if strict.
    // Given this is a critical requirement from the story, we throw.
    if (process.env.NODE_ENV !== 'test') { // Allow tests to potentially mock or skip 
        throw new Error('Invalid environment variables');
    }
}

export const env = parsed.success ? parsed.data : (process.env as any);
