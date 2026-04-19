import { test, expect } from "@playwright/test";

test("profile page sends unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/dashboard/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("settings page sends unauthenticated visitors to login", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login/);
});
