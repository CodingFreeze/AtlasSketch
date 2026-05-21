export default function Home() {
  return (
    <main className="min-h-dvh bg-atlas-black px-6 py-8 text-atlas-paper">
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl flex-col justify-center border border-atlas-line bg-atlas-panel/70 p-8 shadow-[0_0_48px_rgba(98,230,255,0.08)]">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-atlas-cyan">
          Static public demo
        </p>
        <h1 className="mt-4 font-mono text-5xl font-semibold text-atlas-lime md:text-7xl">
          AtlasSketch
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-atlas-paper/80 md:text-lg">
          Board Console arrives in Task 4.
        </p>
      </section>
    </main>
  );
}
