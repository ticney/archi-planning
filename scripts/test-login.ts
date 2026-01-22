
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

async function main() {
    // Read env
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const env: Record<string, string> = {};
    envContent.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
        }
    });

    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error("Missing env vars");
        return;
    }

    const supabase = createClient(url, key);

    console.log("Attempting login for admin.e2e@example.com...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin.e2e@example.com",
        password: "password123",
    });

    if (error) {
        console.error("Login failed:", error.message);
        return;
    }

    console.log("Login successful. User ID:", data.user.id);
    console.log("Session Access Token:", data.session?.access_token ? "Present" : "Missing");

    console.log("Fetching profile...");
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

    if (profileError) {
        console.error("Fetch profile failed:", profileError);
    } else {
        console.log("Profile role:", profile?.role);
    }
}

main();
