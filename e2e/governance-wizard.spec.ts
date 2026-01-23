import { test, expect } from "@playwright/test";

test.describe("Governance Wizard", () => {
    const userEmail = "leader.e2e@example.com";
    const userPassword = "password123";

    test.beforeEach(async ({ page, request }) => {
        // Seed User
        const response = await request.post(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Content-Type': 'application/json',
            },
            data: {
                email: userEmail,
                password: userPassword,
            }
        });

        // Login Flow
        await page.goto("/login");
        await page.getByLabel("Email address").fill(userEmail);
        await page.getByLabel("Password").fill(userPassword);
        await page.getByRole("button", { name: "Sign in" }).click();
        await expect(page).toHaveURL(/\/dashboard\/project/);
    });

    test("Project Leader can initialize a governance request", async ({ page }) => {
        await page.goto("/project/new");

        await page.getByLabel("Project Title").fill("E2E Test Project");
        await page.getByLabel("Project Code").fill("E2E-001");
        await page.getByLabel("Description").fill("Automated test project");

        await page.getByRole("button", { name: "Next" }).click();

        // Step 2: Topic Selection
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-2/);

        // Check Default UI
        await expect(page.getByText("Standard Review")).toBeVisible();
        await expect(page.getByText("Strategic Review")).toBeVisible();

        // Select Standard
        await page.getByText("Standard Review").click();
        await expect(page.getByText("DAT Sheet")).toBeVisible();
        await expect(page.getByText("Architecture Diagram")).toBeVisible();
        await expect(page.getByText("Security Sign-off")).not.toBeVisible(); // Should not be visible for standard

        // Select Strategic (to test switch)
        await page.getByText("Strategic Review").click();
        await expect(page.getByText("Security Sign-off")).toBeVisible();

        // Go back to Standard and Submit
        await page.getByText("Standard Review").click();
        await page.getByRole("button", { name: "Next Step" }).click();

        // Step 3 (Placeholder for now)
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-3/);
    });
});
