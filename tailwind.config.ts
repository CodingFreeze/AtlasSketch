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
        sans: ["var(--font-atlas-sans)", "Arial", "sans-serif"],
        mono: ["var(--font-atlas-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
