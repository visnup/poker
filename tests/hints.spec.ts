import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

// These tests use real Convex rooms — each test gets an isolated table ID.
// Requires pnpm dev (including Convex) to be running, not just next dev.

async function dealCards(page: import("@playwright/test").Page, table: string) {
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
}

test("hand view shows peek/fold hint before first peek", async ({
  browser,
}) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });

  await expect(playerPage.locator(".hint")).toHaveText(
    /Pull down to peek.*Swipe up to fold/s,
  );
  await expect(playerPage.locator(".hint")).not.toHaveClass(/hidden/);
  await playerCtx.close();
});

test("peeking hides the hint and persists to localStorage", async ({
  browser,
}) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await expect(playerPage.locator(".hint")).not.toHaveClass(/hidden/);
  // Let gesture handlers finish hydrating before dragging.
  await playerPage.waitForTimeout(300);

  // Drag down >250px to peek
  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 100);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 400, {
    steps: 20,
  });
  await playerPage.mouse.up();

  await expect(playerPage.locator(".hint")).toHaveClass(/hidden/);

  const stored = await playerPage.evaluate(() =>
    localStorage.getItem("hasPeeked"),
  );
  expect(stored).toBe("true");
  await playerCtx.close();
});

test("hint stays hidden on reload after peeking once", async ({ browser }) => {
  const table = randomUUID();

  const dealerCtx = await browser.newContext();
  const dealerPage = await dealerCtx.newPage();
  await dealCards(dealerPage, table);
  await dealerCtx.close();

  const playerCtx = await browser.newContext();
  const playerPage = await playerCtx.newPage();
  await playerPage.goto(`/${table}`);
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  // Let gesture handlers finish hydrating before dragging.
  await playerPage.waitForTimeout(300);

  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 100);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 400, {
    steps: 20,
  });
  await playerPage.mouse.up();
  await expect(playerPage.locator(".hint")).toHaveClass(/hidden/);

  await playerPage.reload();
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await expect(playerPage.locator(".hint")).toHaveClass(/hidden/);
  await playerCtx.close();
});
