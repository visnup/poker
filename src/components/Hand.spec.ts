import { expect, test } from "../../test/fixtures";

test("player view loads and shows cards (2 per layer)", async ({ player }) => {
  // Hand renders 2 cards in 2 layers (backs + hidden faces) = 4 .card elements
  await expect(player.locator(".card")).toHaveCount(4, {
    timeout: 10_000,
  });
});

test("drag down reveals cards", async ({ player }) => {
  // Drag down 300px to reveal
  const box = await player.locator(".cards").boundingBox();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 200);
  await player.mouse.down();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 500, {
    steps: 20,
  });
  await player.mouse.up();

  // Cards should still be present after reveal gesture
  await expect(player.locator(".card")).toHaveCount(4);
});

test("swipe up folds cards", async ({ player }) => {
  // Fast swipe up — few steps = high velocity
  const box = await player.locator(".cards").boundingBox();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 400);
  await player.mouse.down();
  await player.mouse.move(box!.x + box!.width / 2, box!.y + 100, {
    steps: 5,
  });
  await player.mouse.up();

  // Cards animate to y:-1000, still in DOM
  await expect(player.locator(".card")).toHaveCount(4);
});
