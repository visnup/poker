import { expect, test } from "../../test/fixtures";

test("any pointer closes the popup, including the close button", async ({
  table,
}) => {
  const open = table.getByRole("button", { name: "?" });
  const popup = table.locator(".overlay");

  await open.click();
  await popup.locator(".card").click();
  await expect(popup).toHaveCount(0);

  await open.click();
  await table.getByRole("button", { name: "close" }).click();
  await expect(popup).toHaveCount(0);
});
