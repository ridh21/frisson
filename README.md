# Frisson

**That little shiver of delight.**

An open-source collection of finely detailed micro-interaction components for
Next.js, built with [Motion](https://motion.dev). Browse each one in a live
showcase, read the source, and copy it straight into your project.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- `/` — landing page with a live taste of the featured component.
- `/c/[slug]` — the showcase: a sidebar to switch components, a **Preview**
  canvas, and a **Code** tab (source read straight off disk, with copy).

## Components

| Component | Install | What it does |
| --- | --- | --- |
| **Polaroid Gallery** | `polaroid-gallery` | A fanned row of polaroids that straighten and lift on hover with a per-character caption reveal, plus a click-to-preview lightbox that grows from the card's exact position. |
| **Case Studies** | `case-studies` | A hover-reactive index list: a translucent pill springs behind the active row while a framed preview card slides in from the right and cross-fades between neighbours. |
| **Avatar Stack** | `avatar-stack` | A profile avatar that's secretly a deck of photos — hover peeks them out, click deals them into a dock-style row, click again to restack. |

## Installing a component

Frisson is published as a [shadcn registry](https://ui.shadcn.com/docs/registry/github)
straight from this GitHub repo. In any shadcn-initialized project, add a
component in one line:

```bash
npx shadcn@latest add ridh21/frisson/avatar-stack
```

Swap `avatar-stack` for any name in the table above. The CLI pulls in the
component, the shared `blur.ts` helper, and any npm dependencies (e.g. `motion`)
automatically, rewriting `@/` imports to match your project's aliases.

> New to shadcn? Run `npx shadcn@latest init` once first. You can pin a version
> with `#<branch>`, `#<tag>`, or `#<commit>`, e.g. `…/avatar-stack#main`.

**Prefer to copy by hand?** Every component page has a **Code** tab — install
the listed dependencies, copy the file(s) in, and swap the placeholder images
for your own.

## Adding a component

The registry is the single source of truth — no build step for the site.

1. Drop your component in `src/components/`, e.g. `YourThing.tsx`.
2. Add a metadata entry to [`src/registry/index.ts`](src/registry/index.ts)
   (slug, name, description, tags, dependencies, source file paths).
3. Map the slug to the component in
   [`src/registry/components.tsx`](src/registry/components.tsx).
4. Add a matching item to [`registry.json`](registry.json) so the shadcn CLI can
   distribute it (name, title, description, `dependencies`, and its `files` —
   include `src/lib/blur.ts` if the component uses it).

The sidebar, routes, preview, and code tab pick up steps 1–3 automatically;
step 4 makes it installable via `npx shadcn@latest add`.

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Motion](https://motion.dev)
- [Tailwind CSS](https://tailwindcss.com) v4

## License

[MIT](LICENSE) © Ridham Patel
