import { test, expect } from "@playwright/test";
import { getMagicLinkForEmail, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-auth@example.com";

test.describe("Authentication", () => {
  test.beforeEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("passwordless login flow", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/verify**", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Check your email");
    await expect(page.locator("text=" + TEST_EMAIL)).toBeVisible();

    const magicLink = await getMagicLinkForEmail(TEST_EMAIL);
    await page.goto(magicLink);

    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("unauthenticated redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
    await expect(page.locator("h1")).toContainText("Sign in");
  });

  test("logout flow", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/verify**", { timeout: 10000 });

    const magicLink = await getMagicLinkForEmail(TEST_EMAIL);
    await page.goto(magicLink);
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Sign out via sidebar (desktop)
    const signOutButton = page.locator('text=Sign Out').first();
    await signOutButton.click();

    await page.waitForURL("/", { timeout: 10000 });

    // Verify dashboard is inaccessible
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });

  test("invalid token shows auth error", async ({ page }) => {
    await page.goto("/api/auth/callback/email?token=invalid-token&email=test@example.com");
    await page.waitForURL("**/auth-error**", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Something went wrong");
  });
});
