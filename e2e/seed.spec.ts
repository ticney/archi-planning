
import { test, expect } from '@playwright/test';
const fs = require('fs');
const path = require('path');

const USERS = [
    { email: 'admin.e2e@example.com', password: 'password123' },
    { email: 'reviewer.e2e@example.com', password: 'password123' },
    { email: 'organizer.e2e@example.com', password: 'password123' },
    { email: 'leader.e2e@example.com', password: 'password123' },
];

test('Seed Users', async ({ request }) => {
    // Manual Env Parsing
    const envPath = path.resolve(process.cwd(), '.env.local');
    // Basic parsing
    let content = '';
    try {
        content = fs.readFileSync(envPath, 'utf8');
    } catch (e) { console.error('No .env.local found'); }

    const env: any = {};
    if (content) {
        content.split(/\r?\n/).forEach((line: string) => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/"/g, '');
                env[key] = value;
            }
        });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase Env Vars');
    }

    for (const u of USERS) {
        console.log(`Seeding ${u.email}...`);
        const response = await request.post(`${supabaseUrl}/auth/v1/signup`, {
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
            },
            data: {
                email: u.email,
                password: u.password,
            }
        });

        // 422 usually means already registered (or invalid). 200 is OK.
        console.log(`Result for ${u.email}: ${response.status()}`);
        if (response.status() !== 200) {
            console.log(await response.text());
        }
    }
});
