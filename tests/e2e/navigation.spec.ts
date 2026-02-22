import { test, expect } from "@playwright/test";
import { loginAsUser, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-nav@example.com";

test.describe("Navigation", () => {
  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("sidebar navigation works", async ({ page }) => {
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Navigate to Support
    await page.click('a[href="/support"]');
    await page.waitForURL("**/support**");
    await expect(page.locator("h1")).toContainText("Support");

    // Navigate to Settings
    await page.click('a[href="/settings"]');
    await page.waitForURL("**/settings**");
    await expect(page.locator("h1")).toContainText("Settings");

    // Navigate back to Dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL("**/dashboard**");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("landing page CTA works when logged out", async ({ page }) => {
    await page.goto("/");
    const ctaButton = page.locator('a[href="/login"]').first();
    await expect(ctaButton).toBeVisible();
  });
});
