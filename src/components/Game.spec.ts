import { expect, test } from "../../test/fixtures";

// Tabs are players: sessionStorage is per-tab, so one context seats them all.
test("the eleventh player is told, not left blank", async ({ table, room }) => {
  const context = table.context();
  const seated = await Promise.all(
    Array.from({ length: 10 }, async () => {
      const page = await context.newPage();
      await page.goto(`/${room}`);
      return page;
    }),
  );
  for (const page of seated)
    await expect(page.getByText(/^\d+:/)).toBeVisible();

  const late = await context.newPage();
  await late.goto(`/${room}`);
  await expect(late.getByText("every seat is taken")).toBeVisible();
});
