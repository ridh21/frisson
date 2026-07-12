"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";

/**
 * A fanned row of Polaroid photos — a faithful rebuild of the "Off screen"
 * shelf on danielwhite.uk, in Next.js + Motion.
 *
 * Rest:  the cards overlap in a shallow arc, each tilted a few degrees.
 * Hover: ONLY the hovered card reacts — it straightens (0°), lifts a little,
 *        grows to 1.1, nudges itself outward, and jumps to the top of the
 *        stack. Its neighbours never move. On leave it slides straight back
 *        under its natural neighbours (the z-index drops instantly, so they
 *        overlap it again the moment the cursor goes).
 *        A caption bubble reveals above it, character by character
 *        (fade + rise + de-blur, staggered).
 * Click: the card gently scales up from its exact on-screen position into a
 *        centered preview (a big version of the same polaroid). Closing it
 *        (click / Escape) reverses the motion straight back to the origin.
 *
 * Geometry mirrors the reference, scaled by S for a comfortable size. Swap the
 * srcs for your own images in /public and everything else stays the same.
 */

type Photo = { src: string; alt: string; caption: string };

const PHOTOS: Photo[] = [
  { src: "https://picsum.photos/seed/fluffball/300/360", alt: "A fluffy dog on a bed", caption: "My cloud of fluff" },
  { src: "https://picsum.photos/seed/bigben/300/360", alt: "Big Ben at dusk", caption: "London GOATED view" },
  { src: "https://picsum.photos/seed/alleyway/300/360", alt: "A person in a narrow alley", caption: "that's me" },
  { src: "https://picsum.photos/seed/goodboy/300/360", alt: "A dog in golden light", caption: "the goodest boy" },
  { src: "https://picsum.photos/seed/moonshot/300/360", alt: "The moon in a dark sky", caption: "random pic of the moon" },
  { src: "https://picsum.photos/seed/italysun/300/360", alt: "A sunset over hills", caption: "sunset in Italy" },
  { src: "https://picsum.photos/seed/seaview/300/360", alt: "A coastline at night", caption: "beautiful sea view" },
];

// --- geometry (reference values × S) --------------------------------------
const S = 1.5; // overall scale of the reference component
const IMG_W = 100 * S;
const IMG_H = 120 * S;
const PAD = 6 * S; // paper padding: top/sides
const PAD_BOTTOM = 16 * S; // classic thick polaroid chin
const OVERLAP = 28 * S; // cards slide onto each other
const ROT_MAX = 14; // degrees at the outermost card (unscaled)
const ARC_Y = 8 * S; // outer cards hang this much lower (parabolic)
const LIFT = 12 * S; // hovered card rises
const SX_STEP = 8 * S; // hovered card nudges outward: offset × this
const SPREAD = 16 * S; // neighbours gently ease apart to make room for the
//                        hovered card; the push falls off with distance
const HIT_BLEED = 4 * S; // hover hit-area bleed (sides/top)
const HIT_BLEED_BOTTOM = 16 * S; // ...and generously below, so lifting never
//                                  escapes the cursor (no hover flicker)

// Paper proportions — the preview reproduces these exactly (as percentages),
// so growing from the tiny card is a perfectly uniform scale (no distortion).
const PAPER_W = IMG_W + PAD * 2;
const PAPER_H = IMG_H + PAD + PAD_BOTTOM;
const PAD_PCT = (PAD / PAPER_W) * 100; // top/side padding, % of width
const PADB_PCT = (PAD_BOTTOM / PAPER_W) * 100; // chin, % of width

// The reference's signature card easing — a soft, decisive glide.
const cardTransition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
// The open/close glide for the preview — same soul, a hair slower.
const previewEase = [0.22, 1, 0.36, 1] as const;

const bubbleVariants: Variants = {
  rest: {
    opacity: 0,
    y: 3,
    scale: 0.9,
    transition: {
      opacity: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
      default: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
  },
  active: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      // a touch of overshoot, like the reference
      y: { duration: 0.26, ease: [0.34, 1.56, 0.64, 1] },
      scale: { duration: 0.26, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
};

/** A crisper source for the enlarged preview (picsum lets us bump the size). */
function hiRes(src: string) {
  return src.replace(/\/\d+\/\d+(?=$|\?)/, "/900/1080");
}

/**
 * Caption text that reveals per character: each glyph fades in while rising 3px
 * and de-blurring, with a 28ms left-to-right stagger (matches the reference's
 * `bubbleChar` keyframe).
 */
function BubbleText({ text, active }: { text: string; active: boolean }) {
  const chars = Array.from(text);
  return (
    <span aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={false}
          animate={
            active
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 3, filter: "blur(2px)" }
          }
          transition={{
            duration: 0.26,
            ease: [0.16, 1, 0.3, 1],
            delay: active ? i * 0.028 : 0,
          }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

type Rect = { top: number; left: number; width: number; height: number };

/** Where the enlarged polaroid should sit — centered, keeping paper ratio. */
function computeTarget(): Rect {
  const maxH = window.innerHeight * 0.82;
  const maxW = window.innerWidth * 0.9;
  let h = maxH;
  let w = (h * PAPER_W) / PAPER_H;
  if (w > maxW) {
    w = maxW;
    h = (w * PAPER_H) / PAPER_W;
  }
  return {
    width: w,
    height: h,
    left: (window.innerWidth - w) / 2,
    top: (window.innerHeight - h) / 2,
  };
}

/**
 * Full-screen preview: a backdrop that fades in + the polaroid that flies from
 * its origin rect up to a centered `target` rect (and back out on close).
 */
function PhotoPreview({
  photo,
  origin,
  onClose,
}: {
  photo: Photo;
  origin: Rect;
  onClose: () => void;
}) {
  const [target] = useState<Rect>(() => computeTarget());

  // Escape to close + lock body scroll while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: "blur(2px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: previewEase }}
        onClick={onClose}
      />

      {/* the polaroid, flying from origin → centered target */}
      <motion.div
        className="cursor-zoom-out"
        style={{ position: "fixed", boxSizing: "border-box" }}
        initial={{
          top: origin.top,
          left: origin.left,
          width: origin.width,
          height: origin.height,
        }}
        animate={{
          top: target.top,
          left: target.left,
          width: target.width,
          height: target.height,
        }}
        exit={{
          top: origin.top,
          left: origin.left,
          width: origin.width,
          height: origin.height,
        }}
        transition={{ duration: 0.46, ease: previewEase }}
        onClick={onClose}
      >
        {/* white paper — padding as % of width reproduces the card exactly */}
        <div
          className="relative bg-white"
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: `${PAD_PCT}% ${PAD_PCT}% ${PADB_PCT}%`,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden bg-neutral-200"
            style={{ outline: "1px solid rgba(0,0,0,0.1)", outlineOffset: -1 }}
          >
            <Image
              src={hiRes(photo.src)}
              alt={photo.alt}
              fill
              sizes={`${Math.round(target.width)}px`}
              className="object-cover"
              draggable={false}
              priority
              unoptimized
            />
          </div>

          {/* caption written across the chin, revealed once open */}
          <motion.div
            className="absolute inset-x-0 text-center font-medium text-[#111]"
            style={{
              bottom: `${PADB_PCT * 0.28}%`,
              fontSize: Math.max(13, target.width * 0.05),
              lineHeight: 1,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.28, ease: previewEase, delay: 0.18 }}
          >
            {photo.caption}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PolaroidGallery() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Rect | null>(null);
  const paperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mid = (PHOTOS.length - 1) / 2;

  const openPreview = useCallback((i: number) => {
    const el = paperRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    setOrigin({ top: r.top, left: r.left, width: r.width, height: r.height });
    setHovered(i); // keep the card straightened/lifted behind the overlay
    setPreview(i);
  }, []);

  const closePreview = useCallback(() => setPreview(null), []);

  return (
    <>
      <div className="flex justify-center">
        {PHOTOS.map((photo, i) => {
          const offset = i - mid; // -3 … +3
          const t = offset / mid; // -1 … +1
          const rot = t * ROT_MAX;
          const baseY = ARC_Y * t * t; // parabola — outer cards hang lower
          const sx = offset * SX_STEP; // self-nudge outward on hover
          const isHovered = hovered === i;
          // while a preview is open the origin card is hidden beneath it
          const isPreviewing = preview === i;

          // Resting pose; the hovered card straightens + lifts, and its
          // neighbours ease apart (gently, decaying with distance) to make room.
          let cardX = 0;
          let cardY = baseY;
          let cardRotate = rot;
          let cardScale = 1;
          if (isHovered) {
            cardX = sx;
            cardY = baseY - LIFT;
            cardRotate = 0;
            cardScale = 1.1;
          } else if (hovered !== null) {
            const dist = i - hovered; // <0 to the left, >0 to the right
            cardX = Math.sign(dist) * (SPREAD / Math.abs(dist));
          }

          return (
            <motion.div
              key={photo.src}
              className="relative shrink-0 cursor-zoom-in select-none border-0 bg-transparent p-0"
              style={{
                width: PAPER_W,
                marginLeft: i === 0 ? 0 : -OVERLAP,
                // Instant flip: hovered card on top; otherwise natural left→right
                // stacking, so neighbours overlap it again the moment you leave.
                zIndex: isHovered ? 30 : i + 1,
                transformOrigin: "center bottom",
                WebkitTapHighlightColor: "transparent",
                opacity: isPreviewing ? 0 : 1,
              }}
              initial={false}
              animate={{ x: cardX, y: cardY, rotate: cardRotate, scale: cardScale }}
              transition={cardTransition}
              onHoverStart={() => {
                if (preview === null) setHovered(i);
              }}
              onHoverEnd={() => {
                if (preview !== null) return; // freeze hover while previewing
                setHovered((h) => (h === i ? null : h));
              }}
              onFocus={() => {
                if (preview === null) setHovered(i);
              }}
              onBlur={() => {
                if (preview !== null) return;
                setHovered((h) => (h === i ? null : h));
              }}
              onClick={() => openPreview(i)}
              tabIndex={0}
              role="button"
              aria-label={`Open preview: ${photo.caption}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPreview(i);
                }
              }}
            >
              {/* invisible hit-area bleed — extends the hover zone (especially
                  below) so the lifting card never slips out from under the
                  cursor. Mirrors the reference's `::after { inset: -4 -4 -16 }`. */}
              <span
                aria-hidden
                className="absolute"
                style={{
                  top: -HIT_BLEED,
                  left: -HIT_BLEED,
                  right: -HIT_BLEED,
                  bottom: -HIT_BLEED_BOTTOM,
                }}
              />

              {/* caption bubble, floated above the card */}
              <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                style={{ bottom: "calc(100% + 7px)" }}
              >
                <motion.div
                  variants={bubbleVariants}
                  initial="rest"
                  animate={isHovered ? "active" : "rest"}
                  className="whitespace-nowrap bg-white font-medium text-[#111]"
                  style={{
                    padding: "4px 8px 3px",
                    fontSize: 0.6875 * S + "rem",
                    lineHeight: 1,
                    // speech-bubble corner (sharp bottom-left), like the reference
                    borderRadius: "8px 8px 8px 2px",
                    boxShadow:
                      "inset 0 0 0 1px rgba(17,17,17,0.08), 0 2px 6px rgba(0,0,0,0.06)",
                    transformOrigin: "center bottom",
                  }}
                >
                  <BubbleText text={photo.caption} active={isHovered} />
                </motion.div>
              </div>

              {/* the polaroid paper */}
              <motion.div
                ref={(el) => {
                  paperRefs.current[i] = el;
                }}
                className="block bg-white"
                style={{
                  padding: `${PAD}px ${PAD}px ${PAD_BOTTOM}px`,
                  border: "1px solid rgba(17,17,17,0.08)",
                }}
                animate={{
                  boxShadow: isHovered
                    ? "0 8px 20px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative overflow-hidden bg-neutral-200"
                  style={{
                    width: IMG_W,
                    height: IMG_H,
                    outline: "1px solid rgba(0,0,0,0.1)",
                    outlineOffset: -1,
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={`${Math.round(IMG_W)}px`}
                    className="object-cover"
                    draggable={false}
                    unoptimized
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {preview !== null && origin && (
          <PhotoPreview
            key="polaroid-preview"
            photo={PHOTOS[preview]}
            origin={origin}
            onClose={closePreview}
          />
        )}
      </AnimatePresence>
    </>
  );
}
