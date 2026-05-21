import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "neutral" | "lime" | "cyan" | "red";
};

const toneClasses = {
  neutral: "text-atlas-paper",
  lime: "text-atlas-lime",
  cyan: "text-atlas-cyan",
  red: "text-atlas-red"
} as const;

export function Stat({ className, detail, label, tone = "neutral", value, ...props }: StatProps) {
  return (
    <div className={cn("min-w-0 border-l border-atlas-line pl-3", className)} {...props}>
      <dt className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
        {label}
      </dt>
      <dd className={cn("mt-1 font-mono text-xl font-semibold tabular-nums", toneClasses[tone])}>
        {value}
      </dd>
      {detail && <p className="mt-1 truncate text-xs text-atlas-muted">{detail}</p>}
    </div>
  );
}
