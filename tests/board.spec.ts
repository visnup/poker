import { expect, test } from "@playwright/test";

test("shows 5 cards", async ({ page }) => {
  await page.goto("/test/board");
  await expect(page.locator(".card")).toHaveCount(5);
});

test("cycles through reveal states on click", async ({ page }) => {
  await page.goto("/test/board");
  const counter = page.getByTestId("revealed");

  await expect(counter).toHaveText("0");
  await page.locator(".board").click();
  await expect(counter).toHaveText("1");
  await page.locator(".board").click();
  await expect(counter).toHaveText("2");
  await page.locator(".board").click();
  await expect(counter).toHaveText("3");
  await page.locator(".board").click();
  await expect(counter).toHaveText("0");
});
