import { PackageJson } from '../packageType';

export default (name: string): PackageJson => ({
  name,
  version: '0.1.0',
  scripts: {
    dev: 'toolpad-studio dev',
    build: 'toolpad-studio build',
    start: 'toolpad-studio start',
  },
  dependencies: {
    '@toolpad/studio': 'latest',
  },
});
