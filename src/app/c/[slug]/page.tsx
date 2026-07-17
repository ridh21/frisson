import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { registry, getMeta, REGISTRY_NAMESPACE } from "@/registry";
import { componentMap } from "@/registry/components";
import { readSource } from "@/lib/read-source";
import { highlight } from "@/lib/highlight";
import { ShowcaseTabs } from "@/components/site/ShowcaseTabs";
import { InstallCommand } from "@/components/site/InstallCommand";

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
              className="rounded-full bg-[var(--hover)] px-2.5 py-0.5 font-mono text-xs text-[var(--ink)]"
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
        <h2 className="font-serif text-2xl tracking-tight">Install</h2>

        {/* shadcn CLI — the one-line path */}
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink)]">
          Add it to your project with the{" "}
          <a
            href="https://ui.shadcn.com/docs/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--line)] underline-offset-2 hover:decoration-[var(--ink)]"
          >
            shadcn CLI
          </a>
          . Its files, the{" "}
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[13px]">
            blur.ts
          </code>{" "}
          helper
          {meta.dependencies.length ? (
            <>
              , and{" "}
              {meta.dependencies.map((d, i) => (
                <span key={d}>
                  {i > 0 && ", "}
                  <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[13px]">
                    {d}
                  </code>
                </span>
              ))}
            </>
          ) : null}{" "}
          are pulled in automatically:
        </p>
        <div className="mt-3">
          <InstallCommand
            command={`npx shadcn@latest add ${REGISTRY_NAMESPACE}/${meta.slug}`}
          />
        </div>
        <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--muted)]">
          Requires a shadcn-initialized project — run{" "}
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[12px]">
            npx shadcn@latest init
          </code>{" "}
          first if you haven&apos;t. Works with{" "}
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[12px]">
            pnpm
          </code>
          ,{" "}
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[12px]">
            yarn
          </code>
          , and{" "}
          <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[12px]">
            bun
          </code>{" "}
          too.
        </p>

        {/* Manual fallback */}
        <h3 className="mt-8 text-sm font-medium text-[var(--ink)]">
          Or copy it by hand
        </h3>
        <ol className="mt-3 space-y-4 text-[15px] leading-relaxed text-[var(--ink)]">
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
            {meta.files.map((f, i) => (
              <span key={f.name}>
                {i > 0 && " and "}
                <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[13px]">
                  {f.name}
                </code>
              </span>
            ))}{" "}
            from the <strong>Code</strong> tab into your project.
          </li>
          <li>
            <span className="mr-1 font-mono text-xs text-[var(--muted)]">03</span>{" "}
            Import it and drop it in — swap the placeholder images for your own.
          </li>
        </ol>
      </section>
    </article>
  );
}
