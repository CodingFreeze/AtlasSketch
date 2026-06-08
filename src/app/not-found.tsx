import Link from "next/link";
import { Boxes, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-atlas-black px-6 text-atlas-paper">
      <div className="grid max-w-md gap-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center border border-atlas-lime bg-atlas-lime/10 text-atlas-lime">
          <Boxes aria-hidden="true" size={22} strokeWidth={1.8} />
        </span>

        <div className="grid gap-2">
          <p className="font-mono text-5xl font-semibold tracking-[0.18em] text-atlas-lime">404</p>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-atlas-muted">
            Off the atlas
          </h1>
          <p className="text-sm leading-6 text-atlas-paper/72">
            That coordinate is not on any compiled board. Head back to the console to pick up a
            known signal.
          </p>
        </div>

        <Link
          className="mx-auto inline-flex h-10 items-center gap-2 rounded border border-atlas-line bg-atlas-panel px-4 font-mono text-xs font-medium uppercase tracking-[0.14em] text-atlas-muted transition-colors hover:border-atlas-lime hover:text-atlas-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan"
          href="/"
        >
          <MoveLeft aria-hidden="true" size={14} />
          Back to board console
        </Link>
      </div>
    </main>
  );
}
