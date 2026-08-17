import { expect, test } from "@playwright/test";

test("faces screenshot", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test/faces");
  const cards = page.locator("main > div");
  await expect(cards).toHaveCount(104); // 52 faces, upright and upside down
  await expect(page).toHaveScreenshot({ fullPage: true });
});
