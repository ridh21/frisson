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

| Component | What it does |
| --- | --- |
| **Polaroid Gallery** | A fanned row of polaroids that straighten and lift on hover with a per-character caption reveal, plus a click-to-preview lightbox that grows from the card's exact position. |

## Using a component

Every component is self-contained. From its page:

1. Install its dependencies (shown under **Use it**, e.g. `npm i motion`).
2. Copy the file from the **Code** tab into your project.
3. Import it and swap the placeholder images for your own.

## Adding a component

The registry is the single source of truth — no build step, no manifest to
regenerate.

1. Drop your component in `src/components/`, e.g. `YourThing.tsx`.
2. Add a metadata entry to [`src/registry/index.ts`](src/registry/index.ts)
   (slug, name, description, tags, dependencies, source file paths).
3. Map the slug to the component in
   [`src/registry/components.tsx`](src/registry/components.tsx).

That's it — the sidebar, routes, preview, and code tab all pick it up
automatically.

## Tech

- [Next.js](https://nextjs.org) (App Router)
- [Motion](https://motion.dev)
- [Tailwind CSS](https://tailwindcss.com) v4

## License

[MIT](LICENSE) © Ridham Patel
