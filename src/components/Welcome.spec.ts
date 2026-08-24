import { expect, test } from "@playwright/test";

test("starting a table deals immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start a table" }).click();
  await expect(page).toHaveURL(/\/\w+\/0$/);
  await expect(page.locator(".card")).toHaveCount(5);
});
