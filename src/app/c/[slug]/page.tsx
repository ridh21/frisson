import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry, getMeta } from "@/registry";
import { componentMap } from "@/registry/components";
import { readSource } from "@/lib/read-source";
import { highlight } from "@/lib/highlight";
import { ShowcaseTabs } from "@/components/site/ShowcaseTabs";

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
    title: meta ? `${meta.name} — Frisson` : "Frisson",
    description: meta?.description,
  };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getMeta(slug);
  const Component = componentMap[slug];
  if (!meta || !Component) notFound();

  const files = await Promise.all(
    meta.files.map(async (f) => {
      const code = await readSource(f.path);
      return { name: f.name, code, html: await highlight(code, "tsx") };
    }),
  );

  const installCmd = meta.dependencies.length
    ? `npm i ${meta.dependencies.join(" ")}`
    : "No extra dependencies";

  return (
    <article className="mx-auto max-w-[820px]">
      <header>
        <h1 className="font-serif text-4xl tracking-tight sm:text-[2.75rem]">
          {meta.name}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[var(--muted)]">
          {meta.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {meta.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--muted)]"
            >
              {t}
            </span>
          ))}
          <span className="mx-1 h-3 w-px bg-[var(--line)]" />
          {meta.dependencies.map((d) => (
            <span
              key={d}
              className="rounded-full bg-[rgba(23,23,23,0.06)] px-2.5 py-0.5 font-mono text-xs text-[var(--ink)]"
            >
              {d}
            </span>
          ))}
        </div>
      </header>

      <ShowcaseTabs
        files={files}
        background={meta.background}
        previewHref={`/preview/${meta.slug}`}
      >
        <Component />
      </ShowcaseTabs>

      <section className="mt-14">
        <h2 className="font-serif text-2xl tracking-tight">Use it</h2>
        <ol className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--ink)]">
          <li>
            <span className="mr-1 font-mono text-xs text-[var(--muted)]">01</span>{" "}
            Install the dependencies:
            <div className="mt-2 w-fit rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[13px]">
              {installCmd}
            </div>
          </li>
          <li>
            <span className="mr-1 font-mono text-xs text-[var(--muted)]">02</span>{" "}
            Copy{" "}
            <code className="rounded bg-[rgba(23,23,23,0.06)] px-1.5 py-0.5 font-mono text-[13px]">
              {meta.files[0].name}
            </code>{" "}
            from the <strong>Code</strong> tab into your project.
          </li>
          <li>
            <span className="mr-1 font-mono text-xs text-[var(--muted)]">03</span>{" "}
            Import it and drop it in — swap the placeholder images for your own.
          </li>
        </ol>

        {/* shadcn registry teaser */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-4 py-3.5">
          <span className="mt-0.5 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            Soon
          </span>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            <span className="font-medium text-[var(--ink)]">
              shadcn registry support is coming soon.
            </span>{" "}
            You&apos;ll be able to install any Frisson component in one line —{" "}
            <code className="rounded bg-[rgba(23,23,23,0.06)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--ink)]">
              npx shadcn@latest add {meta.slug}
            </code>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
