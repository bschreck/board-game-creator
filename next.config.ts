import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/generate-rulebook": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/submit-design": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
