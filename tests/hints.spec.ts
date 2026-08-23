import { randomUUID } from "crypto";
import { expect, test } from "./fixtures";

test("hand hint shows until peeked, then stays hidden", async ({ player }) => {
  await expect(player.locator(".hint")).toHaveText(
    /Pull down to peek.*Swipe up to fold/s,
  );
  await expect(player.locator(".hint")).not.toHaveClass(/hidden/);
  // Let gesture handlers finish hydrating before dragging.
  await player.waitForTimeout(300);

  // Drag down >250px to peek
  const box = await player.locator(".cards").boundingBox();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 100);
  await player.mouse.down();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 400, {
    steps: 20,
  });
  await player.mouse.up();

  await expect(player.locator(".hint")).toHaveClass(/hidden/);

  const stored = await player.evaluate(() => localStorage.getItem("hasPeeked"));
  expect(stored).toBe("true");

  await player.reload();
  await expect(player.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await expect(player.locator(".hint")).toHaveClass(/hidden/);
});

test("table hint shows until dealt, then stays hidden", async ({
  table,
  dealCards,
}) => {
  await expect(table.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(table.locator(".hint")).toHaveText(
    /Share this page.*Move the dealer button to deal/s,
  );
  await expect(table.locator(".hint")).not.toHaveClass(/hidden/);

  await dealCards(table);
  await expect(table.locator(".hint")).toHaveClass(/hidden/);

  const stored = await table.evaluate(() => localStorage.getItem("hasDealt"));
  expect(stored).toBe("true");

  // Same device/browser, a different (never-dealt) table.
  await table.goto(`/${randomUUID()}/0`);
  await expect(table.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(table.locator(".hint")).toHaveClass(/hidden/);
});
