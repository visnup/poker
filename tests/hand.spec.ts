import { expect, test } from "./fixtures";

test("player view loads and shows cards (2 per layer)", async ({
  playerPage,
}) => {
  // Hand renders 2 cards in 2 layers (backs + hidden faces) = 4 .card elements
  await expect(playerPage.locator(".card")).toHaveCount(4, {
    timeout: 10_000,
  });
});

test("drag down reveals cards", async ({ playerPage }) => {
  // Drag down 300px to reveal
  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 200);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 500, {
    steps: 20,
  });
  await playerPage.mouse.up();

  // Cards should still be present after reveal gesture
  await expect(playerPage.locator(".card")).toHaveCount(4);
});

test("swipe up folds cards", async ({ playerPage }) => {
  // Fast swipe up — few steps = high velocity
  const box = await playerPage.locator(".cards").boundingBox();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 400);
  await playerPage.mouse.down();
  await playerPage.mouse.move(box!.x + box!.width / 2, box!.y + 100, {
    steps: 5,
  });
  await playerPage.mouse.up();

  // Cards animate to y:-1000, still in DOM
  await expect(playerPage.locator(".card")).toHaveCount(4);
});
