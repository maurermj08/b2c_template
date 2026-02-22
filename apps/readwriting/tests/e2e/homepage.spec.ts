import { test, expect } from "@playwright/test";
import { loginAsUser, cleanupTestUser } from "../helpers/auth-helper";

const TEST_EMAIL = "test-branding@example.com";

test.describe("Homepage / Landing Page", () => {
  test("displays app name in header", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toContainText("ReadWriting");
  });

  test("displays hero heading and description", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("h1")
    ).toContainText("Upload your writing. Get your text.");
    await expect(
      page.locator("text=handwriting into text")
    ).toBeVisible();
  });

  test("displays upload zone with file input", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("text=Drag and drop your file here")
    ).toBeVisible();
    await expect(
      page.locator("text=JPEG, PNG, HEIC, PDF, ZIP")
    ).toBeVisible();
    await expect(page.locator('button:has-text("Choose File")')).toBeVisible();
  });

  test("displays footer with app name", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toContainText("ReadWriting");
    await expect(footer).toContainText("Upload your writing. Get your text.");
  });
});

test.describe("Branding Consistency", () => {
  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL);
  });

  test("login page shows ReadWriting branding", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in to ReadWriting");
    await expect(page.locator("text=No password needed")).toBeVisible();
  });

  test("sidebar shows ReadWriting branding when authenticated", async ({
    page,
  }) => {
    await loginAsUser(page, TEST_EMAIL);
    await page.goto("/dashboard");

    // Desktop sidebar should show the app name
    const sidebar = page.locator("aside");
    await expect(sidebar).toContainText("ReadWriting");
  });
});
