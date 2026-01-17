import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Creates self-contained build in .next/standalone
  output: 'standalone',

  // Prevent bundling Electron and native modules
  serverExternalPackages: ['electron', 'better-sqlite3'],
};

export default nextConfig;
