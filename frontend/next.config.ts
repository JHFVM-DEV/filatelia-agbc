import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  // Permite conexiones HMR (Fast Refresh) y recursos dev desde túneles ngrok y dominios de desarrollo
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
    "raven-notionless-venomously.ngrok-free.dev",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días en caché
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ngrok-free.dev",
      },
      {
        protocol: "https",
        hostname: "**.ngrok-free.app",
      },
      {
        protocol: "https",
        hostname: "**.ngrok.io",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  // Proxy inverso hacia el backend Laravel (puerto 8000)
  // Permite que /api/... y /storage/... funcionen bajo el mismo dominio HTTPS de ngrok
  // eliminando errores de Mixed Content (HTTPS -> HTTP) y CORS
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/storage/:path*",
        destination: "http://127.0.0.1:8000/storage/:path*",
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
