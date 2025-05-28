/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'next-auth',
    '@mui/x-data-grid', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
    '@mui/x-data-grid-pro', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
    '@mui/x-data-grid-premium', // Fix CSS imports https://github.com/mui/mui-x/issues/17427
  ],
};

export default nextConfig;
