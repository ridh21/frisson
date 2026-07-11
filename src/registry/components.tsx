/**
 * Maps each registry slug to its live React component. Kept separate from the
 * metadata in `registry/index.ts` so that importing the metadata (e.g. in the
 * sidebar) doesn't bundle every component's code.
 */
import type { ComponentType } from "react";
import PolaroidGallery from "@/components/PolaroidGallery";

export const componentMap: Record<string, ComponentType> = {
  "polaroid-gallery": PolaroidGallery,
};
