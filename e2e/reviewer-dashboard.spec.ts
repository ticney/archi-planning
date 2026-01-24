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

    test("Reviewer can validate a pending request", async ({ page }) => {
        // Login as Reviewer
        await page.goto("/login");
        await page.getByLabel("Email address").fill(REVIEWER_EMAIL);
        await page.getByLabel("Password").fill(PASSWORD);
        await page.getByRole("button", { name: "Sign in" }).click();

        await page.waitForURL(/\/dashboard\/reviewer/);

        // Ensure we are on Pending tab
        await expect(page.getByRole("tab", { name: "Pending Reviews" })).toHaveAttribute("data-state", "active");

        // If there are pending requests, try to validate one
        // Note: This assumes seed data exists. If "No pending requests found" is shown, this test might skip logic.
        // Ideally we should seed data specifically for this test.
        // For now, checks if table exists.
        // Ensure we find at least one pending request to validate
        // In a real scenario, we should ideally seed this.
        await expect(page.locator("table tbody tr")).not.toHaveCount(0, { timeout: 10000 });

        const pendingRows = page.locator("table tbody tr");
        const firstRowTitle = await pendingRows.first().locator("td").first().innerText();
        console.log(`[E2E] Validating request: ${firstRowTitle}`);

        // Click Validate button
        await pendingRows.first().getByRole("button", { name: "Validate" }).click();

        // Should see success toast
        await expect(page.getByText("Request validated successfully")).toBeVisible();

        // Switch to Validated tab
        // Note: We might need to wait for the list to refresh or use specific locator if optimistic update is not instant
        await page.getByRole("tab", { name: "Validated" }).click();

        // Verify project appears in validated list
        // We use a looser text match or wait for it to appear
        await expect(page.locator('[role="tabpanel"][data-state="active"]')).toContainText(firstRowTitle);
    });
});
