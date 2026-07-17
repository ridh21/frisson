/**
 * The Frisson registry — the single source of truth for every micro-interaction
 * in the library. To add a component: drop its file in `src/components/`, add an
 * entry here, then map it to its React component in `registry/components.tsx`.
 *
 * This file holds only serializable metadata (no component imports), so it's
 * safe to pull into any client or server module — e.g. the sidebar — without
 * dragging component code along with it.
 */

export type ComponentFile = {
  /** Display name in the code tab, e.g. "polaroid-gallery.tsx". */
  name: string;
  /** Path from the repo root, read from disk to show the source. */
  path: string;
};

export type ComponentMeta = {
  /** URL-safe id, used in `/c/[slug]`. */
  slug: string;
  name: string;
  /** One or two sentences describing the interaction. */
  description: string;
  /** Short searchable facets, e.g. ["hover", "lightbox"]. */
  tags: string[];
  /** npm packages a consumer needs to install (besides React). */
  dependencies: string[];
  /** Source files that make up the component. */
  files: ComponentFile[];
  /** Optional CSS background for the preview canvas (defaults to warm paper). */
  background?: string;
};

export const registry: ComponentMeta[] = [
  {
    slug: "polaroid-gallery",
    name: "Polaroid Gallery",
    description:
      "A fanned row of polaroids that straighten and lift on hover with a per-character caption reveal, plus a click-to-preview lightbox that grows from the card's exact position and glides back on close.",
    tags: ["hover", "gallery", "lightbox", "stagger"],
    dependencies: ["motion"],
    files: [
      { name: "polaroid-gallery.tsx", path: "src/components/PolaroidGallery.tsx" },
      { name: "blur.ts", path: "src/lib/blur.ts" },
    ],
  },
  {
    slug: "case-studies",
    name: "Case Studies",
    description:
      "A hover-reactive index list: a translucent pill springs behind the active row, morphing to fit it, while a framed preview card slides in from the right, tracks the row you're on, and cross-fades its image as you move between neighbours.",
    tags: ["hover", "list", "spring", "preview"],
    dependencies: ["motion"],
    files: [
      { name: "case-studies.tsx", path: "src/components/CaseStudies.tsx" },
      { name: "blur.ts", path: "src/lib/blur.ts" },
    ],
  },
  {
    slug: "avatar-stack",
    name: "Avatar Stack",
    description:
      "A profile avatar that's secretly a deck of photos: the primary sits on a stack with name and title beneath. Hovering peeks the hidden photos out; clicking deals the deck open — the primary photo and name spring up to the top while the rest flick into a horizontal row below. In the row, hovering a photo pops it up dock-style while its neighbours lift. Click again to restack.",
    tags: ["hover", "click", "spring", "profile", "dock"],
    dependencies: [],
    files: [
      { name: "avatar-stack.tsx", path: "src/components/AvatarStack.tsx" },
      { name: "blur.ts", path: "src/lib/blur.ts" },
    ],
  },
];

/**
 * The `owner/repo` namespace under which Frisson is published as a shadcn
 * registry (see `registry.json` at the repo root). Consumers install any
 * component with `npx shadcn@latest add ${REGISTRY_NAMESPACE}/<slug>`.
 */
export const REGISTRY_NAMESPACE = "ridh21/frisson";

export function getMeta(slug: string): ComponentMeta | undefined {
  return registry.find((c) => c.slug === slug);
}

/** The slug shown first (landing CTA, default redirect). */
export const firstSlug = registry[0]?.slug ?? "";
