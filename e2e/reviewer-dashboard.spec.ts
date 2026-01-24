import { test, expect } from "@playwright/test";

test.describe("Reviewer Dashboard", () => {
    // These should match what's in seed.spec.ts
    const REVIEWER_EMAIL = 'reviewer.e2e@example.com';
    const PASSWORD = 'password123';
    // User with different role
    const LEADER_EMAIL = 'leader.e2e@example.com';

    test("Reviewer can access the dashboard", async ({ page }) => {
        // Login as Reviewer
        await page.goto("/login");
        await page.getByLabel("Email address").fill(REVIEWER_EMAIL);
        await page.getByLabel("Password").fill(PASSWORD);
        await page.getByRole("button", { name: "Sign in" }).click();

        // Check redirection
        await page.waitForURL(/\/dashboard/);
        const url = page.url();
        console.log(`[E2E] Login landed on: ${url}`);

        if (!url.includes("/dashboard/reviewer")) {
            console.log("[E2E] Manual navigation to /dashboard/reviewer");
            await page.goto("/dashboard/reviewer");
        }

        // Debug: Print body content
        const bodyText = await page.locator("body").innerText();
        console.log("[E2E] Page Body:", bodyText);

        await expect(page).toHaveURL(/\/dashboard\/reviewer/);

        // Verify Page Content
        await expect(page.getByText("Reviewer Cockpit")).toBeVisible();
        await expect(page.getByText("Pending Reviews")).toBeVisible(); // Check logic for this text/summary
    });

    test("Non-Reviewer cannot access dashboard", async ({ page }) => {
        // Login as Leader
        await page.goto("/login");
        await page.getByLabel("Email address").fill(LEADER_EMAIL);
        await page.getByLabel("Password").fill(PASSWORD);
        await page.getByRole("button", { name: "Sign in" }).click();

        await expect(page).toHaveURL(/\/dashboard\/project/);

        // Try accessing Reviewer Dashboard
        await page.goto("/dashboard/reviewer");

        // Middleware redirects to /dashboard/project
        await expect(page).toHaveURL(/.*\/dashboard\/project/);
    });

    // Optional: add a pending request and verify it shows up.
    // For now, checking access is the critical path for this story.
});
