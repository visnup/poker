import { expect, test } from "@playwright/test";

test("renders all 52 cards", async ({ page }) => {
  await page.goto("/test/faces");
  await expect(page.locator(".card")).toHaveCount(52);
});

test("renders 4 cards per rank", async ({ page }) => {
  await page.goto("/test/faces");
  for (const rank of [..."A23456789", "10", "J", "Q", "K"]) {
    await expect(page.locator(`.face[data-rank="${rank}"]`)).toHaveCount(4);
  }
});

test("renders 26 red and 26 black cards", async ({ page }) => {
  await page.goto("/test/faces");
  // .face[data-rank] targets only the Face component divs, not the outer container
  await expect(page.locator(".face[data-rank].red")).toHaveCount(26);
  await expect(page.locator(".face[data-rank]:not(.red)")).toHaveCount(26);
});
