import { cn } from "@/lib/cn";

type DnaStripProps = {
  tags: string[];
  palette: string[];
  density?: number;
  className?: string;
};

export function DnaStrip({ tags, palette, density = 0.5, className }: DnaStripProps) {
  const signal = Math.max(8, Math.min(100, density * 100));

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 border-t border-atlas-line pt-2",
        className
      )}
    >
      <div className="flex shrink-0 gap-1" aria-label="Palette">
        {palette.slice(0, 5).map((color) => (
          <span
            key={color}
            className="size-3 border border-atlas-line"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div
        className="h-3 w-16 shrink-0 border border-atlas-line"
        aria-label={`Signal density ${Math.round(signal)} percent`}
      >
        <div className="h-full bg-atlas-lime" style={{ width: `${signal}%` }} />
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
