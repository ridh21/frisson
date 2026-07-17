/**
 * A tiny neutral gradient, base64-encoded, used as the `blurDataURL` for
 * `next/image`'s `placeholder="blur"`. Remote images (like the demo photos
 * these components ship with) can't have a blur placeholder generated at build
 * time, so we hand it this small stand-in — the real photo blur-ups over it as
 * it loads. Swap it for a per-image blur (e.g. via `plaiceholder`) if you host
 * your own images.
 */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZTRlNGU3Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYTFhMWFhIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+";
