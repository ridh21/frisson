import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home dir confuses Turbopack's root inference.
  turbopack: { root: __dirname },
  images: {
    // Placeholder photo host. Swap the srcs in PolaroidGallery for your own
    // images in /public and you can drop these remotePatterns entirely.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
