import { randomUUID } from "crypto";
import { expect, test } from "../../test/fixtures";

test("hand hint shows until peeked, then stays hidden", async ({ player }) => {
  await expect(player.locator(".hint")).toHaveText(
    /Pull down to peek.*Swipe up to fold/s,
  );
  await expect(player.locator(".hint")).toHaveClass(/visible/);

  // Drag down 300px to reveal
  const box = await player.locator(".cards").boundingBox();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 200);
  await player.mouse.down();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 500, {
    steps: 20,
  });
  await player.mouse.up();

  await expect(player.locator(".hint")).not.toHaveClass(/visible/);

  const stored = await player.evaluate(() => localStorage.getItem("handHint"));
  expect(stored).toBe("false");

  await player.reload();
  await expect(player.locator(".card")).toHaveCount(4, { timeout: 10_000 });
  await expect(player.locator(".hint")).not.toHaveClass(/visible/);
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
  await expect(table.locator(".hint")).toHaveClass(/visible/);

  await dealCards(table);
  await expect(table.locator(".hint")).not.toHaveClass(/visible/);

  const stored = await table.evaluate(() => localStorage.getItem("tableHint"));
  expect(stored).toBe("false");

  // Same device/browser, a different (never-dealt) table.
  await table.goto(`/${randomUUID()}?table`);
  await expect(table.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(table.locator(".hint")).not.toHaveClass(/visible/);
});
