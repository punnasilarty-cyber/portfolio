import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // plain files in out/, so any static host can serve the site
  output: "export",
  // set only for the GitHub Pages build, where the site lives under /portfolio
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
