import { PackageJsonTemplate } from '../../../types';

const packageJson: PackageJsonTemplate = (appName, coreVersion) => ({
  name: appName,
  version: '0.1.0',
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  dependencies: {
    '@emotion/react': '^11.11.4',
    '@emotion/styled': '^11.11.5',
    '@mui/icons-material': '^5',
    '@mui/material': '^5',
    '@mui/material-nextjs': '^5',
    '@toolpad/core': coreVersion ?? 'latest',
    next: '^14',
    'next-auth': '5.0.0-beta.20',
    react: '^18',
    'react-dom': '^18',
  },
  devDependencies: {
    typescript: '^5',
    '@types/node': '^20',
    '@types/react': '^18',
    '@types/react-dom': '^18',
    eslint: '^8',
    'eslint-config-next': '^14',
  },
});

export default packageJson;
