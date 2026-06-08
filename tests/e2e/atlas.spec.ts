import { expect, test } from "@playwright/test";

const ATLAS = "/boards/ritual-interfaces/atlas";

test.describe("atlas", () => {
  test("renders the interactive graph", async ({ page }) => {
    await page.goto(ATLAS);

    await expect(page.getByRole("img", { name: /Interactive atlas graph/i })).toBeVisible();
    await expect(page.getByLabel("Accessible graph node selector")).toBeVisible();
    // Node-count chip lives in the graph panel header.
    await expect(page.getByText(/^\d+ nodes$/).first()).toBeVisible();
  });

  test("selects a node from the accessible node selector", async ({ page }) => {
    await page.goto(ATLAS);

    const selector = page.getByLabel("Accessible graph node selector");
    // Stable element (fixed index) so the assertion tracks the button we clicked;
    // clicking any node selects it, so it must end up pressed.
    const target = selector.getByRole("button").nth(3);

    await expect(async () => {
      await target.click();
      await expect(target).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass();
  });

  test("repositions a node by dragging it", async ({ page }) => {
    await page.goto(ATLAS);

    const circle = page.locator("svg g circle").first();
    const before = await circle.getAttribute("cx");

    await expect(async () => {
      const box = await circle.boundingBox();
      expect(box).not.toBeNull();
      const startX = box!.x + box!.width / 2;
      const startY = box!.y + box!.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 90, startY + 70, { steps: 10 });
      await page.mouse.up();

      expect(await circle.getAttribute("cx")).not.toBe(before);
    }).toPass();
  });
});
