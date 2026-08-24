import { test as base, expect, type Page } from "@playwright/test";
import { randomUUID } from "crypto";

// Fixtures for tests that hit real Convex tables — each test gets its own
// room id, so they can run concurrently. Requires pnpm dev (including
// Convex) to be running, not just next dev.

export const test = base.extend<{
  room: string;
  table: Page;
  dealCards: (page: Page) => Promise<void>;
  player: Page;
}>({
  room: async ({}, use) => {
    await use(randomUUID());
  },

  // The dealer/table view, already navigated to `/room?table`.
  table: async ({ page, room }, use) => {
    await page.goto(`/${room}?table`);
    await use(page);
  },

  // Drags the dealer button far enough to deal on an already-navigated
  // table page.
  dealCards: async ({}, use) => {
    await use(async (page) => {
      const button = page.getByRole("button", { name: "Dealer" });
      await expect(button).toBeVisible({ timeout: 10_000 });
      const before = await button.boundingBox();
      await page.mouse.move(
        before!.x + before!.width / 2,
        before!.y + before!.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        before!.x + before!.width / 2 + 260,
        before!.y + before!.height / 2,
        { steps: 20 },
      );
      await page.mouse.up();
      await expect(page.locator(".board")).toBeVisible({ timeout: 5_000 });
    });
  },

  // A fresh player context/page for `room`, joined after a dealer (in its
  // own throwaway context) has already dealt.
  player: async ({ browser, room, dealCards }, use) => {
    const dealerCtx = await browser.newContext();
    const dealerPage = await dealerCtx.newPage();
    await dealerPage.goto(`/${room}?table`);
    await dealCards(dealerPage);
    await dealerCtx.close();

    const playerCtx = await browser.newContext();
    const playerPage = await playerCtx.newPage();
    await playerPage.goto(`/${room}`);
    await expect(playerPage.locator(".card")).toHaveCount(4, {
      timeout: 10_000,
    });

    await use(playerPage);
    await playerCtx.close();
  },
});

export { expect };
