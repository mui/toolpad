import { Template } from '../types';

const nextConfig: Template = (options) => `
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ${options.router === 'nextjs-pages' ? 'transpilePackages: ["next-auth"],' : ''}
  };
  export default nextConfig;
`;

export default nextConfig;
