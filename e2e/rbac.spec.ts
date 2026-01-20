import { test, expect } from '@playwright/test';

// Credentials seeded via SQL
const USERS = {
    LEADER: { email: 'leader.e2e@example.com', password: 'password123', redirect: '/dashboard/project' },
    REVIEWER: { email: 'reviewer.e2e@example.com', password: 'password123', redirect: '/dashboard/reviewer' },
    ORGANIZER: { email: 'organizer.e2e@example.com', password: 'password123', redirect: '/dashboard/organizer' },
    ADMIN: { email: 'admin.e2e@example.com', password: 'password123', redirect: '/dashboard/admin' },
};

test.describe.skip('RBAC & Routing', () => {

    test('Unauthenticated user attempting to access dashboard should be redirected to login', async ({ page }) => {
        await page.goto('/dashboard/project');
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('Project Leader should login and redirect to /dashboard/project', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', USERS.LEADER.email);
        await page.fill('input[name="password"]', USERS.LEADER.password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*\/dashboard\/project/);

        // Should NOT be able to access Admin dashboard
        await page.goto('/dashboard/admin');
        // Expect redirect back to project dashboard
        await expect(page).toHaveURL(/.*\/dashboard\/project/);
    });

    test('Reviewer should login and redirect to /dashboard/reviewer', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', USERS.REVIEWER.email);
        await page.fill('input[name="password"]', USERS.REVIEWER.password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*\/dashboard\/reviewer/);

        // Should NOT be able to access Admin dashboard
        await page.goto('/dashboard/admin');
        await expect(page).toHaveURL(/.*\/dashboard\/reviewer/);
    });

    test('Admin should login and redirect to /dashboard/admin', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', USERS.ADMIN.email);
        await page.fill('input[name="password"]', USERS.ADMIN.password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*\/dashboard\/admin/);

        // Can they access other dashboards? Requirement says:
        // "Project Leader... CANNOT access /dashboard/reviewer"
        // Implicitly Admin *might* be able to access others or not. 
        // Middleware logic says: "Redirect to their allowed home" 
        // Implementation: "if (path.startsWith("/dashboard/project") && role !== 'project_leader') ..." -> Wait, check strictness.
    });

    test('Organizer should login and redirect to /dashboard/organizer', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', USERS.ORGANIZER.email);
        await page.fill('input[name="password"]', USERS.ORGANIZER.password);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*\/dashboard\/organizer/);
    });
});
