import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type HeadingElement = "h2" | "h3" | "h4" | "h5" | "h6";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "aside" | "section" | "div";
  eyebrow?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  headingAs?: HeadingElement;
};

export function Panel({
  as: Component = "section",
  children,
  className,
  eyebrow,
  title,
  actions,
  headingAs: Heading = "h2",
  ...props
}: PanelProps) {
  return (
    <Component
      className={cn(
        "rounded border border-atlas-line bg-atlas-panel/85 p-4 shadow-[0_0_0_1px_rgba(244,232,205,0.02)]",
        className
      )}
      {...props}
    >
      {(eyebrow || title || actions) && (
        <div className="mb-3 flex min-w-0 items-start justify-between gap-3 border-b border-atlas-line pb-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-atlas-muted">
                {eyebrow}
              </p>
            )}
            {title && (
              <Heading className="mt-1 text-balance font-mono text-sm font-semibold uppercase tracking-[0.12em] text-atlas-paper">
                {title}
              </Heading>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Component>
  );
}
