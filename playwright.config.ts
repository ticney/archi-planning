import { defineConfig, devices } from "@playwright/test";
import path from "path";
import fs from "fs";

// Load .env.local
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
            const value = values.join("=").trim().replace(/^["']|["']$/g, "");
            process.env[key.trim()] = value;
        }
    });
} catch (e) {
    console.warn("Could not load .env.local");
}

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
