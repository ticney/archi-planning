import { test, expect } from "@playwright/test";

test.describe("Governance Wizard", () => {
    const userEmail = "leader.e2e@example.com";
    const userPassword = "password123";

    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email address").fill(userEmail);
        await page.getByLabel("Password").fill(userPassword);
        await page.getByRole("button", { name: "Sign in" }).click();
        await expect(page).toHaveURL("/dashboard");
    });

    test("Project Leader can initialize a governance request", async ({ page }) => {
        await page.goto("/project/new");

        await page.getByLabel("Project Title").fill("E2E Test Project");
        await page.getByLabel("Project Code").fill("E2E-001");
        await page.getByLabel("Description").fill("Automated test project");

        await page.getByRole("button", { name: "Next" }).click();

        await expect(page).toHaveURL("/dashboard/project");
    });
});
