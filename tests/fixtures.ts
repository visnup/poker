import { test as base, expect, type Page } from "@playwright/test";
import { randomUUID } from "crypto";

// Fixtures for tests that hit real Convex tables — each test gets its own
// table id, so they can run concurrently. Requires pnpm dev (including
// Convex) to be running, not just next dev.

export const test = base.extend<{
  table: string;
  dealCards: (page: Page) => Promise<void>;
  playerPage: Page;
}>({
  table: async ({}, use) => {
    await use(randomUUID());
  },

  // Navigates `page` to the dealer seat for `table` and drags the dealer
  // button far enough to deal.
  dealCards: async ({ table }, use) => {
    await use(async (page) => {
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
        before!.x + before!.width / 2 + 260,
        before!.y + before!.height / 2,
        { steps: 20 },
      );
      await page.mouse.up();
      await expect(page.locator(".board")).toBeVisible({ timeout: 5_000 });
    });
  },

  // A fresh player context/page for `table`, joined after a dealer (in its
  // own throwaway context) has already dealt.
  playerPage: async ({ browser, table, dealCards }, use) => {
    const dealerCtx = await browser.newContext();
    await dealCards(await dealerCtx.newPage());
    await dealerCtx.close();

    const playerCtx = await browser.newContext();
    const playerPage = await playerCtx.newPage();
    await playerPage.goto(`/${table}`);
    await expect(playerPage.locator(".card")).toHaveCount(4, {
      timeout: 10_000,
    });

    await use(playerPage);
    await playerCtx.close();
  },
});

export { expect };
