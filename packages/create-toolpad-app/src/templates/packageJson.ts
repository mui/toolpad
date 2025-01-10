import { PackageJsonTemplate } from '../types';

const packageJson: PackageJsonTemplate = (options) => {
  const {
    name: appName,
    projectType,
    router: routerType,
    framework,
    auth: authOption,
    coreVersion,
    hasNodemailerProvider,
    hasPasskeyProvider,
  } = options;

  if (projectType === 'studio') {
    return {
      name: appName,
      version: '0.1.0',
      scripts: {
        dev: 'toolpad-studio dev',
        build: 'toolpad-studio build',
        start: 'toolpad-studio start',
      },
      dependencies: {
        '@toolpad/studio': 'latest',
      },
    };
  }

  const dependencies: Record<string, string> = {
    react: '^19',
    'react-dom': '^19',
    '@toolpad/core': coreVersion ?? 'latest',
    '@mui/material': '^6',
    '@mui/material-nextjs': '^6',
    '@mui/icons-material': '^6',
    '@emotion/react': '^11',
    '@emotion/styled': '^11',
  };

  const devDependencies: Record<string, string> = {
    typescript: '^5',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    eslint: '^8',
  };

  if (framework === 'nextjs') {
    dependencies.next = '^15';
    devDependencies['eslint-config-next'] = '^15';
    devDependencies['@types/node'] = '^20';
  } else if (framework === 'vite') {
    dependencies['react-router'] = '^7';
    devDependencies['@vitejs/plugin-react'] = '^4.3.2';
    devDependencies.vite = '^5.4.8';
  }

  if (routerType === 'nextjs-pages') {
    dependencies['@emotion/cache'] = '^11';
    dependencies['@emotion/server'] = '^11';
  }

  if (authOption) {
    if (framework === 'nextjs') {
      dependencies['next-auth'] = '5.0.0-beta.25';
    } else if (framework === 'vite') {
      dependencies.firebase = '^11';
    }
  }

  if (hasNodemailerProvider || hasPasskeyProvider) {
    dependencies['@prisma/client'] = '^5';
    dependencies['@auth/prisma-adapter'] = '^2';
  }

  if (hasNodemailerProvider) {
    dependencies.nodemailer = '^6';
  }

  if (hasPasskeyProvider) {
    dependencies['@simplewebauthn/browser'] = '^9';
    dependencies['@simplewebauthn/server'] = '^9';
  }

  if (hasNodemailerProvider || hasPasskeyProvider) {
    devDependencies.prisma = '^5';
  }

  const scripts =
    framework === 'nextjs'
      ? {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        }
      : {
          dev: 'vite',
          preview: 'vite preview',
        };

  return {
    name: appName,
    version: '0.1.0',
    scripts,
    dependencies,
    devDependencies,
  };
};

export default packageJson;
