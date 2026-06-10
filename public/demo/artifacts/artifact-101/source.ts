export const artifactSource = {
  "id": "artifact-101",
  "title": "Tidal Gauge Console",
  "renderedTitle": "Tidal Gauge Console / interface-panel v001",
  "boardSlug": "tidal-cartography",
  "family": "interface-panel",
  "rendererVariant": 1,
  "seedId": "seed-tidal-gauges",
  "lineage": {
    "seed": "seed-tidal-gauges",
    "variant": "panel-a",
    "derivedFrom": [
      "ref-101",
      "ref-102",
      "ref-103"
    ]
  },
  "referenceIds": [
    "ref-101",
    "ref-102",
    "ref-103"
  ],
  "clusterIds": [
    "cluster-harmonic-gauges"
  ],
  "tags": [
    "harmonics",
    "gauge",
    "tide"
  ],
  "motifs": [
    "harmonic comb",
    "bearing rose",
    "datum notch"
  ],
  "palette": [
    {
      "name": "charcoal tide",
      "hex": "#04080d"
    },
    {
      "name": "sodium amber",
      "hex": "#ffb454"
    },
    {
      "name": "tide cyan",
      "hex": "#5cd0e6"
    }
  ],
  "staticPaths": {
    "html": "/demo/artifacts/artifact-101/index.html",
    "preview": "/demo/artifacts/artifact-101/preview.svg",
    "source": "/demo/artifacts/artifact-101/source.ts"
  }
} as const;
