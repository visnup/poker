import { expect, test } from "@playwright/test";

test("renders dealer button", async ({ page }) => {
  await page.goto("/test/dealer-button");
  await expect(page.getByRole("button", { name: "Dealer" })).toBeVisible();
});

test("button stays at dragged position", async ({ page }) => {
  await page.goto("/test/dealer-button");
  const button = page.getByRole("button", { name: "Dealer" });
  const before = await button.boundingBox();

  // drag 150px right and 100px down
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 150,
    before!.y + before!.height / 2 + 100,
    { steps: 10 },
  );
  await page.mouse.up();

  const after = await button.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 100);
  expect(after!.y).toBeGreaterThan(before!.y + 50);
});

test("button stays at position after re-render", async ({ page }) => {
  await page.goto("/test/dealer-button");
  const button = page.getByRole("button", { name: "Dealer" });
  const before = await button.boundingBox();

  // drag >200px — triggers onMove → parent re-renders (setMoved)
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 260,
    before!.y + before!.height / 2,
    { steps: 20 },
  );
  await page.mouse.up();

  await expect(page.getByTestId("moved")).toBeVisible();
  await page.waitForTimeout(1500); // let spring settle

  const after = await button.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 100);
});

test("onMove fires after large drag", async ({ page }) => {
  await page.goto("/test/dealer-button");
  const button = page.getByRole("button", { name: "Dealer" });
  const before = await button.boundingBox();

  // drag >200px to trigger onMove
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    before!.x + before!.width / 2 + 250,
    before!.y + before!.height / 2,
    { steps: 20 },
  );
  await page.mouse.up();

  await expect(page.getByTestId("moved")).toBeVisible();
});
