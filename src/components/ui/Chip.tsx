import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "lime" | "cyan" | "red" | "magenta";
};

const toneClasses = {
  neutral: "border-atlas-line bg-atlas-panel text-atlas-muted",
  lime: "border-atlas-lime/50 bg-atlas-lime/10 text-atlas-lime",
  cyan: "border-atlas-cyan/50 bg-atlas-cyan/10 text-atlas-cyan",
  red: "border-atlas-red/50 bg-atlas-red/10 text-atlas-red",
  magenta: "border-atlas-magenta/50 bg-atlas-magenta/10 text-atlas-magenta"
} as const;

export function Chip({ className, tone = "neutral", ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded border px-2 py-1 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.14em]",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
