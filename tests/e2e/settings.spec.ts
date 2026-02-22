import { test, expect } from "@playwright/test";
import { getMagicLinkForEmail, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-settings@example.com";

test.describe("Settings", () => {
  test.beforeEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test.afterEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("update display name", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/verify**", { timeout: 10000 });
    const magicLink = await getMagicLinkForEmail(TEST_EMAIL);
    await page.goto(magicLink);
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Go to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL("**/settings**");

    // Update name
    await page.fill('input[name="name"]', "Test User");
    await page.click('button:has-text("Save Changes")');

    // Verify success message
    await expect(page.locator("text=Profile updated successfully")).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue("Test User");
  });

  test("delete account with typed confirmation", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/verify**", { timeout: 10000 });
    const magicLink = await getMagicLinkForEmail(TEST_EMAIL);
    await page.goto(magicLink);
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Go to settings
    await page.click('a[href="/settings"]');
    await page.waitForURL("**/settings**");

    // Click delete account button
    await page.click('button:has-text("Delete My Account")');

    // Type wrong confirmation - button should be disabled
    await page.fill('input[id="confirm-delete"]', "WRONG");
    const confirmButton = page.locator('button:has-text("Permanently Delete Account")');
    await expect(confirmButton).toBeDisabled();

    // Type correct confirmation
    await page.fill('input[id="confirm-delete"]', "DELETE");
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Should redirect to home after deletion
    await page.waitForURL("/", { timeout: 15000 });

    // Dashboard should be inaccessible
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });
});
