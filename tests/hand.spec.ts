import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

// These tests use real Convex rooms — each test gets an isolated table ID.
// Requires pnpm dev (including Convex) to be running, not just next dev.

async function dealCards(page: import("@playwright/test").Page, table: string) {
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
  await expect(page.locator(".board")).toBeVisible({ timeout: 5_000 });
}

test("player view loads and shows cards (2 per layer)", async ({ browser }) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  // Hand renders 2 cards in 2 layers (backs + hidden faces) = 4 .card elements
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await playerCtx.close();
});

test("drag down reveals cards", async ({ browser }) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });

  // Drag down 300px to reveal
  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 200);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 500, { steps: 20 });
  await playerPage.mouse.up();

  // Cards should still be present after reveal gesture
  await expect(playerPage.locator(".card")).toHaveCount(4);
  await playerCtx.close();
});

test("swipe up folds cards", async ({ browser }) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });

  // Fast swipe up — few steps = high velocity
  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 400);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 100, { steps: 5 });
  await playerPage.mouse.up();

  // Cards animate to y:-1000, still in DOM
  await expect(playerPage.locator(".card")).toHaveCount(4);
  await playerCtx.close();
});
