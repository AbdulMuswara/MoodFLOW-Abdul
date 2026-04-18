import { test, expect } from "@playwright/test";

test("user attempts to save a mood entry without authentication", async ({ page }) => {
  await page.goto("/dashboard");

  // Dashboard loads
  await expect(
    page.getByRole("heading", { name: /welcome back/i })
  ).toBeVisible();

  // Write a mood note
  await page.getByPlaceholder(/write your notes here/i).fill(
    "Today was stressful but productive."
  );

  // Click save
  await page.getByRole("button", { name: /save entry/i }).click();

  // App should block unauthenticated users
  await expect(
    page.getByText(/user not authenticated/i)
  ).toBeVisible();
});