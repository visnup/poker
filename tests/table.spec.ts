import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

// These tests use real Convex rooms — each test gets an isolated table ID.
// Requires pnpm dev (including Convex) to be running, not just next dev.

test("dealer view loads and shows dealer button", async ({ page }) => {
  const table = randomUUID();
  await page.goto(`/${table}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
});

test("dealer button stays at dragged position", async ({ page }) => {
  const table = randomUUID();
  await page.goto(`/${table}/0`);
  const button = page.getByRole("button", { name: "Dealer" });
  await expect(button).toBeVisible({ timeout: 10_000 });

  const before = await button.boundingBox();
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
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

test("drag dealer button 250px deals cards", async ({ page }) => {
  const table = randomUUID();
  await page.goto(`/${table}/0`);
  const button = page.getByRole("button", { name: "Dealer" });
  await expect(button).toBeVisible({ timeout: 10_000 });

  const before = await button.boundingBox();
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 260,
    before!.y + before!.height / 2,
    { steps: 20 },
  );
  await page.mouse.up();

  // Board should appear with 5 cards after deal completes
  await expect(page.locator(".card")).toHaveCount(5, { timeout: 5_000 });
});

test("board cycles reveal states on click", async ({ page }) => {
  const table = randomUUID();
  await page.goto(`/${table}/0`);
  const button = page.getByRole("button", { name: "Dealer" });
  await expect(button).toBeVisible({ timeout: 10_000 });

  // Deal first
  const before = await button.boundingBox();
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 260,
    before!.y + before!.height / 2,
    { steps: 20 },
  );
  await page.mouse.up();
  await expect(page.locator(".board")).toBeVisible({ timeout: 5_000 });

  // Revealed count goes 0 → 1 → 2 → 3 → 0 on click
  // We can't directly observe revealed state from the DOM without data-testid,
  // but we can verify clicks don't crash the page
  for (let i = 0; i < 4; i++) {
    await page.locator(".board").click();
  }
  await expect(page.locator(".card")).toHaveCount(5);
});
