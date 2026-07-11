import { createHighlighter, type Highlighter } from "shiki";

/**
 * A single shared Shiki highlighter, created lazily and reused across requests.
 * Highlighting happens on the server (at build time for static pages), so the
 * client ships zero highlighting JS — just pre-rendered, coloured markup.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["vitesse-light"],
      langs: ["tsx", "typescript", "bash", "json", "css"],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang = "tsx"): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, {
    lang,
    theme: "vitesse-light",
  });
}
