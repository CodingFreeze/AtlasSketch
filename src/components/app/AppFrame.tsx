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
  if (!board) {
    return [{ label: "Boards", href: "/", key: "boards", Icon: CircuitBoard, planned: false }] as const;
  }

  const boardBase = `/boards/${board.slug}`;
  return [
    { label: "Boards", href: boardBase, key: "boards", Icon: CircuitBoard, planned: false },
    { label: "Library", href: `${boardBase}/library`, key: "library", Icon: Library, planned: false },
    { label: "Atlas", href: `${boardBase}/atlas`, key: "atlas", Icon: Network, planned: false },
    {
      label: "Workbench",
      href: `${boardBase}/workbench`,
      key: "workbench",
      Icon: FlaskConical,
      planned: false
    },
    {
      label: "Artifacts",
      href: `${boardBase}/artifacts`,
      key: "artifacts",
      Icon: Archive,
      planned: false
    }
  ] as const;
}

export function AppFrame({ activeSection = "boards", board, children }: AppFrameProps) {
  const nav = buildNav(board);

  return (
    <div className="min-h-dvh overflow-x-clip bg-atlas-black text-atlas-paper">
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
            {nav.map(({ Icon, key, label, planned, ...item }) => {
              const className = cn(
                "inline-flex h-9 shrink-0 items-center gap-2 border px-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                planned
                  ? "cursor-not-allowed border-atlas-line bg-atlas-panel/40 text-atlas-muted/55"
                  : "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan",
                activeSection === key && !planned
                  ? "border-atlas-lime bg-atlas-lime/10 text-atlas-lime"
                  : !planned && "border-atlas-line bg-atlas-panel/70 text-atlas-muted hover:border-atlas-cyan hover:text-atlas-cyan"
              );
              const content = (
                <>
                  <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
                  {label}
                  {planned && <span className="text-[9px] tracking-[0.12em]">Planned</span>}
                </>
              );

              if (planned || !("href" in item)) {
                return (
                  <span aria-disabled="true" className={className} key={key}>
                    {content}
                  </span>
                );
              }

              return (
                <Link
                  aria-current={activeSection === key ? "page" : undefined}
                  className={className}
                  href={item.href}
                  key={key}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-5 lg:px-6">{children}</main>
    </div>
  );
}
