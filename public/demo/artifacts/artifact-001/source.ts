export const artifactSource = {
  "id": "artifact-001",
  "title": "Meridian Signal Console",
  "renderedTitle": "Meridian Signal Console / Data Cartography v01",
  "boardSlug": "ritual-interfaces",
  "family": "data-cartography",
  "rendererVariant": 1,
  "seedId": "seed-signal-atlas",
  "lineage": {
    "seed": "seed-signal-atlas",
    "variant": "cartography-a",
    "derivedFrom": [
      "ref-001",
      "ref-002",
      "ref-003"
    ]
  },
  "referenceIds": [
    "ref-001",
    "ref-002",
    "ref-003"
  ],
  "clusterIds": [
    "cluster-signal-cartography"
  ],
  "tags": [
    "signal",
    "cartography",
    "telemetry"
  ],
  "motifs": [
    "axis cross",
    "signal comb",
    "thin halo"
  ],
  "palette": [
    {
      "name": "charcoal field",
      "hex": "#050706"
    },
    {
      "name": "terminal lime",
      "hex": "#b8ff6a"
    },
    {
      "name": "inspection cyan",
      "hex": "#62e6ff"
    }
  ],
  "staticPaths": {
    "html": "/demo/artifacts/artifact-001/index.html",
    "preview": "/demo/artifacts/artifact-001/preview.svg",
    "source": "/demo/artifacts/artifact-001/source.ts"
  }
} as const;
