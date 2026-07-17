"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/registry";
import { ThemeToggle } from "./ThemeToggle";

const GITHUB_URL = "https://github.com/ridh21/frisson";

/**
 * The persistent left rail: wordmark, the switchable list of components, and a
 * quiet footer. Warm, thin-bordered, lots of air.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 px-6 py-8 sm:sticky sm:top-0 sm:h-dvh sm:w-[240px] sm:py-10">
      <div className="flex items-start justify-between gap-3">
        <Link href="/" className="group inline-flex flex-col">
          <span className="font-serif text-[28px] leading-none tracking-tight">
            Frisson
          </span>
          <span className="mt-1 text-xs text-[var(--muted)]">
            micro-interactions
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto sm:flex-col">
        <p className="hidden px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)] sm:block">
          Components
        </p>
        {registry.map((c) => {
          const active = pathname === `/c/${c.slug}`;
          return (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className={[
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-[var(--hover)] font-medium text-[var(--ink)]"
                  : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-2 text-xs text-[var(--muted)] sm:flex">
        <a
          href="https://ui.shadcn.com/docs/registry/github"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--line)] px-2 py-0.5 transition-colors hover:text-[var(--ink)]"
        >
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          shadcn registry
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit transition-colors hover:text-[var(--ink)]"
        >
          GitHub ↗
        </a>
        <span>Open source · MIT</span>
      </div>
    </aside>
  );
}
