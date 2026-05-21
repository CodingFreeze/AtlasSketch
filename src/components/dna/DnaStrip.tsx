import { cn } from "@/lib/cn";

type DnaStripProps = {
  tags: string[];
  palette: string[];
  density?: number;
  className?: string;
};

function normalizeDensity(density: number) {
  const percentage = density <= 1 ? density * 100 : density;

  return Math.max(0, Math.min(100, percentage));
}

export function DnaStrip({ tags, palette, density = 0.5, className }: DnaStripProps) {
  const signal = normalizeDensity(density);
  const signalWidth = Math.max(8, signal);
  const visibleTags = tags.slice(0, 4);
  const visiblePalette = palette.slice(0, 5);
  const densityLabel = `Signal density ${Math.round(signal)} percent`;
  const stripLabel = [
    visiblePalette.length ? `Palette with ${visiblePalette.length} colors` : "No palette colors",
    visibleTags.length ? `Tags ${visibleTags.join(", ")}` : "No tags"
  ].join(". ");

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 border-t border-atlas-line pt-2",
        className
      )}
    >
      <span className="sr-only">{stripLabel}</span>
      <div className="flex shrink-0 gap-1" aria-hidden="true">
        {visiblePalette.map((color) => (
          <span
            key={color}
            className="size-3 border border-atlas-line"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div
        aria-label={densityLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(signal)}
        className="h-3 w-16 shrink-0 border border-atlas-line"
        role="progressbar"
      >
        <div className="h-full bg-atlas-lime" style={{ width: `${signalWidth}%` }} />
      </div>
      <div className="flex min-w-0 gap-1 overflow-hidden">
        {visibleTags.map((tag) => (
          <span key={tag} className="truncate font-mono text-[10px] uppercase text-atlas-muted">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
