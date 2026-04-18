import { test, expect } from "@playwright/test";

test("user sees an error when signup passwords do not match", async ({ page }) => {
  await page.goto("/signup");

  await expect(
    page.getByRole("heading", { name: /sign up for a new account/i })
  ).toBeVisible();

  await page.getByPlaceholder("Username").fill("sammy");
  await page.getByPlaceholder("Email address").fill("sammy@example.com");

  const passwordFields = page.locator('input[type="password"]');
  await passwordFields.nth(0).fill("password123");
  await passwordFields.nth(1).fill("different123");

  await page.getByRole("button", { name: /^sign up$/i }).click();

  await expect(page.getByText(/passwords must match/i)).toBeVisible();
});