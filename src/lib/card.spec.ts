import { expect, test } from "@playwright/test";

test("card backs screenshot", async ({ page }) => {
  await page.goto("/test/backs");
  await page.addStyleTag({ content: "nextjs-portal { display: none }" });
  await expect(page.locator(".card")).toHaveCount(6);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
