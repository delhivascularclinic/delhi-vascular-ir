// Dev: /api is proxied to FastAPI on :8001. Prod: static export; the platform ingress
// serves /api from the backend on the same origin, so the frontend always calls relative /api.
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: { ignoreBuildErrors: true }, // `yarn typecheck` is the type gate
  eslint: { ignoreDuringBuilds: true },
  allowedDevOrigins: ["*.preview.emergentagent.com", "*.emergentagent.com", "*.emergent.host", "**.emergentcf.cloud", "*.cluster-0.preview.emergentcf.cloud", "**.emergentagent.com"],
  images: { unoptimized: true },
  ...(isProd
    ? { output: "export", trailingSlash: true } // export lands in out/; the build script moves it to build/ for the deploy pipeline
    : {
        async rewrites() {
          return [{ source: "/api/:path*", destination: "http://localhost:8001/api/:path*" }];
        },
      }),
};

export default nextConfig;
