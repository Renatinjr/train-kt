import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/runtime-specific DB drivers: load them at runtime instead of bundling.
  serverExternalPackages: ["better-sqlite3"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), { "bun:sqlite": "commonjs bun:sqlite" }];
    }
    return config;
  },
};

export default nextConfig;
