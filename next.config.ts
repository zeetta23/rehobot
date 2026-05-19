import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permitimos servir imágenes desde Firebase Storage a través del CDN de
    // Next/Vercel para optimización automática (WebP/AVIF + resize).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      {
        protocol: "https",
        hostname: "**.firebasestorage.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
