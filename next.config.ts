import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/#pricing",
        permanent: false,
      },
      {
        source: "/candidates",
        destination: "/employers/candidates",
        permanent: false,
      },
      {
        source: "/employers",
        destination: "/employers/candidates",
        permanent: false,
      },
      {
        source: "/:locale(es|fr|de|it)/pricing",
        destination: "/:locale#pricing",
        permanent: false,
      },
      {
        source: "/:locale(es|fr|de|it)/candidates",
        destination: "/:locale/employers/candidates",
        permanent: false,
      },
      {
        source: "/:locale(es|fr|de|it)/employers",
        destination: "/:locale/employers/candidates",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
