import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    title: 'Getting Started',
  },
  {
    pathname: '/toolpad/why-toolpad',
    title: 'Why Toolpad?',
  },

  {
    pathname: '/toolpad/pages',
    title: 'Pages',
  },
  {
    pathname: '/toolpad/data',
    title: 'Data',
    children: [
      { pathname: '/toolpad/data/providers', title: 'Data Providers' },
      { pathname: '/toolpad/data/connecting-to-components', title: 'Connecting to Components' },
    ],
  },
  {
    pathname: '/toolpad/authentication',
    title: 'Authentication',
  },
  {
    pathname: '/toolpad/audit-logs',
    title: 'Audit Logs',
  },
  {
    pathname: '/toolpad/build-deploy',
    title: 'Build and Deploy',
  },
  {
    pathname: '/toolpad/roadmap',
    title: 'Roadmap',
  },
];

export default pages;
