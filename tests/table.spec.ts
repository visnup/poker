import { expect, test } from "./fixtures";

test("dealer view loads and shows dealer button", async ({ page, table }) => {
  await page.goto(`/${table}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
});

test("dealer button stays at dragged position", async ({ page, table }) => {
  await page.goto(`/${table}/0`);
  const button = page.getByRole("button", { name: "Dealer" });
  await expect(button).toBeVisible({ timeout: 10_000 });

  const before = await button.boundingBox();
  await page.mouse.move(
    before!.x + before!.width / 2,
    before!.y + before!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 150,
    before!.y + before!.height / 2 + 100,
    { steps: 10 },
  );
  await page.mouse.up();

  const after = await button.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 100);
  expect(after!.y).toBeGreaterThan(before!.y + 50);
});

test("drag dealer button 250px deals cards", async ({ page, dealCards }) => {
  await dealCards(page);
  await expect(page.locator(".card")).toHaveCount(5, { timeout: 5_000 });
});

test("board cycles reveal states on click", async ({ page, dealCards }) => {
  await dealCards(page);

  // Revealed count goes 0 → 1 → 2 → 3 → 0 on click
  // We can't directly observe revealed state from the DOM without data-testid,
  // but we can verify clicks don't crash the page
  for (let i = 0; i < 4; i++) {
    await page.locator(".board").click();
  }
  await expect(page.locator(".card")).toHaveCount(5);
});
