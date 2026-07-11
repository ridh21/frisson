"use client";

import { useState } from "react";

/**
 * A read-only source view. Highlighting is done on the server with Shiki and
 * handed in as `html`; `code` is the raw text used for copy-to-clipboard.
 */
export function CodeBlock({ code, html }: { code: string; html: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]">
      <button
        onClick={copy}
        className="absolute right-3 top-3 z-10 rounded-md border border-[var(--line)] bg-[var(--bg)]/90 px-2.5 py-1 text-xs text-[var(--muted)] opacity-0 backdrop-blur transition-all hover:text-[var(--ink)] focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <div
        className="code-scroll max-h-[560px] overflow-auto text-[13px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
