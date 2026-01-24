import { test, expect } from "@playwright/test";

test.describe("Reviewer Dashboard", () => {
    test.describe.configure({ mode: 'serial' });

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
        // Check for potential errors
        if (await page.getByText("Error Loading Dashboard").isVisible()) {
            const errorMsg = await page.getByText("Error Loading Dashboard").locator("..").innerText();
            console.log("[E2E] Dashboard Error:", errorMsg);
        }

        // Check body content if fails
        try {
            await expect(page.getByText("Reviewer Cockpit")).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log("[E2E] Reviewer Cockpit not found. Body:", await page.locator("body").innerText());
            throw e;
        }
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
        // Verify project appears in validated list
        // We use a looser text match or wait for it to appear
        await expect(page.locator('[role="tabpanel"][data-state="active"]')).toContainText(firstRowTitle);
    });

    test("Reviewer can reject a pending request", async ({ page }) => {
        // Login as Reviewer
        await page.goto("/login");
        await page.getByLabel("Email address").fill(REVIEWER_EMAIL);
        await page.getByLabel("Password").fill(PASSWORD);
        await page.getByRole("button", { name: "Sign in" }).click();
        await page.waitForURL(/\/dashboard\/reviewer/);

        // Ensure we find at least one pending request
        await expect(page.locator("table tbody tr")).not.toHaveCount(0, { timeout: 10000 });
        const firstRow = page.locator("table tbody tr").first();
        const firstRowTitle = await firstRow.locator("td").first().innerText();
        console.log(`[E2E] Rejecting request: ${firstRowTitle}`);

        // Click Reject
        await firstRow.getByRole("button", { name: "Reject" }).click();

        // Check Modal
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByText("Reject Governance Request")).toBeVisible();

        // Button should be disabled initially (empty reason)
        await expect(page.getByRole("button", { name: "Confirm Rejection" })).toBeDisabled();

        // Fill reason
        const reason = "Missing the required architectural diagram.";
        await page.getByLabel("Rejection Reason").fill(reason);
        await expect(page.getByRole("button", { name: "Confirm Rejection" })).toBeEnabled();

        // Confirm
        await page.getByRole("button", { name: "Confirm Rejection" }).click();

        // Toast success
        await expect(page.getByText("Request rejected successfully")).toBeVisible();

        // Modal closed
        await expect(page.getByRole("dialog")).toBeHidden();

        // Row should disappear from Pending tab
        // Note: depends on sorting/refresh, but checking it's gone from view is reasonable
        // Or wait for count to change?
        // Ideally we check strict absence or reload. 
    });
});
