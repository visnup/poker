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

test("table view shows deal hint before first deal", async ({ page }) => {
  const table = randomUUID();
  await page.goto(`/${table}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });

  await expect(page.locator(".hint")).toHaveText(
    /Share this page.*Move the dealer button to deal/s,
  );
  await expect(page.locator(".hint")).not.toHaveClass(/hidden/);
});

test("dealing hides the table hint and persists to localStorage", async ({
  page,
}) => {
  const table = randomUUID();
  await dealCards(page, table);

  await expect(page.locator(".hint")).toHaveClass(/hidden/);

  const stored = await page.evaluate(() => localStorage.getItem("hasDealt"));
  expect(stored).toBe("true");
});

test("table hint stays hidden on a new table after dealing once", async ({
  page,
}) => {
  const table = randomUUID();
  await dealCards(page, table);
  await expect(page.locator(".hint")).toHaveClass(/hidden/);

  // Same device/browser, a different (never-dealt) table.
  await page.goto(`/${randomUUID()}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".hint")).toHaveClass(/hidden/);
});
