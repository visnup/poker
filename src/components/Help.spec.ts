import { expect, test } from "../../test/fixtures";

test("help overlay lists the gestures and the join link", async ({
  table,
  room,
}) => {
  await expect(table.getByRole("button", { name: "Dealer" })).toBeVisible({
    timeout: 10_000,
  });
  await table.getByRole("button", { name: "?" }).click();

  // Scoped to the popup: the table hint says "Move the dealer button" too,
  // and the board's cards are .card as well.
  const help = table.locator(".overlay");
  await expect(help.getByText(/Move the dealer button/)).toBeVisible();
  await expect(help.getByText(/Pull down to peek/)).toBeVisible();
  await expect(help.locator("svg.qr")).toBeVisible();
  // The dealer screen is /:room/0; the link to share drops the seat.
  await expect(help.getByText(`http://localhost:3000/${room}`)).toBeVisible();

  await help.click({ position: { x: 5, y: 5 } });
  await expect(help).toHaveCount(0);
});

test("help is reachable from a player's phone", async ({ player }) => {
  await expect(player.getByRole("button", { name: "?" })).toBeVisible();
});
