import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Boxes, CircuitBoard, FlaskConical, Library, Network } from "lucide-react";

import type { Board } from "@/domain/types";
import { cn } from "@/lib/cn";

type AppFrameProps = {
  children: ReactNode;
  board?: Board;
  activeSection?: "boards" | "library" | "atlas" | "workbench" | "artifacts";
};

function buildNav(board?: Board) {
  const boardBase = board ? `/boards/${board.slug}` : "/";

  return [
    { label: "Boards", href: boardBase, key: "boards", Icon: CircuitBoard },
    { label: "Library", href: board ? `${boardBase}/library` : "/library", key: "library", Icon: Library },
    { label: "Atlas", href: board ? `${boardBase}/atlas` : "/atlas", key: "atlas", Icon: Network },
    {
      label: "Workbench",
      href: board ? `${boardBase}/workbench` : "/workbench",
      key: "workbench",
      Icon: FlaskConical
    },
    {
      label: "Artifacts",
      href: board ? `${boardBase}/artifacts` : "/artifacts",
      key: "artifacts",
      Icon: Archive
    }
  ] as const;
}

export function AppFrame({ activeSection = "boards", board, children }: AppFrameProps) {
  const nav = buildNav(board);

  return (
    <div className="min-h-dvh bg-atlas-black text-atlas-paper">
      <header className="sticky top-0 z-20 border-b border-atlas-line bg-atlas-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link
            className="group flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-atlas-cyan"
            href="/"
          >
            <span className="flex size-9 shrink-0 items-center justify-center border border-atlas-lime bg-atlas-lime/10 text-atlas-lime">
              <Boxes aria-hidden="true" size={18} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-sm font-semibold uppercase tracking-[0.2em] text-atlas-lime">
                AtlasSketch
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-atlas-muted">
                {board ? `${board.title} / ${board.version}` : "Compiled taste atlas"}
              </span>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="flex min-w-0 gap-1 overflow-x-auto">
            {nav.map(({ href, Icon, key, label }) => (
              <Link
                aria-current={activeSection === key ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 border px-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan",
                  activeSection === key
                    ? "border-atlas-lime bg-atlas-lime/10 text-atlas-lime"
                    : "border-atlas-line bg-atlas-panel/70 text-atlas-muted hover:border-atlas-cyan hover:text-atlas-cyan"
                )}
                href={href}
                key={key}
              >
                <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6">{children}</main>
    </div>
  );
}
