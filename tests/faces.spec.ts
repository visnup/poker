import { expect, test } from "@playwright/test";

test("faces screenshot", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/test/faces");

  const cards = page.locator("main > div");
  await expect(cards).toHaveCount(104); // 52 faces, upright and upside down

  // useReducedMotion() returns null until its layout effect runs, so each card
  // starts a real spring on a random 0-200ms delay before snapping to immediate.
  let previous = "";
  await expect
    .poll(async () => {
      const current = await cards.evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transform).join("|"),
      );
      const settled = current === previous;
      previous = current;
      return settled;
    })
    .toBe(true);

  await expect(page).toHaveScreenshot({ fullPage: true });
});
