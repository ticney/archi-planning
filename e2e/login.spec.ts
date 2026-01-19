import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
    test("should display login form", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByLabel("Email address")).toBeVisible();
        await expect(page.getByLabel("Password")).toBeVisible();
        await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    });

    // Note: We cannot test actual login without a running Supabase instance and valid user.
    // We can test validation errors.

    test("should show validation errors on empty submit", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: "Sign in" }).click();

        await expect(page.getByText("Invalid email address")).toBeVisible();
        // Password validation message usually "Password is required" or min length
        // Schema says min(1, "Password is required")
        // Wait, let's check input state.
    });

    test("should show validation error on invalid email", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email address").fill("invalid-email");
        await page.getByRole("button", { name: "Sign in" }).click();
        await expect(page.getByText("Invalid email address")).toBeVisible();
    });
});
