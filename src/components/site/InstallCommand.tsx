"use client";

import { useState } from "react";

/**
 * A single-line, copyable shell command — used for the shadcn CLI install
 * snippet on each component page. Mirrors the copy affordance in `CodeBlock`
 * but sized for one inline command.
 */
export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] py-2 pl-3.5 pr-2">
      <span aria-hidden className="select-none font-mono text-[13px] text-[var(--muted)]">
        $
      </span>
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-[var(--ink)]">
        {command}
      </code>
      <button
        onClick={copy}
        aria-label="Copy install command"
        className="shrink-0 rounded-md border border-[var(--line)] bg-[var(--bg)]/90 px-2.5 py-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
