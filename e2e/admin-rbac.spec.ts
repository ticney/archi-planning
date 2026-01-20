import { test, expect } from "@playwright/test";


test.describe("Admin RBAC", () => {
    // We assume seed data exists or we seed it here
    // For now, we'll try to login as seeded users

    test("Admin can access user management", async ({ page }) => {

        await page.goto("/login");
        await page.getByLabel("Email address").fill("admin.e2e@example.com");
        await page.getByLabel("Password").fill("password123");
        await page.getByRole("button", { name: "Sign in" }).click();

        // Should be redirected to dashboard
        try {
            await expect(page).toHaveURL(/\/dashboard/);
        } catch (e) {
            console.log("URL check failed. URL:", page.url());
            console.log("Body text:", await page.locator("body").innerText());
            throw e;
        }

        // Navigate to users page
        await page.goto("/dashboard/admin/users");
        await expect(page).toHaveURL("/dashboard/admin/users");

        // Check for table
        try {
            await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log("Page content on failure:", await page.content());
            throw e;
        }
        await expect(page.getByRole("table")).toBeVisible();
    });

    test("Non-admin cannot access user management", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email address").fill("leader.e2e@example.com");
        await page.getByLabel("Password").fill("password123");
        await page.getByRole("button", { name: "Sign in" }).click();

        // Navigate to users page
        await page.goto("/dashboard/admin/users");

        // Expect redirect to login or dashboard, NOT 404 but restricted
        // Our page logic redirects to /login on unauthorized action error, 
        // OR middleware might block it.
        // If middleware is not set up, the page component returns error or redirects.
        // Let's assume implementation redirects to login or shows error.

        // Currently page code: redirect("/login") if unauthorized
        await expect(page).toHaveURL(/\/login/);
    });

    // Note: To truly test "Role Update", we need to ensure the admin user is seeded with correct role.
    // Ensure "seed.spec.ts" was run previously.
});
