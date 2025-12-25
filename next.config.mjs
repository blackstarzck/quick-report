/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd-mobile'],
  experimental: {
    serverComponentsExternalPackages: ['@notionhq/client'],
  },
};

export default nextConfig;

