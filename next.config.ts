import type { NextConfig } from "next";

const staticExport = process.env.WALNUT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export" as const,
        distDir: "dist",
        images: { unoptimized: true },
      }
    : {
        output: "standalone" as const,
      }),
  turbopack: {
    root: process.cwd(),
  },
  devIndicators: false,
};

export default nextConfig;
