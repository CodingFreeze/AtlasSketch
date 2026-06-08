# AtlasSketch

AtlasSketch is a static-cost public showcase for a private, local-first taste atlas. It turns precompiled board data into explorable metadata, cluster graphs, deterministic seed mutations, and standalone interface-art artifacts without public uploads, runtime AI calls, a database, or server-side writes.

The current demo ships one compiled board, **Ritual Interfaces**, with public-safe placeholder references, clusters, seeds, an interactive atlas, a deterministic workbench, and a static artifact gallery.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`.

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Demo Routes

- `/` - board console
- `/boards/ritual-interfaces` - board overview
- `/boards/ritual-interfaces/library` - placeholder reference library
- `/boards/ritual-interfaces/atlas` - interactive atlas graph
- `/boards/ritual-interfaces/workbench` - deterministic seed workbench
- `/boards/ritual-interfaces/artifacts` - static artifact gallery

## Static Hosting Model

AtlasSketch is designed to be cheap to keep online:

- Static JSON fixtures live in `src/data/demo`.
- Placeholder reference SVGs live in `public/demo/placeholders`.
- Prebuilt artifact HTML, previews, and source manifests live in `public/demo/artifacts`.
- Workbench variants are generated in the browser from deterministic seed parameters.
- The public demo does not expose private Pinterest/source images.

`next build` pre-renders the board routes and serves the shipped artifacts as static files, making the app suitable for Vercel or any comparable static-first Next.js host.

## Local-First Pipeline

The public demo is the safe output of an offline workflow:

```txt
Private reference exports
  -> local extraction pass
  -> public-safe placeholder assets
  -> board DNA JSON
  -> clusters, graph, seeds, and artifacts
  -> static demo bundle
```

See `docs/ATLAS_PIPELINE.md` for the data boundaries, refresh process, and future Local Studio direction.

## License

Released under the [MIT License](LICENSE).
