/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // https://github.com/nextauthjs/next-auth/discussions/9385#discussioncomment-8875108
  transpilePackages: [
    'next-auth',
    '@mui/x-data-grid', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
    '@mui/x-data-grid-pro', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
    '@mui/x-data-grid-premium', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
  ],
};

export default nextConfig;
