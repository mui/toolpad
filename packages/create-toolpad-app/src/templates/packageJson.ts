import { PackageJsonTemplate } from '../types';

const packageJson: PackageJsonTemplate = (options) => {
  const { name: appName, projectType, router: routerType, auth: authOption, coreVersion } = options;

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
    react: '^18',
    'react-dom': '^18',
    next: '^15',
    '@toolpad/core': coreVersion ?? 'latest',
    '@mui/material': '^6',
    '@mui/material-nextjs': '^6',
    '@mui/icons-material': '^6',
    '@emotion/react': '^11',
    '@emotion/styled': '^11',
  };

  if (routerType === 'nextjs-pages') {
    dependencies['@emotion/cache'] = '^11';
    dependencies['@emotion/server'] = '^11';
  }

  if (authOption) {
    dependencies['next-auth'] = '5.0.0-beta.25';
  }

  const devDependencies: Record<string, string> = {
    typescript: '^5',
    '@types/node': '^20',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    eslint: '^8',
    'eslint-config-next': '^15',
  };

  const scripts = {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
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
