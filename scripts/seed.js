
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    const key = parts[0];
    const value = parts.slice(1).join('='); // Handle = in value
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'admin.e2e@archiboard.test', password: 'password123', role: 'admin' },
    { email: 'reviewer.e2e@archiboard.test', password: 'password123', role: 'reviewer' },
    { email: 'organizer.e2e@archiboard.test', password: 'password123', role: 'organizer' },
    { email: 'leader.e2e@archiboard.test', password: 'password123', role: 'project_leader' },
];

async function main() {
    for (const u of users) {
        console.log(`Processing user ${u.email}...`);

        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (error) {
            console.log(`Error for ${u.email}: ${error.message}`);
        } else {
            console.log(`User ${u.email} created/found. ID: ${data.user ? data.user.id : 'null'}`);
        }
    }
}

main();
