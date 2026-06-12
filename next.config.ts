import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  assetPrefix: basePath,
  basePath,
  output: "export",
  trailingSlash: false
};

export default nextConfig;
