import { test, expect } from "@playwright/test";
import { loginAsUser, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-settings@example.com";

test.describe("Settings", () => {
  test.afterEach(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("update display name", async ({ page }) => {
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/settings");
    const main = page.locator("main");
    await expect(main.locator("h1")).toContainText("Settings");

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
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/settings");
    const main = page.locator("main");
    await expect(main.locator("h1")).toContainText("Settings");

    // Click delete account button
    await page.click('button:has-text("Delete My Account")');

    // Type wrong confirmation - button should be disabled
    await page.fill('input[id="confirm-delete"]', "WRONG");
    const confirmButton = page.locator(
      'button:has-text("Permanently Delete Account")'
    );
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
