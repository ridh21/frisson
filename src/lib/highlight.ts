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
      themes: ["vitesse-light", "vitesse-dark"],
      langs: ["tsx", "typescript", "bash", "json", "css"],
    });
  }
  return highlighterPromise;
}

export async function highlight(code: string, lang = "tsx"): Promise<string> {
  const highlighter = await getHighlighter();
  // Dual themes: each token gets a light colour plus a `--shiki-dark` CSS var,
  // which globals.css swaps to under `.dark`. One render serves both themes.
  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: "light",
  });
}
