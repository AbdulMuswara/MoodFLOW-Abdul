import { test, expect } from "@playwright/test";

test("home page shows the main hero headline", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /track your mood/i })
  ).toBeVisible();
});
