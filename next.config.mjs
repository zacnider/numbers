// next.config.mjs
// Next.js yapılandırma dosyası

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/apple-app-site-association',
        destination: '/.well-known/apple-app-site-association',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
