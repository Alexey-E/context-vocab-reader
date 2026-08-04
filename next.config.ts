import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/account",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/documents/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
