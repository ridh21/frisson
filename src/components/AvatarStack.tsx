"use client";

import { useState } from "react";

/**
 * Avatar Stack — a profile avatar that's secretly a deck of photos.
 *
 * Collapsed: the primary photo sits on a small stack, name and title centred
 *            beneath it. Hovering peeks the hidden photos out from behind.
 * Expanded:  click and the deck deals out — the primary photo and the name
 *            spring up to the top (primary top-left, name beside it) while the
 *            other photos flick into a horizontal row below. Hovering a row
 *            photo pops it up (its neighbours lift a little too, dock-style).
 *            Click again and everything springs back into the stack.
 *
 * Motion is driven by CSS transforms + a springy overshoot easing, so every
 * state change is reliable. Swap `PHOTOS`, `NAME`, and `TITLE` for your own.
 */

type Photo = {
  src: string;
  alt: string;
  z: number;
  /** Position in the dealt-out row (primary has none — it becomes the header). */
  rowIndex: number | null;
  /** rest & peek poses while stacked: [x, y, rotate]. */
  rest: Pose;
  peek: Pose;
};

type Pose = [number, number, number];

const PHOTO = 88;
const PITCH = 100;
const STAGE_W = 320;
const STAGE_H = 248;
const SX = STAGE_W / 2 - PHOTO / 2; // stack top-left x
const SY = 30; // stack top-left y
const ROW_Y = PHOTO + 36; // row sits below the header, with breathing room

const PHOTOS: Photo[] = [
  { src: "https://picsum.photos/seed/frisson-a/240/240", alt: "Portrait one", z: 40, rowIndex: null, rest: [SX, SY, 0], peek: [SX, SY, 0] },
  { src: "https://picsum.photos/seed/frisson-b/240/240", alt: "Portrait two", z: 39, rowIndex: 0, rest: [SX - 6, SY - 5, -6], peek: [SX - 22, SY - 12, -11] },
  { src: "https://picsum.photos/seed/frisson-c/240/240", alt: "Portrait three", z: 38, rowIndex: 1, rest: [SX + 6, SY - 5, 6], peek: [SX + 22, SY - 12, 11] },
  { src: "https://picsum.photos/seed/frisson-d/240/240", alt: "Portrait four", z: 37, rowIndex: 2, rest: [SX, SY - 10, 0], peek: [SX, SY - 24, 0] },
];

const NAME = "Ridham Patel";
const TITLE = "Design Engineer / MLE";

// A springy overshoot — reads as a spring, animates reliably.
const SPRING = "0.55s cubic-bezier(0.34, 1.5, 0.5, 1)";

export default function AvatarStack() {
  const [open, setOpen] = useState(false);
  const [hoverStack, setHoverStack] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  const toggle = () => setOpen((v) => !v);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`${NAME}, ${TITLE}. ${open ? "Collapse" : "Expand"} photo deck.`}
      className="relative cursor-pointer select-none outline-none"
      style={{ width: STAGE_W, height: STAGE_H }}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      onMouseEnter={() => setHoverStack(true)}
      onMouseLeave={() => {
        setHoverStack(false);
        setHoverRow(null);
      }}
    >
      {PHOTOS.map((photo, i) => {
        // Resolve this photo's target transform for the current state.
        let x: number, y: number, rot: number, scale = 1;
        if (open) {
          if (photo.rowIndex === null) {
            [x, y, rot] = [0, 0, 0]; // primary → header, top-left
          } else {
            x = photo.rowIndex * PITCH;
            y = ROW_Y;
            rot = 0;
            // dock-style pop: hovered photo grows, neighbours lift a little
            if (hoverRow !== null) {
              const d = Math.abs(photo.rowIndex - hoverRow);
              if (d === 0) scale = 1.16;
              else if (d === 1) scale = 1.07;
            }
          }
        } else {
          [x, y, rot] = hoverStack ? photo.peek : photo.rest;
        }

        const lift = open && scale > 1 ? -(scale - 1) * 60 : 0;

        return (
          <div
            key={photo.src}
            className="absolute left-0 top-0 overflow-hidden bg-zinc-200 shadow-[0_10px_30px_-10px_rgba(23,23,23,0.35)] ring-1 ring-black/[0.06] dark:bg-zinc-800 dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] dark:ring-white/10"
            style={{
              width: PHOTO,
              height: PHOTO,
              borderRadius: 18,
              // dock lift bumps z ONLY in the open row — in the collapsed stack
              // the primary always stays on top of the peeking photos
              zIndex: open && hoverRow === photo.rowIndex ? 50 : photo.z,
              transform: `translate(${x}px, ${y + lift}px) rotate(${rot}deg) scale(${scale})`,
              transition: `transform ${SPRING}`,
              willChange: "transform",
            }}
            onMouseEnter={() => open && photo.rowIndex !== null && setHoverRow(photo.rowIndex)}
            onMouseLeave={() => open && photo.rowIndex !== null && setHoverRow(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        );
      })}

      {/* Name + title — centred beneath the stack when collapsed, springing up
          beside the primary when expanded. ------------------------------- */}
      <div
        className={[
          "absolute left-0 top-0 flex w-[200px] flex-col gap-1",
          open ? "items-start text-left" : "items-center text-center",
        ].join(" ")}
        style={{
          // above the photos so the row never covers the name
          zIndex: 60,
          transform: open
            ? `translate(${PHOTO + 20}px, 24px)`
            : `translate(${STAGE_W / 2 - 100}px, ${SY + PHOTO + 20}px)`,
          transition: `transform ${SPRING}`,
        }}
      >
        <span className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {NAME}
          <VerifiedBadge />
        </span>
        <span className="text-[14px] text-zinc-500 dark:text-zinc-400">
          {TITLE}
        </span>
      </div>
    </div>
  );
}

/** The X / Twitter verified seal. */
function VerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" aria-hidden className="size-[18px] shrink-0 text-[#1d9bf0]">
      <path
        fill="currentColor"
        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.14.274.587.705 1.086 1.245 1.44.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.706 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
      />
    </svg>
  );
}
