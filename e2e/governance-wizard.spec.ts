import { test, expect } from "@playwright/test";
import { Buffer } from 'buffer';

test.describe("Governance Wizard", () => {
    const uniqueId = Date.now().toString();
    const userEmail = `leader.e2e.${uniqueId}@example.com`;
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
        try {
            await expect(page).toHaveURL(/\/dashboard\/project/, { timeout: 10000 });
        } catch (e) {
            console.log("LOGIN FAILURE - Current URL:", page.url());
            // Check for error messages
            const errorText = await page.getByText(/Invalid login|Error|Failed/).allInnerTexts();
            console.log("Visible Error Text:", errorText);
            throw e;
        }
    });

    test("Project Leader can initialize a governance request", async ({ page }) => {
        await page.goto("/dashboard/project/new");

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
        const datSheetContent = 'dummy content for dat sheet';
        const datSheetBuffer = Buffer.from(datSheetContent);
        const fileInputs = page.locator('input[type="file"]');
        await expect(fileInputs).toHaveCount(2);

        // Upload DAT Sheet (First input)
        const datSheetInput = fileInputs.nth(0);

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

        const archDiagramInput = fileInputs.nth(1);

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

        // Step 4: Review
        await expect(page).toHaveURL(/\/governance\/wizard\/.*\/step-4/);

        await expect(page.getByText("Request Details")).toBeVisible();
        await expect(page.getByText("Attached Documents")).toBeVisible();
        await expect(page.getByText("dat-sheet.pdf")).toBeVisible();
        await expect(page.getByText("arch-diagram.png")).toBeVisible();

        // Submit
        const submitButton = page.getByRole("button", { name: "Submit Request" });
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // Debugging: Check for failure toast
        try {
            await expect(page).toHaveURL(/\/dashboard\/project\/.*/, { timeout: 5000 });
        } catch (e) {
            console.log("Redirection failed. Checking for error toast...");
            const toast = page.locator('[role="status"]'); // Default role for shadcn/ui toast usually? Or region?
            // Actually shadcn toast title/desc usually text.
            const errorTitle = page.getByText("Submission Failed");
            if (await errorTitle.count() > 0) {
                console.log("Found Failure Toast!");
                const body = await page.locator("body").innerText();
                console.log("Page Body Text (partial):", body.substring(0, 1000));
            }
            throw e;
        }

        // Verify Toast (Optional, but good practice)
        // await expect(page.getByText("Request submitted successfully")).toBeVisible();
    });
});
