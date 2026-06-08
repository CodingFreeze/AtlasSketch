import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { getBoardDataset } from "@/domain/demoData";
import { Workbench } from "../Workbench";

const { clusters, seeds } = getBoardDataset("ritual-interfaces");

function renderWorkbench() {
  return render(<Workbench boardSlug="ritual-interfaces" clusters={clusters} seeds={seeds} />);
}

describe("Workbench", () => {
  beforeEach(() => {
    // Component reads ?cluster= on mount via rAF; keep the URL clean between tests.
    window.history.replaceState({}, "", "/");
  });

  it("renders the first seed lineage and three variant previews", () => {
    renderWorkbench();

    // The seed title shows up both in the <select> option and the lineage panel.
    expect(screen.getAllByText(seeds[0].title).length).toBeGreaterThan(0);

    const previews = screen.getByLabelText("Generated artifact previews");
    expect(within(previews).getAllByText(/^Variant \d+$/).length).toBe(3);
  });

  it("mutates the previews when a control slider changes", () => {
    renderWorkbench();

    const previews = screen.getByLabelText("Generated artifact previews");
    const before = previews.textContent;

    // Density feeds the FNV-1a parameter hash, so the rendered variants must change.
    fireEvent.change(screen.getByLabelText("Density"), { target: { value: "13" } });

    expect(previews.textContent).not.toBe(before);
  });

  it("reflects the slider value in its readout", () => {
    renderWorkbench();

    const slider = screen.getByLabelText("Motion") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "42" } });

    expect(slider.value).toBe("42");
  });

  it("switches the active generate-variant when a V button is pressed", () => {
    renderWorkbench();

    const v3 = screen.getByRole("button", { name: "V3" });
    expect(v3.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(v3);

    expect(v3.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "V1" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("loads a different seed when the seed select changes", () => {
    if (seeds.length < 2) return;
    renderWorkbench();

    const seedSelect = screen.getAllByRole("combobox")[0] as HTMLSelectElement;
    fireEvent.change(seedSelect, { target: { value: seeds[1].id } });

    expect(seedSelect.value).toBe(seeds[1].id);
    expect(screen.getAllByText(seeds[1].title).length).toBeGreaterThan(0);
  });
});
