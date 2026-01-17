import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Creates self-contained build in .next/standalone
  output: 'standalone',

  // Prevent bundling Electron and native modules
  serverExternalPackages: ['electron', 'better-sqlite3'],

  // Disable image optimization to prevent sharp native modules from being bundled
  // (fixes electron-builder universal binary creation conflict)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
