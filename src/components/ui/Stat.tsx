import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatProps = ComponentPropsWithoutRef<"dl"> & {
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
    <dl className={cn("min-w-0 border-l border-atlas-line pl-3", className)} {...props}>
      <dt className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
        {label}
      </dt>
      <dd className={cn("mt-1 font-mono text-xl font-semibold tabular-nums", toneClasses[tone])}>
        {value}
        {detail && (
          <span className="mt-1 block truncate text-xs font-normal normal-case tracking-normal text-atlas-muted">
            {detail}
          </span>
        )}
      </dd>
    </dl>
  );
}
