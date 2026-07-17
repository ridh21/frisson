"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { BLUR_DATA_URL } from "@/lib/blur";

/**
 * Case Studies — a hover-reactive index list, rebuilt from the case-studies
 * section on dineshsenapati.com in Next.js + Motion.
 *
 * Rest:  a quiet stack of rows (title + meta), nothing highlighted.
 * Hover: a translucent "pill" springs behind the hovered row — it doesn't
 *        fade in place, it *glides* from the previous row to the new one
 *        (its width/height morph to fit each row). At the same time a framed
 *        preview card slides in from the right, springs vertically to line up
 *        with whatever row you're on, and cross-fades its image as you move
 *        between neighbours. On mouse-leave the pill fades and the card
 *        retracts.
 *
 * Everything is measured from the live DOM, so it adapts to any row heights or
 * copy length. Swap `ITEMS` for your own — the motion stays the same.
 */

type Study = {
  title: string;
  meta: string;
  /** Any image URL — screenshots look best at ~16:10. */
  image: string;
};

const ITEMS: Study[] = [
  {
    title: "Building a High-Velocity Onboarding Engine",
    meta: "2024 · UX · Cross functional · Research",
    image: "https://picsum.photos/seed/onboarding/640/400",
  },
  {
    title: "Offers That Convert",
    meta: "2024 · UX · Product Strategy",
    image: "https://picsum.photos/seed/offers/640/400",
  },
  {
    title: "Trivia Scaling 0-1",
    meta: "2021 · UX · Product Thinking",
    image: "https://picsum.photos/seed/trivia/640/400",
  },
  {
    title: "Rethinking the Payments Dashboard",
    meta: "2023 · UX · Design Systems",
    image: "https://picsum.photos/seed/dashboard/640/400",
  },
];

// The framed preview card's width, its (estimated) height for vertical
// centring, and the gap it leaves after the row's text.
const CARD_W = 300;
const CARD_H = 193; // ≈ image at 16:10 inside the p-1 frame
const CARD_GAP = 20;

// A single, shared spring so the pill and the preview feel like one gesture.
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

type Rect = { top: number; left: number; width: number; height: number };

export default function CaseStudies() {
  const [active, setActive] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [pill, setPill] = useState<Rect>({ top: 0, left: 0, width: 0, height: 0 });
  const [card, setCard] = useState({ x: 0, y: 0 });

  // Measure the row the moment it's hovered (synchronously, before the card
  // renders) so the pill morphs to fit it and the card lands at the right spot
  // instead of flying in. The card tracks the row's right edge (x) and centre
  // (y), so short rows pull it in close and long rows push it out.
  const focusRow = useCallback((i: number) => {
    const row = rowRefs.current[i];
    const list = listRef.current;
    const stage = stageRef.current;
    if (row && list && stage) {
      const rr = row.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      setPill({
        top: rr.top - lr.top,
        left: rr.left - lr.left,
        width: rr.width,
        height: rr.height,
      });
      const centre = rr.top + rr.height / 2 - sr.top;
      const maxY = Math.max(0, sr.height - CARD_H);
      setCard({
        x: rr.right - sr.left + CARD_GAP,
        y: Math.min(maxY, Math.max(0, centre - CARD_H / 2)),
      });
    }
    setActive(i);
  }, []);

  return (
    <div
      ref={stageRef}
      className="group/list relative flex items-start gap-3"
      onMouseLeave={() => setActive(null)}
    >
      {/* The list — width shrinks to its content, so the pill can morph to each
          row's own width as you move between them. ------------------------- */}
      <div ref={listRef} className="relative -mx-4 w-fit shrink-0">
        {/* the spring pill, behind the rows */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-xl border border-zinc-200/70 bg-white/60 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10"
          initial={false}
          animate={{
            top: pill.top,
            left: pill.left,
            width: pill.width,
            height: pill.height,
            opacity: active == null ? 0 : 1,
          }}
          transition={{ ...SPRING, opacity: { duration: 0.2 } }}
        />

        <div className="relative z-10 flex flex-col items-start gap-1">
          {ITEMS.map((item, i) => (
            <button
              key={item.title}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              type="button"
              onMouseEnter={() => focusRow(i)}
              onFocus={() => focusRow(i)}
              className="flex w-fit flex-col gap-1 rounded-xl px-4 py-3 text-left outline-none"
            >
              <span
                className={[
                  "text-[15px] font-medium transition-colors duration-200",
                  active === i
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400",
                ].join(" ")}
              >
                {item.title}
              </span>
              <span className="text-[13px] text-zinc-400 dark:text-zinc-500">
                {item.meta}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Spacer: reserves room to the right so the stage stays wide enough for
          the (absolutely-positioned) preview card. ------------------------- */}
      <div
        aria-hidden
        className="hidden shrink-0 md:block"
        style={{ width: CARD_W + CARD_GAP }}
      />

      {/* The preview — absolute within the stage, springing on BOTH axes so it
          glides to sit just past the hovered row's text. ------------------- */}
      <AnimatePresence>
        {active != null && (
          <motion.div
            className="absolute left-0 top-0 z-20 hidden flex-col rounded-2xl border border-zinc-200 bg-white p-1 shadow-[0_12px_40px_-12px_rgba(23,23,23,0.25)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] md:flex"
            style={{ width: CARD_W }}
            initial={{ opacity: 0, scale: 0.96, x: card.x, y: card.y }}
            animate={{ opacity: 1, scale: 1, x: card.x, y: card.y }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={SPRING}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Image
                    src={ITEMS[active].image}
                    alt={ITEMS[active].title}
                    fill
                    sizes={`${CARD_W}px`}
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
