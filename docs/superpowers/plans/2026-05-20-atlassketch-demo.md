# AtlasSketch Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Vercel-safe AtlasSketch demo: a read-only compiled taste atlas with static sample data, placeholder references, an interactive atlas, deterministic workbench variants, and an artifact gallery.

**Architecture:** Use a Next.js App Router project with static JSON fixtures and browser-safe deterministic renderers. The public demo has no upload, no runtime AI calls, no database, and no server-side writes; future local studio behavior is represented through clear data boundaries and docs.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Base UI or Radix primitives where interaction complexity requires accessible behavior, lucide-react icons, Vitest for pure logic tests, Playwright for visual smoke checks.

---

## File Structure

Create the app in the repository root. Keep domain logic independent from React components so data loading, seed mutation, and artifact rendering can be tested without a browser.

- `package.json`: scripts and dependencies.
- `next.config.ts`: static-friendly Next config.
- `tsconfig.json`: TypeScript config.
- `postcss.config.mjs`: Tailwind processing.
- `tailwind.config.ts`: theme tokens and content paths.
- `vitest.config.ts`: unit test config.
- `playwright.config.ts`: browser smoke test config.
- `src/app/layout.tsx`: root HTML shell and metadata.
- `src/app/page.tsx`: redirect or render Board Console.
- `src/app/globals.css`: visual system tokens, base styles, no emoji usage.
- `src/app/boards/[boardSlug]/page.tsx`: board overview.
- `src/app/boards/[boardSlug]/library/page.tsx`: reference library.
- `src/app/boards/[boardSlug]/atlas/page.tsx`: atlas graph view.
- `src/app/boards/[boardSlug]/workbench/page.tsx`: seed workbench.
- `src/app/boards/[boardSlug]/artifacts/page.tsx`: artifact gallery.
- `src/app/boards/[boardSlug]/artifacts/[artifactId]/page.tsx`: artifact detail.
- `src/components/app/AppFrame.tsx`: persistent shell, nav, counters.
- `src/components/boards/BoardConsole.tsx`: board list.
- `src/components/library/ReferenceGrid.tsx`: dense reference cards and filters.
- `src/components/atlas/AtlasGraph.tsx`: SVG graph and selection behavior.
- `src/components/workbench/Workbench.tsx`: controls, seed selection, preview generation.
- `src/components/artifacts/ArtifactGrid.tsx`: artifact card grid.
- `src/components/artifacts/ArtifactPreview.tsx`: iframe or generated preview surface.
- `src/components/dna/DnaStrip.tsx`: reusable aesthetic DNA strip motif.
- `src/components/ui/*`: small local primitives such as `Button`, `Panel`, `Chip`, `Stat`.
- `src/data/demo/boards.json`: board index.
- `src/data/demo/ritual-interfaces/*.json`: sample board data.
- `src/domain/types.ts`: shared data model.
- `src/domain/demoData.ts`: validated static fixture accessors.
- `src/domain/mutation.ts`: deterministic seed mutation.
- `src/domain/renderers/*`: artifact family renderers.
- `src/domain/renderers/index.ts`: renderer registry.
- `src/domain/search.ts`: tag and text filtering helpers.
- `src/domain/graph.ts`: atlas graph helpers.
- `src/domain/__tests__/*.test.ts`: unit tests.
- `public/demo/placeholders/*`: generated placeholder reference thumbnails.
- `public/demo/artifacts/*`: static generated artifact files and previews.
- `docs/ATLAS_PIPELINE.md`: concept, local extraction, public demo mode.
- `README.md`: setup, run, demo explanation, no-cost deployment notes.

---

### Task 1: Scaffold The Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "atlassketch",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-tabs": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@vitejs/plugin-react": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "jsdom": "latest",
    "postcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` is created and install completes without errors.

- [ ] **Step 3: Add config files**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        atlas: {
          black: "#050706",
          panel: "#0e120f",
          line: "#263326",
          lime: "#b8ff6a",
          cyan: "#62e6ff",
          red: "#ff3d2e",
          magenta: "#ff4fd8",
          paper: "#f4e8cd",
          muted: "#8a9588"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      }
    },
  },
  plugins: [],
};

export default config;
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ],
});
```

- [ ] **Step 4: Add minimal app shell**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AtlasSketch",
  description: "A compiled taste atlas and deterministic interface-art workbench.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-atlas-black p-6 text-atlas-paper">
      <h1 className="text-balance font-mono text-2xl uppercase">AtlasSketch</h1>
      <p className="mt-3 max-w-2xl text-pretty text-sm text-atlas-muted">
        Compiled taste atlas loading surface. Board console arrives in Task 4.
      </p>
    </main>
  );
}
```

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-sans: "Space Grotesk", "IBM Plex Sans", sans-serif;
  --font-mono: "IBM Plex Mono", "JetBrains Mono", monospace;
}

* {
  box-sizing: border-box;
}

html {
  background: #050706;
}

body {
  margin: 0;
  min-height: 100dvh;
  background: #050706;
  color: #f4e8cd;
}
```

- [ ] **Step 5: Verify scaffold**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: both commands pass.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts vitest.config.ts playwright.config.ts src/app
git commit -m "feat: scaffold AtlasSketch app"
```

---

### Task 2: Define Domain Types And Demo Fixtures

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/demoData.ts`
- Create: `src/domain/__tests__/demoData.test.ts`
- Create: `src/data/demo/boards.json`
- Create: `src/data/demo/ritual-interfaces/manifest.json`
- Create: `src/data/demo/ritual-interfaces/references.json`
- Create: `src/data/demo/ritual-interfaces/clusters.json`
- Create: `src/data/demo/ritual-interfaces/atlas.json`
- Create: `src/data/demo/ritual-interfaces/seeds.json`
- Create: `src/data/demo/ritual-interfaces/artifacts.json`

- [ ] **Step 1: Write failing data access test**

Create `src/domain/__tests__/demoData.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getBoardBySlug, getBoardDataset, listBoards } from "../demoData";

describe("demoData", () => {
  it("loads the shipped ritual interfaces board", () => {
    const boards = listBoards();
    expect(boards.map((board) => board.slug)).toContain("ritual-interfaces");
    expect(getBoardBySlug("ritual-interfaces")?.title).toBe("Ritual Interfaces");
  });

  it("loads a complete board dataset", () => {
    const dataset = getBoardDataset("ritual-interfaces");
    expect(dataset.board.slug).toBe("ritual-interfaces");
    expect(dataset.references.length).toBeGreaterThanOrEqual(12);
    expect(dataset.clusters.length).toBeGreaterThanOrEqual(4);
    expect(dataset.seeds.length).toBeGreaterThanOrEqual(4);
    expect(dataset.artifacts.length).toBeGreaterThanOrEqual(6);
    expect(dataset.atlas.nodes.length).toBeGreaterThan(dataset.clusters.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/domain/__tests__/demoData.test.ts
```

Expected: FAIL because `src/domain/demoData.ts` does not exist.

- [ ] **Step 3: Add domain types**

Create `src/domain/types.ts` with exported types for `Board`, `ReferenceBlock`, `Cluster`, `AtlasGraph`, `Seed`, `Artifact`, and `ArtifactFamily`. Use the names and fields from the approved spec, including `placeholderPath` on `ReferenceBlock` and static `paths` on `Artifact`.

- [ ] **Step 4: Add initial fixtures**

Create the JSON fixture files listed above. Include one board, at least 12 references, 4 clusters, 4 seeds, 6 artifacts, and graph nodes connecting clusters, tags, and references. Use placeholder paths such as `/demo/placeholders/ref-001.svg` and artifact paths such as `/demo/artifacts/artifact-001/index.html`.

- [ ] **Step 5: Add fixture accessors**

Create `src/domain/demoData.ts`:

```ts
import boards from "@/data/demo/boards.json";
import artifacts from "@/data/demo/ritual-interfaces/artifacts.json";
import atlas from "@/data/demo/ritual-interfaces/atlas.json";
import clusters from "@/data/demo/ritual-interfaces/clusters.json";
import manifest from "@/data/demo/ritual-interfaces/manifest.json";
import references from "@/data/demo/ritual-interfaces/references.json";
import seeds from "@/data/demo/ritual-interfaces/seeds.json";
import type { Artifact, AtlasGraph, Board, Cluster, ReferenceBlock, Seed } from "./types";

export type BoardDataset = {
  board: Board;
  references: ReferenceBlock[];
  clusters: Cluster[];
  atlas: AtlasGraph;
  seeds: Seed[];
  artifacts: Artifact[];
};

const boardList = boards as Board[];
const datasets: Record<string, BoardDataset> = {
  "ritual-interfaces": {
    board: manifest as Board,
    references: references as ReferenceBlock[],
    clusters: clusters as Cluster[],
    atlas: atlas as AtlasGraph,
    seeds: seeds as Seed[],
    artifacts: artifacts as Artifact[],
  },
};

export function listBoards(): Board[] {
  return boardList;
}

export function getBoardBySlug(slug: string): Board | undefined {
  return boardList.find((board) => board.slug === slug);
}

export function getBoardDataset(slug: string): BoardDataset {
  const dataset = datasets[slug];
  if (!dataset) {
    throw new Error(`Unknown demo board: ${slug}`);
  }
  return dataset;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
pnpm test src/domain/__tests__/demoData.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain src/data
git commit -m "feat: add demo board data model"
```

---

### Task 3: Build Visual System Primitives

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Chip.tsx`
- Create: `src/components/ui/Panel.tsx`
- Create: `src/components/ui/Stat.tsx`
- Create: `src/components/dna/DnaStrip.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add class merge helper**

Create `src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Add primitives**

Create small, accessible components for `Button`, `Chip`, `Panel`, and `Stat`. Use `cn`, visible focus states, `tabular-nums` for numeric values, no emojis, and no gradient backgrounds.

- [ ] **Step 3: Add DNA strip**

Create `src/components/dna/DnaStrip.tsx`:

```tsx
import { cn } from "@/lib/cn";

type DnaStripProps = {
  tags: string[];
  palette: string[];
  density?: number;
  className?: string;
};

export function DnaStrip({ tags, palette, density = 0.5, className }: DnaStripProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 border-t border-atlas-line pt-2", className)}>
      <div className="flex shrink-0 gap-1" aria-label="Palette">
        {palette.slice(0, 5).map((color) => (
          <span
            key={color}
            className="size-3 border border-atlas-line"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="h-3 w-16 border border-atlas-line">
        <div
          className="h-full bg-atlas-lime"
          style={{ width: `${Math.max(8, Math.min(100, density * 100))}%` }}
        />
      </div>
      <div className="flex min-w-0 gap-1 overflow-hidden">
        {tags.slice(0, 4).map((tag) => (
          <span key={tag} className="truncate font-mono text-[10px] uppercase text-atlas-muted">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Strengthen global visual system**

Update `src/app/globals.css` with selection colors, subtle grid background, focus outline defaults, and `prefers-reduced-motion` handling.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib src/components src/app/globals.css
git commit -m "feat: add AtlasSketch UI primitives"
```

---

### Task 4: Build App Frame, Board Console, And Library

**Files:**
- Create: `src/components/app/AppFrame.tsx`
- Create: `src/components/boards/BoardConsole.tsx`
- Create: `src/components/library/ReferenceGrid.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/boards/[boardSlug]/page.tsx`
- Create: `src/app/boards/[boardSlug]/library/page.tsx`
- Create: `src/domain/search.ts`
- Create: `src/domain/__tests__/search.test.ts`

- [ ] **Step 1: Write filtering test**

Create `src/domain/__tests__/search.test.ts` with tests proving references can be filtered by free text, tag, and cluster ID.

- [ ] **Step 2: Implement `filterReferences`**

Create `src/domain/search.ts` with:

```ts
import type { ReferenceBlock } from "./types";

export type ReferenceFilter = {
  query?: string;
  tag?: string;
  clusterId?: string;
};

export function filterReferences(references: ReferenceBlock[], filter: ReferenceFilter) {
  const query = filter.query?.trim().toLowerCase();
  return references.filter((reference) => {
    const text = [
      reference.title,
      reference.sourceClass,
      ...reference.visualTags,
      ...reference.semanticTags,
      ...reference.motifs,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (query && !text.includes(query)) return false;
    if (filter.tag && ![...reference.visualTags, ...reference.semanticTags, ...reference.motifs].includes(filter.tag)) return false;
    if (filter.clusterId && !reference.clusterIds.includes(filter.clusterId)) return false;
    return true;
  });
}
```

- [ ] **Step 3: Build frame and board console**

Create a persistent `AppFrame` with top navigation for Boards, Library, Atlas, Workbench, and Artifacts. Create `BoardConsole` with board cards, stats, top tags, and DNA strips.

- [ ] **Step 4: Build reference library**

Create `ReferenceGrid` as a dense, responsive grid. Each card shows placeholder thumbnail, title, source class, tags, palette chips, cluster IDs, and DNA strip. Start with server-rendered filtering props; add client-side controls later if needed.

- [ ] **Step 5: Wire routes**

Update `src/app/page.tsx` to render `BoardConsole`. Add board overview and library pages using `getBoardDataset`.

- [ ] **Step 6: Verify**

Run:

```bash
pnpm test src/domain/__tests__/search.test.ts
pnpm typecheck
pnpm build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/app src/components/app src/components/boards src/components/library src/domain
git commit -m "feat: add board console and reference library"
```

---

### Task 5: Build Atlas Graph

**Files:**
- Create: `src/domain/graph.ts`
- Create: `src/domain/__tests__/graph.test.ts`
- Create: `src/components/atlas/AtlasGraph.tsx`
- Create: `src/app/boards/[boardSlug]/atlas/page.tsx`

- [ ] **Step 1: Write graph helper tests**

Test that `getNodeConnections(graph, nodeId)` returns directly connected nodes and edges, and that missing node IDs return empty results.

- [ ] **Step 2: Implement graph helpers**

Create `src/domain/graph.ts` with pure helpers for node lookup, connection lookup, and cluster node filtering.

- [ ] **Step 3: Build SVG graph**

Create `AtlasGraph.tsx` as a client component that renders fixture graph nodes in SVG using stored `x`/`y` coordinates. Add keyboard-focusable node buttons via SVG `foreignObject` or an accessible side list paired with SVG selection. Selecting a node updates an inspector.

- [ ] **Step 4: Build atlas route**

Create the atlas page with graph, cluster list, selected node inspector, palette/motif display, and link to Workbench with a selected cluster query param.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test src/domain/__tests__/graph.test.ts
pnpm typecheck
pnpm build
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/domain src/components/atlas src/app/boards/[boardSlug]/atlas
git commit -m "feat: add interactive atlas graph"
```

---

### Task 6: Build Deterministic Artifact Renderers

**Files:**
- Create: `src/domain/renderers/types.ts`
- Create: `src/domain/renderers/shared.ts`
- Create: `src/domain/renderers/signalGraph.ts`
- Create: `src/domain/renderers/compressionDashboard.ts`
- Create: `src/domain/renderers/ritualDiagram.ts`
- Create: `src/domain/renderers/sourcebookLightTable.ts`
- Create: `src/domain/renderers/interfacePanel.ts`
- Create: `src/domain/renderers/index.ts`
- Create: `src/domain/renderers/__tests__/renderers.test.ts`

- [ ] **Step 1: Write renderer tests**

Test that each renderer returns a standalone HTML string containing `<!doctype html>`, embedded `<style>`, no external script URL, no original source image URL, and the seed title.

- [ ] **Step 2: Define renderer contract**

Create `types.ts`:

```ts
import type { Seed } from "../types";

export type RenderedArtifact = {
  html: string;
  title: string;
  family: Seed["family"];
};

export type ArtifactRenderer = (seed: Seed, variant: number) => RenderedArtifact;
```

- [ ] **Step 3: Add shared deterministic utilities**

Create seeded pseudo-random helpers in `shared.ts`, plus safe HTML escaping and common CSS shell generation.

- [ ] **Step 4: Implement five initial families**

Implement `signalGraph`, `compressionDashboard`, `ritualDiagram`, `sourcebookLightTable`, and `interfacePanel`. Each renderer must use the seed palette, tags, recipe, and variant number to produce visibly distinct but deterministic HTML.

- [ ] **Step 5: Add registry**

Create `index.ts` exporting `renderArtifact(seed, variant)` and a registry keyed by artifact family.

- [ ] **Step 6: Verify**

Run:

```bash
pnpm test src/domain/renderers/__tests__/renderers.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/renderers
git commit -m "feat: add deterministic artifact renderers"
```

---

### Task 7: Build Workbench

**Files:**
- Create: `src/domain/mutation.ts`
- Create: `src/domain/__tests__/mutation.test.ts`
- Create: `src/components/workbench/Workbench.tsx`
- Create: `src/components/artifacts/ArtifactPreview.tsx`
- Create: `src/app/boards/[boardSlug]/workbench/page.tsx`

- [ ] **Step 1: Write mutation tests**

Test that the same seed and controls produce the same parameter hash, different mutation levels produce different hashes, and unsupported family input falls back to the seed family.

- [ ] **Step 2: Implement mutation helper**

Create a pure `mutateSeed(seed, controls)` helper that returns a new seed-like object with adjusted deterministic parameters and preserved lineage.

- [ ] **Step 3: Build preview component**

Create `ArtifactPreview` that renders generated HTML in a sandboxed iframe using `srcDoc`.

- [ ] **Step 4: Build workbench UI**

Create `Workbench` as a client component with seed selection, artifact family selector, density slider, mutation slider, motion slider, grid intensity slider, signal noise slider, and generate variant buttons. Use Radix sliders/selects for accessibility.

- [ ] **Step 5: Wire route**

Create the Workbench page using the board dataset and optional `cluster` query param. Show selected seed lineage, DNA strip, controls, and preview grid.

- [ ] **Step 6: Verify**

Run:

```bash
pnpm test src/domain/__tests__/mutation.test.ts
pnpm typecheck
pnpm build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/domain/mutation.ts src/domain/__tests__/mutation.test.ts src/components/workbench src/components/artifacts/ArtifactPreview.tsx src/app/boards/[boardSlug]/workbench
git commit -m "feat: add deterministic seed workbench"
```

---

### Task 8: Build Artifact Gallery And Detail

**Files:**
- Create: `src/components/artifacts/ArtifactGrid.tsx`
- Create: `src/app/boards/[boardSlug]/artifacts/page.tsx`
- Create: `src/app/boards/[boardSlug]/artifacts/[artifactId]/page.tsx`
- Create: `public/demo/artifacts/artifact-001/index.html`
- Create: `public/demo/artifacts/artifact-002/index.html`
- Create: `public/demo/artifacts/artifact-003/index.html`
- Create: `public/demo/artifacts/artifact-004/index.html`
- Create: `public/demo/artifacts/artifact-005/index.html`
- Create: `public/demo/artifacts/artifact-006/index.html`

- [ ] **Step 1: Generate static artifact files**

Use the deterministic renderers to create six static HTML artifacts under `public/demo/artifacts`. This can be done with a small temporary script or manually during implementation; do not commit temporary scripts unless they become part of the supported workflow.

- [ ] **Step 2: Build gallery**

Create `ArtifactGrid` with dense cards showing live iframe previews, family, tags, palette, seed lineage, and links to detail pages.

- [ ] **Step 3: Build detail page**

Create the detail route with large sandboxed preview, metadata panel, DNA strip, seed recipe, source references by placeholder ID, and standalone artifact link.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: PASS and generated static artifact paths resolve under `/demo/artifacts/...`.

- [ ] **Step 5: Commit**

```bash
git add src/components/artifacts src/app/boards/[boardSlug]/artifacts public/demo/artifacts
git commit -m "feat: add artifact gallery and static outputs"
```

---

### Task 9: Add Placeholder Reference Assets

**Files:**
- Create: `public/demo/placeholders/ref-001.svg` through `public/demo/placeholders/ref-012.svg`
- Modify: `src/data/demo/ritual-interfaces/references.json`

- [ ] **Step 1: Create abstract placeholder thumbnails**

Create 12 SVG placeholders inspired by the approved visual direction: signal maps, glyph grids, paper fragments, radial diagrams, dense panels, and data cartography. Use no private source imagery and no embedded external assets.

- [ ] **Step 2: Validate paths**

Ensure every `placeholderPath` in `references.json` points to an existing SVG.

- [ ] **Step 3: Verify build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add public/demo/placeholders src/data/demo/ritual-interfaces/references.json
git commit -m "feat: add public placeholder reference assets"
```

---

### Task 10: Add Documentation And E2E Smoke Tests

**Files:**
- Create: `README.md`
- Create: `docs/ATLAS_PIPELINE.md`
- Create: `tests/e2e/demo.spec.ts`

- [ ] **Step 1: Write README**

Document what AtlasSketch is, demo mode constraints, local setup, commands, and the zero-recurring-cost deployment model.

- [ ] **Step 2: Write pipeline doc**

Document private references, offline Codex-assisted extraction, placeholder asset generation, board DNA JSON, deterministic renderers, and static Vercel deployment.

- [ ] **Step 3: Add E2E smoke test**

Create `tests/e2e/demo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("demo surfaces are navigable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /AtlasSketch/i })).toBeVisible();
  await page.getByRole("link", { name: /Ritual Interfaces/i }).click();
  await expect(page.getByRole("link", { name: /Library/i })).toBeVisible();
  await page.getByRole("link", { name: /Library/i }).click();
  await expect(page.getByText(/Reference/i).first()).toBeVisible();
  await page.getByRole("link", { name: /Atlas/i }).click();
  await expect(page.getByText(/Cluster/i).first()).toBeVisible();
  await page.getByRole("link", { name: /Workbench/i }).click();
  await expect(page.getByRole("button", { name: /Generate/i })).toBeVisible();
  await page.getByRole("link", { name: /Artifacts/i }).click();
  await expect(page.getByText(/Artifact/i).first()).toBeVisible();
});
```

- [ ] **Step 4: Verify all checks**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/ATLAS_PIPELINE.md tests/e2e
git commit -m "docs: document AtlasSketch demo pipeline"
```

---

### Task 11: Configure GitHub Remote And Push

**Files:**
- No file changes expected.

- [ ] **Step 1: Add SSH remote**

Run:

```bash
git remote add origin git@github.com:CodingFreeze/AtlasSketch.git
```

Expected: `git remote -v` shows `origin` with the SSH URL.

- [ ] **Step 2: Push main**

Run:

```bash
git push -u origin main
```

Expected: push succeeds over SSH.

---

## Self-Review

Spec coverage:

- Static-cost public demo: covered by Tasks 1, 2, 8, 10, and 11.
- No public upload, no runtime AI, no database, no server writes: covered by architecture and docs tasks.
- Placeholder references: covered by Tasks 2 and 9.
- Boards, Library, Atlas, Workbench, Artifacts: covered by Tasks 4, 5, 7, and 8.
- Deterministic renderers: covered by Tasks 6 and 7.
- Documentation: covered by Task 10.
- Vercel-ready static behavior: covered by Tasks 1, 8, and 10.

Placeholder scan:

- This plan intentionally uses the word "placeholder" only for public reference thumbnails, which is a product requirement.
- No open-ended implementation placeholders are left for core behavior.

Type consistency:

- Domain names match the approved spec: `Board`, `ReferenceBlock`, `Cluster`, `AtlasGraph`, `Seed`, `Artifact`, and `ArtifactFamily`.
- Route names match the approved UX sections.
