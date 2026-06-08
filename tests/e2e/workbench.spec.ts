import { expect, test } from "@playwright/test";

const WORKBENCH = "/boards/ritual-interfaces/workbench";

test.describe("workbench", () => {
  test("renders the seed console and three variant previews", async ({ page }) => {
    await page.goto(WORKBENCH);

    await expect(page.getByText("Workbench controls")).toBeVisible();
    const previews = page.getByLabel("Generated artifact previews");
    await expect(previews.getByText(/^Variant \d+$/)).toHaveCount(3);
  });

  test("mutates previews when a control slider moves", async ({ page }) => {
    await page.goto(WORKBENCH);

    const previews = page.getByLabel("Generated artifact previews");
    const before = await previews.textContent();
    const density = page.getByRole("slider", { name: "Density" });

    await expect(async () => {
      await density.focus();
      await density.press("ArrowRight");
      await density.press("ArrowRight");
      await density.press("ArrowRight");
      expect(await previews.textContent()).not.toBe(before);
    }).toPass();
  });

  test("switches the active generate-variant", async ({ page }) => {
    await page.goto(WORKBENCH);

    const v3 = page.getByRole("button", { name: "V3", exact: true });

    await expect(async () => {
      await v3.click();
      await expect(v3).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
    }).toPass();
  });
});
