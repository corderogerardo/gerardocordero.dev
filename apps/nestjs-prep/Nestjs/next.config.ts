import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site -> deploys to Cloudflare Pages as plain assets.
  output: "export",
  // Static hosting: emit `route/index.html` so Pages serves /route and /route/.
  trailingSlash: true,
  // No Next image optimization server in a static export.
  images: { unoptimized: true },
  transpilePackages: ["@gerardocordero/prep-kit"],
};

export default nextConfig;
