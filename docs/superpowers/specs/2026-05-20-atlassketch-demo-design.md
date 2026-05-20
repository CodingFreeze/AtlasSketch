# AtlasSketch Demo Design

**Date:** 2026-05-20

**Status:** Approved design spec

**Goal:** Build AtlasSketch as a static-cost public showcase with local-first foundations: a compiled taste atlas that turns private Pinterest-derived moodboards into explorable metadata, seeds, and deterministic interface-art artifacts.

## Product Direction

AtlasSketch is a private creative coding tool that can be deployed publicly as a read-only showcase. The deployed Vercel version must be inexpensive to keep online, with no public uploads, no runtime AI calls, no database, and no server-side persistent storage. Visitors explore precompiled sample boards made from private source material, but they do not see the original Pinterest reference images.

The first release prioritizes a visually impressive live demo with the groundwork for the complete local pipeline. The app should feel like a dense experimental lab without becoming unusable. Repo documentation will explain the pipeline, local extraction workflow, and how future users can fork and rebuild their own atlas.

## Modes

### Demo Mode

Demo Mode is the Vercel-facing product. It loads static board data, placeholder thumbnails, graph data, seed recipes, artifact metadata, and prebuilt artifact files from the repository. Visitors can browse boards, inspect clusters, explore the atlas graph, use deterministic workbench controls, and view generated artifacts. Demo Mode never exposes private source images and never requires paid services.

### Local Studio Mode

Local Studio Mode is the future-facing authoring architecture. It will eventually ingest local image folders, run extraction passes, generate placeholders, compile board DNA, write board directories, and export a static demo bundle. Before the first public launch, Codex can act as the offline LLM/VLM extraction step by inspecting private uploads locally and producing the rich JSON metadata shipped with the demo.

## Architecture

The public app uses static-first Next.js data loading and deterministic rendering. Board data is represented as JSON manifests and static assets, not a database. Artifact generation is based on parameterized renderers rather than runtime LLM-generated code.

Core data flow:

```txt
Private Pinterest exports
  -> local/offline extraction
  -> placeholder reference assets
  -> board DNA JSON
  -> clusters + atlas graph + seeds
  -> deterministic artifact renderers
  -> static demo bundle
  -> Vercel showcase
```

The implementation should preserve a clear boundary between demo-safe data and private source inputs. Public sample boards can include metadata derived from private references, but public thumbnails should be generated placeholders or abstracted derivative images.

## UX Structure

AtlasSketch should open directly into the tool, not a marketing page. The first screen is a Board Console showing sample board worlds, counts, recent artifacts, top motifs, and clear entry points.

Primary sections:

- **Boards:** Curated sample worlds with placeholder mosaics, reference counts, cluster counts, artifact counts, top tags, and status.
- **Library:** Dense grid of placeholder reference cards with generated labels, palette chips, visual tags, motifs, source class, and cluster membership.
- **Atlas:** Spatial graph of references, clusters, tags, and motifs. Selecting a node opens an inspector with philosophy excerpts, motifs, palette families, and a send-to-workbench action.
- **Workbench:** Interactive demo surface for selecting shipped seeds or clusters, adjusting density, mutation, motion, grid intensity, signal noise, palette adherence, and artifact family, then generating deterministic variants.
- **Artifacts:** Persistent gallery of generated HTML/code-art interfaces with live preview, metadata, seed lineage, tags, palette, and standalone artifact links.

Each page should feel technical and dense, but still provide one obvious next action and clear labels.

## Visual System

The visual foundation is Retro-Futuristic / Industrial Lab with a restrained cyberpunk accent. AtlasSketch should feel like a private research console for taste data: dark, compact, archival, technical, and a little uncanny.

Visual rules:

- Near-black and charcoal backgrounds with subtle grid structure.
- Thin bordered panels with compact headers and 4-8px radius maximum.
- Terminal lime as the primary accent.
- Cyan and warning red as secondary accents.
- Hot magenta or electric blue only for mutation states or rare emphasis.
- Dense mono or semi-mono typography for metadata.
- Clean sans typography for longer readable copy.
- Compact bordered cards with information-rich layouts.
- Purposeful motion only for selection, graph focus, generation progress, and preview transitions.
- No emojis in frontend copy or UI.
- No generic SaaS hero, oversized marketing cards, gradient blobs, or decorative filler.

Signature motif: **Aesthetic DNA strips**. Boards, clusters, seeds, and artifacts should display compact horizontal strips containing tags, palette chips, motif marks, signal bars, and lineage indicators. This motif becomes the recognizable AtlasSketch language across the app.

## Data Model

The v1 data model should include:

- `Board`: sample world, philosophy, stats, paths, and summary.
- `ReferenceBlock`: placeholder thumbnail, extracted metadata, tags, palette, motifs, cluster membership, and source class.
- `Cluster`: grouped aesthetic region with label, description, reference IDs, motifs, palettes, and suggested seeds.
- `AtlasGraph`: nodes and edges for references, clusters, tags, motifs, and aesthetic regions.
- `Seed`: generation recipe derived from clusters, references, and board philosophy.
- `Artifact`: standalone HTML output with metadata, preview, lineage, source seed, and static file paths.

Data should be stored in versioned JSON fixtures and static asset folders so the demo remains easy to inspect, fork, and regenerate.

## Extraction Strategy

The first public demo should not depend on runtime AI. Codex can perform an offline extraction pass before launch by helping transform private image folders into rich board metadata. That metadata can include visual tags, semantic tags, motifs, composition notes, aesthetic axes, suggested artifact families, seed recipes, and cluster summaries.

The shipped demo includes only:

- Placeholder or abstracted reference thumbnails.
- Metadata derived from private sources.
- Precompiled clusters, graph data, seeds, and artifacts.
- Documentation explaining how the local extraction pipeline would refresh the dataset.

Later local users can plug in a real VLM/LLM extractor, but the app must work without one.

## Generation Strategy

Artifact renderers should be deterministic and template-based. Seeds produce parameterized HTML/CSS/canvas/SVG artifacts. Workbench controls mutate parameters locally. Prebuilt artifacts are shipped as static files so the gallery is impressive immediately.

Initial artifact families:

- Signal Graph
- Compression Dashboard
- Ritual Diagram
- Sourcebook Light Table
- Interface Panel
- Data Cartography
- Glyph Matrix
- Mutation Board

Artifacts must feel original and structurally derived from board DNA. They should not display private source images unless explicitly enabled in a future local-only mode.

## MVP Scope

Included in the first shippable version:

- Next.js app shell with AtlasSketch visual system.
- Demo Mode routing and static sample board loading.
- One or more precompiled sample boards.
- Placeholder reference thumbnails.
- Rich reference metadata, clusters, atlas graph, seeds, and artifact index.
- Boards, Library, Atlas, Workbench, and Artifacts sections.
- Deterministic artifact renderers for at least five families first.
- Static prebuilt artifact gallery.
- Workbench variant generation from shipped seeds.
- Repo documentation explaining the concept, demo mode, and local-first pipeline.

Deferred from the first shippable version:

- Pinterest connector.
- Public upload.
- Runtime AI extraction.
- Database.
- Auth.
- Server-side artifact persistence on Vercel.
- Multi-user storage.
- Paid or cloud features.

## Build Sequence

1. Create static data schema and sample board fixtures.
2. Build visual system and app shell.
3. Build Board Console and Library.
4. Build Atlas graph with inspector.
5. Build deterministic artifact renderer core.
6. Build Workbench controls and preview generation.
7. Build Artifact gallery and detail views.
8. Add documentation, polish, responsive checks, and Vercel-ready static behavior.
9. Use Codex offline to expand sample board metadata and placeholder assets from private references.

## Success Criteria

The first release succeeds when a visitor can open the deployed app, explore a compiled taste atlas, inspect placeholder reference metadata, navigate graph clusters, mutate seeds into interface-art variants, browse a rich artifact library, and understand the broader local-first pipeline from the documentation.

The deployment should be able to remain online with essentially no recurring runtime cost beyond static hosting. It should require no uploaded user files, no model calls, no database, and no server-side writes.
