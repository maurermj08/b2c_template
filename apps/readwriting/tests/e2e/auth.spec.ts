import { test, expect } from "@playwright/test";
import { loginAsUser, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-auth@example.com";

test.describe("Authentication", () => {
  test.afterEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("login page renders and submits to verify page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');

    // Should redirect to verify page with email displayed
    await page.waitForURL("**/verify**", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Check your email");
    await expect(page.locator("text=" + TEST_EMAIL)).toBeVisible();
  });

  test("authenticated user can access dashboard", async ({ page }) => {
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/dashboard");

    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
    await expect(page.locator("h1")).toContainText("Sign in");
  });

  test("logout flow", async ({ page }) => {
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Sign out via sidebar (desktop)
    const signOutButton = page.locator("text=Sign Out").first();
    await signOutButton.click();

    await page.waitForURL("/", { timeout: 10000 });

    // Verify dashboard is inaccessible
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });

  test("invalid token shows auth error", async ({ page }) => {
    await page.goto(
      "/api/auth/callback/email?token=invalid-token&email=test@example.com"
    );
    await page.waitForURL("**/auth-error**", { timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Something went wrong");
  });
});
