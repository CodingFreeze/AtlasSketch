import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getBoardDataset } from "@/domain/demoData";
import { AtlasGraph } from "../AtlasGraph";

const { atlas, clusters, references } = getBoardDataset("ritual-interfaces");

const originalGetRect = Element.prototype.getBoundingClientRect;

function renderGraph() {
  return render(<AtlasGraph graph={atlas} clusters={clusters} references={references} />);
}

describe("AtlasGraph", () => {
  beforeAll(() => {
    // jsdom has no layout engine; give the SVG a real box so pointer math is finite,
    // and stub pointer capture which jsdom does not implement.
    Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
      return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });

  afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetRect;
  });

  it("renders node and cluster counts", () => {
    renderGraph();

    expect(screen.getByText(`${atlas.nodes.length} nodes`)).toBeTruthy();
    expect(screen.getByText(`${clusters.length} clusters`)).toBeTruthy();
  });

  it("selects a node via the accessible node selector", () => {
    renderGraph();

    const selector = screen.getByLabelText("Accessible graph node selector");
    const target = atlas.nodes.find((node) => node.kind === "reference") ?? atlas.nodes[1];
    const button = within(selector)
      .getAllByRole("button")
      .find((element) => element.textContent?.includes(target.label));

    expect(button).toBeTruthy();
    fireEvent.click(button!);

    expect(button!.getAttribute("aria-pressed")).toBe("true");
  });

  it("toggles the grab cursor across a node drag lifecycle", () => {
    const { container } = renderGraph();
    const svg = container.querySelector("svg")!;
    const nodeGroup = svg.querySelector("g")!;

    expect(svg.getAttribute("class")).toContain("cursor-crosshair");

    fireEvent.pointerDown(nodeGroup, { pointerId: 1, clientX: 50, clientY: 50 });
    expect(svg.getAttribute("class")).toContain("cursor-grabbing");

    fireEvent.pointerUp(svg, { pointerId: 1 });
    expect(svg.getAttribute("class")).toContain("cursor-crosshair");
  });

  // Note: pixel-accurate node repositioning depends on a real layout box + pointer
  // coordinates that jsdom does not provide (synthetic PointerEvents drop clientX),
  // so the drag *physics* is verified in the Playwright E2E suite, not here.
});
