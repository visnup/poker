import { expect, test } from "@playwright/test";

const convex = (url: string) => url.includes("convex");

test("starting a table deals immediately", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start a table" }).click();
  await expect(page).toHaveURL(/\/\w+$/);
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(5);
});

test("the landing page never opens a convex socket", async ({ page }) => {
  const sockets: string[] = [];
  page.on("websocket", (ws) => sockets.push(ws.url()));

  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start a table" }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(sockets.filter(convex)).toEqual([]);

  await page.getByRole("button", { name: "Start a table" }).click();
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible();
  expect(sockets.filter(convex)).not.toEqual([]);
});
