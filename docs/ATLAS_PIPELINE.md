# AtlasSketch Pipeline

AtlasSketch separates private creative source material from the public demo bundle. The deployed app should only contain derived metadata, abstract placeholder assets, deterministic seed recipes, and prebuilt artifact outputs.

## Public Demo Boundary

The public repository may include:

- Board manifests and counts.
- Reference metadata derived from private material.
- Placeholder or abstracted reference thumbnails.
- Cluster summaries, motif tags, palette families, graph nodes, and graph edges.
- Deterministic seeds and mutation parameters.
- Static artifact HTML, SVG previews, and source manifests.

The public repository must not include:

- Original Pinterest exports or source images.
- Private boards, user uploads, or raw collection dumps.
- API keys, model credentials, database URLs, or paid-service configuration.
- Runtime model calls, public upload flows, auth, or server-side persistence.

## Demo Data Layout

`src/data/demo/boards.json` lists available boards.

Each board has a versioned fixture folder under `src/data/demo/<board-slug>/`:

- `manifest.json` - board identity, philosophy, stats, palette, and public paths.
- `references.json` - public-safe reference blocks and extracted metadata.
- `clusters.json` - aesthetic regions and suggested seeds.
- `atlas.json` - graph nodes and edges.
- `seeds.json` - deterministic generation recipes.
- `artifacts.json` - gallery records and static output paths.

Static public assets live under:

- `public/demo/placeholders/`
- `public/demo/artifacts/`

## Refresh Workflow

1. Keep source exports outside the public app tree.
2. Run a local extraction pass against private images or folders.
3. Write only public-safe metadata into the board fixture JSON files.
4. Generate or update abstract placeholder thumbnails.
5. Compile clusters, graph edges, seeds, and artifact records.
6. Render deterministic artifacts into `public/demo/artifacts/<artifact-id>/`.
7. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
8. Review the diff for secrets and private-source leakage before publishing.

The current demo relies on an offline extraction and authoring step run by hand. A future Local Studio mode can replace that with a dedicated VLM/LLM extractor, but the public app should remain static and read-only.

## Artifact Rendering

Artifact families are template renderers in `src/domain/renderers`. They accept seed parameters and produce deterministic HTML/CSS/SVG output. The workbench mutates seed parameters locally, while the gallery links to prebuilt standalone artifacts.

Renderer output should stay deterministic, escaped, and bounded:

- Coerce numeric parameters before use.
- Whitelist or validate color values.
- Escape text before injecting it into HTML.
- Avoid network-dependent assets in standalone outputs.

## Deployment Notes

AtlasSketch is intended for static-first hosting. There is no database migration, no runtime queue, and no model provider setup for the public demo. A successful deployment should be reproducible from the committed fixtures and public assets alone.
