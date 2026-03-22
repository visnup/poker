import { expect, test } from "@playwright/test";

test("shows 4 cards initially", async ({ page }) => {
  await page.goto("/test/deal");
  await expect(page.locator(".card")).toHaveCount(4);
});

test("face ranks are present", async ({ page }) => {
  await page.goto("/test/deal");
  // .face[data-rank] targets the Face component div (not the outer container)
  await expect(page.locator(".face[data-rank]").first()).toBeVisible();
  const rank = await page.locator(".face[data-rank]").first().getAttribute("data-rank");
  expect(rank).toBeTruthy();
});

test("next card cycles through deck", async ({ page }) => {
  await page.goto("/test/deal");
  const face = page.locator(".face[data-rank]").first();
  const first = await face.getAttribute("data-rank");
  // click through all 52 cards — should cycle back
  for (let i = 0; i < 52; i++)
    await page.getByRole("button", { name: "next card" }).click();
  await expect(face).toHaveAttribute("data-rank", first!);
});

test("clear empties card content", async ({ page }) => {
  await page.goto("/test/deal");
  const face = page.locator(".face[data-rank]").first();
  await expect(face).toHaveAttribute("data-rank", /\S/); // non-empty rank
  await page.getByRole("button", { name: "clear" }).click();
  await expect(face).toHaveAttribute("data-rank", ""); // empty after clear
});
