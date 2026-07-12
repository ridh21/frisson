"use client";

import { useState, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

type SourceFile = { name: string; code: string; html: string };

/**
 * The Preview / Code switcher. The live component is passed as `children` (so it
 * can be rendered on the server and streamed in), the source files come from
 * disk pre-highlighted. When a component spans multiple files, a small file
 * switcher appears.
 */
export function ShowcaseTabs({
  children,
  files,
  background,
  previewHref,
}: {
  children: ReactNode;
  files: SourceFile[];
  background?: string;
  previewHref: string;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [fileIndex, setFileIndex] = useState(0);

  const tabButton = (id: "preview" | "code", label: string) => (
    <button
      onClick={() => setTab(id)}
      className={[
        "relative rounded-md px-3 py-1.5 text-sm transition-colors",
        tab === id
          ? "font-medium text-[var(--ink)]"
          : "text-[var(--muted)] hover:text-[var(--ink)]",
      ].join(" ")}
    >
      {label}
      {tab === id && (
        <span className="absolute inset-x-3 -bottom-[9px] h-px bg-[var(--ink)]" />
      )}
    </button>
  );

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-2">
        <div className="flex items-center gap-1">
          {tabButton("preview", "Preview")}
          {tabButton("code", "Code")}
        </div>
        <a
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          Open in new tab
          <span aria-hidden>↗</span>
        </a>
      </div>

      {tab === "preview" ? (
        <div
          className={[
            "flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] px-6 py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(23,23,23,0.04)]",
            background ? "" : "preview-grid",
          ].join(" ")}
          style={background ? { background } : undefined}
        >
          {children}
        </div>
      ) : (
        <div>
          {files.length > 1 && (
            <div className="mb-2 flex gap-1">
              {files.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setFileIndex(i)}
                  className={[
                    "rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                    i === fileIndex
                      ? "bg-[rgba(23,23,23,0.06)] text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="font-mono text-xs text-[var(--muted)]">
              {files[fileIndex].name}
            </span>
          </div>
          <CodeBlock code={files[fileIndex].code} html={files[fileIndex].html} />
        </div>
      )}
    </div>
  );
}
