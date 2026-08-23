import { randomUUID } from "crypto";
import { expect, test } from "./fixtures";

test("hand hint shows until peeked, then stays hidden", async ({
  playerPage,
}) => {
  await expect(playerPage.locator(".hint")).toHaveText(
    /Pull down to peek.*Swipe up to fold/s,
  );
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

  await playerPage.reload();
  await expect(playerPage.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await expect(playerPage.locator(".hint")).toHaveClass(/hidden/);
});

test("table hint shows until dealt, then stays hidden", async ({
  page,
  table,
  dealCards,
}) => {
  await page.goto(`/${table}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".hint")).toHaveText(
    /Share this page.*Move the dealer button to deal/s,
  );
  await expect(page.locator(".hint")).not.toHaveClass(/hidden/);

  await dealCards(page);
  await expect(page.locator(".hint")).toHaveClass(/hidden/);

  const stored = await page.evaluate(() => localStorage.getItem("hasDealt"));
  expect(stored).toBe("true");

  // Same device/browser, a different (never-dealt) table.
  await page.goto(`/${randomUUID()}/0`);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator(".hint")).toHaveClass(/hidden/);
});
