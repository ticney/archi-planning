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

        await page.getByRole("button", { name: "Next", exact: true }).click();

        // Step 2: Topic Selection
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-2/);

        // Check Default UI
        await expect(page.getByText("Standard Review")).toBeVisible();
        await expect(page.getByText("Strategic Review")).toBeVisible();

        // Select Standard
        await page.getByText("Standard Review").click();
        await expect(page.getByText("DAT Sheet").first()).toBeVisible();
        await expect(page.getByText("Architecture Diagram").first()).toBeVisible();
        // await expect(page.getByText("Security Sign-off")).not.toBeVisible(); // Should not be visible for standard

        // Select Strategic (to test switch)
        await page.getByText("Strategic Review").click();
        await expect(page.getByText("Security Sign-off")).toBeVisible();

        // Go back to Standard and Submit
        await page.getByText("Standard Review").click();
        await page.getByRole("button", { name: "Next Step" }).click();

        // Step 3: Mandatory Document Upload
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-3/);

        // Verify "The Guardrail" - Next button should be disabled initially
        const nextButton = page.getByRole("button", { name: "Next: Review" });
        await expect(nextButton).toBeDisabled();

        // Check for missing document warning
        await expect(page.getByText("Missing 2 document(s)")).toBeVisible();

        // 1. Upload DAT Sheet
        const fileInputs = page.locator('input[type="file"]');
        await expect(fileInputs).toHaveCount(2);

        // Upload DAT Sheet (First input)
        // Find the input relative to the label "DAT Sheet"
        const datSheetInput = page.locator('div').filter({ hasText: /^DAT Sheet$/ }).locator('input[type="file"]');

        await datSheetInput.setInputFiles({
            name: 'dat-sheet.pdf',
            mimeType: 'application/pdf',
            buffer: datSheetBuffer,
        });

        // Wait for upload to complete (Check checkmark appearing)
        await expect(page.getByText("dat-sheet.pdf")).toBeVisible({ timeout: 10000 });

        // Next button still disabled (1 missing)
        await expect(nextButton).toBeDisabled();
        await expect(page.getByText("Missing 1 document(s)")).toBeVisible();

        // 2. Upload Architecture Diagram
        const archDiagramContent = 'dummy content for arch diagram';
        const archDiagramBuffer = Buffer.from(archDiagramContent);

        const archDiagramInput = page.locator('div').filter({ hasText: /^Architecture Diagram$/ }).locator('input[type="file"]');

        await archDiagramInput.setInputFiles({
            name: 'arch-diagram.png',
            mimeType: 'image/png',
            buffer: archDiagramBuffer,
        });

        // Wait for upload
        await expect(page.getByText("arch-diagram.png")).toBeVisible({ timeout: 10000 });

        // Next button should be enabled now
        await expect(nextButton).toBeEnabled();
        await expect(page.getByText("Missing")).not.toBeVisible();

        // Proceed
        await nextButton.click();

        // Step 4 (Placeholder)
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-4/);
    });
});
