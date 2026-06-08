import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("loads the board console", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "AtlasSketch" })).toBeVisible();
    await expect(page.getByText("Ritual Interfaces").first()).toBeVisible();
  });
});
