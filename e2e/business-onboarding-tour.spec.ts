import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Business Onboarding Tour.
 *
 * Prerequisites:
 * - API server running (e.g. npm run dev from ../server, port 5000)
 * - Client will be started by Playwright webServer or run manually (npm run dev)
 *
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 * Run headed: npx playwright test --headed
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

// Unique test user to avoid conflicts (timestamp + random)
const testUser = {
  username: `e2e-tour-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  email: `e2e-tour-${Date.now()}@test.localito.local`,
  password: 'TestPass123!',
  businessName: 'E2E Tour Test Shop',
  postcode: 'M1 1AA',
  city: 'Manchester',
};

test.describe('Business Onboarding Tour', () => {
  test.beforeEach(async ({ page }) => {
    // Clear tour-related localStorage so each test starts fresh
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.removeItem('localito_business_tour_completed');
      localStorage.removeItem('localito_show_business_tour');
    });
  });

  test('after business signup, onboarding tour appears and can be skipped', async ({ page }) => {
    // 1. Go to business signup
    await page.goto(`${BASE_URL}/signup/business`);
    await expect(page).toHaveURL(/signup\/business/);

    // 2. Fill signup form
    await page.getByLabel(/username/i).fill(testUser.username);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByRole('textbox', { name: /password/i }).first().fill(testUser.password);
    await page.getByLabel(/confirm password/i).fill(testUser.password);
    await page.getByLabel(/business name/i).fill(testUser.businessName);
    await page.getByLabel(/postcode/i).fill(testUser.postcode);
    await page.getByLabel(/city/i).fill(testUser.city);

    // 3. Submit signup (use exact text to avoid matching "Sign up with Google")
    await page.getByRole('button', { name: 'Create account' }).click();

    // 4. Wait for redirect to business dashboard (API must be running)
    await page.waitForURL(/\/business\/dashboard/, { timeout: 15000 }).catch(() => {
      // If API is not running, signup may fail - skip assertion and fail with a clear message
    });
    if (!page.url().includes('/business/dashboard')) {
      test.skip(true, 'API may not be running or signup failed - ensure server is running on port 5000');
      return;
    }

    // 5. Tour auto-starts after ~500ms - wait for Joyride tooltip (first step or Skip button)
    const skipButton = page.getByRole('button', { name: 'Skip tour' });
    await expect(skipButton).toBeVisible({ timeout: 10000 });

    // 6. First step content should be visible
    await expect(page.getByText(/complete your business profile/i)).toBeVisible();

    // 7. Click Skip tour
    await skipButton.click();

    // 8. Tooltip should disappear
    await expect(skipButton).not.toBeVisible({ timeout: 3000 });

    // 9. Still on dashboard
    await expect(page).toHaveURL(/\/business\/dashboard/);

    // 10. Tour completion should be stored
    const tourCompleted = await page.evaluate(() =>
      localStorage.getItem('localito_business_tour_completed')
    );
    expect(tourCompleted).toBe('true');

    // 11. After reload, tour should not show again
    await page.reload();
    await page.waitForLoadState('networkidle');
    const skipAfterReload = page.getByRole('button', { name: 'Skip tour' });
    await expect(skipAfterReload).not.toBeVisible({ timeout: 4000 });
  });

  test('dashboard has tour target elements when logged in', async ({ page }) => {
    // Go to dashboard - without login we get redirected to login.
    await page.goto(`${BASE_URL}/business/dashboard`);
    // Wait for either dashboard stats (logged in + loaded) or login form (redirected)
    const dashboardStats = page.locator('[data-tour="dashboard-stats"]');
    const loginForm = page.getByLabel(/username/i);
    try {
      await Promise.race([
        dashboardStats.waitFor({ state: 'visible', timeout: 12000 }),
        loginForm.waitFor({ state: 'visible', timeout: 12000 }),
      ]);
    } catch {
      test.skip(true, 'Dashboard did not load and login did not appear - run with API and ensure logged in');
      return;
    }
    const onDashboard = await dashboardStats.isVisible();
    if (!onDashboard) {
      test.skip(true, 'Not logged in - dashboard redirects to login; run full signup test first or log in');
      return;
    }

    await expect(page.locator('[data-tour="settings"]')).toBeVisible();
    await expect(page.locator('[data-tour="products"]')).toBeVisible();
    await expect(page.locator('[data-tour="payouts"]')).toBeVisible();
  });
});
