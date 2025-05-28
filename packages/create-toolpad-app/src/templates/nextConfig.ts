import { Template } from '../types';

const nextConfig: Template = (options) => `
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ${options.router === 'nextjs-pages' ? 'transpilePackages: ["next-auth", "@mui/x-data-grid", "@mui/x-data-grid-pro", "@mui/x-data-grid-premium"],' : ''}
  };
  export default nextConfig;
`;

export default nextConfig;
