import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["next"],
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": "./src/lib/modern-polyfill.js",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-slot",
      "@radix-ui/react-sheet",
      "@radix-ui/react-label",
    ],
  },
};

export default nextConfig;
