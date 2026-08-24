/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:table",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
