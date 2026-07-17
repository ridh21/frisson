import Link from "next/link";
import PolaroidGallery from "@/components/PolaroidGallery";
import { firstSlug, registry, REGISTRY_NAMESPACE } from "@/registry";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const GITHUB_URL = "https://github.com/ridh21/frisson";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1000px] flex-col px-6 py-10 sm:py-14">
      <header className="flex items-center justify-between">
        <span className="font-serif text-xl tracking-tight">Frisson</span>
        <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
          <Link
            href={`/c/${firstSlug}`}
            className="transition-colors hover:text-[var(--ink)]"
          >
            Components
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--ink)]"
          >
            GitHub ↗
          </a>
          <ThemeToggle />
        </nav>
      </header>

      <section className="mt-20 sm:mt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--muted)]">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          v0.1 · open source · MIT
        </span>
        <h1 className="mt-5 max-w-[16ch] font-serif text-5xl leading-[1.03] tracking-tight sm:text-[5.5rem]">
          That little shiver of delight.
        </h1>
        <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-[var(--muted)]">
          An open-source collection of finely detailed micro-interaction
          components for Next.js, built with Motion. Preview each one, read the
          source, copy it into your project.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/c/${firstSlug}`}
            className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
          >
            Explore components →
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Star on GitHub
          </a>
        </div>
      </section>

      {/* a live taste of the first component */}
      <section className="mt-20 flex flex-col items-center">
        <Link
          href={`/c/${firstSlug}`}
          className="preview-grid flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] px-6 py-24 transition-colors hover:border-[rgba(23,23,23,0.2)]"
        >
          <PolaroidGallery />
        </Link>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {registry[0]?.name} — hover a card, then click to preview.
        </p>
      </section>

      <section className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="max-w-[46ch] text-sm text-[var(--muted)]">
          <span className="text-[var(--ink)]">Install any component</span> with
          the shadcn CLI — one line, dependencies and all.
        </p>
        <code className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-1.5 font-mono text-[13px] text-[var(--ink)]">
          npx shadcn@latest add {REGISTRY_NAMESPACE}/{firstSlug}
        </code>
      </section>

      <footer className="mt-auto pt-24 text-xs text-[var(--muted)]">
        Open source · MIT · built with Next.js + Motion
      </footer>
    </main>
  );
}
