import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry, getMeta } from "@/registry";
import { componentMap } from "@/registry/components";
import { ThemeToggle } from "@/components/site/ThemeToggle";

export function generateStaticParams() {
  return registry.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getMeta(slug);
  return {
    title: meta ? `${meta.name} — preview` : "Preview",
    description: meta?.description,
  };
}

/**
 * A chrome-free, full-window stage for a single component — no sidebar, no
 * tabs. Opened in a new tab from the showcase so the interaction can breathe at
 * true viewport size (and the lightbox can use the whole screen).
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getMeta(slug);
  const Component = componentMap[slug];
  if (!meta || !Component) notFound();

  return (
    <>
      <Link
        href={`/c/${slug}`}
        className="fixed left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-1.5 text-xs text-[var(--muted)] backdrop-blur transition-colors hover:text-[var(--ink)]"
      >
        <span aria-hidden>←</span>
        <span className="font-serif text-sm text-[var(--ink)]">Frisson</span>
        <span className="text-[var(--line)]">/</span>
        {meta.name}
      </Link>

      <div className="fixed right-5 top-5 z-10">
        <ThemeToggle className="bg-[var(--panel)]/80 backdrop-blur" />
      </div>

      <main
        className={[
          "flex min-h-dvh w-full items-center justify-center px-6 py-20",
          meta.background ? "" : "preview-grid",
        ].join(" ")}
        style={meta.background ? { background: meta.background } : undefined}
      >
        <Component />
      </main>
    </>
  );
}
