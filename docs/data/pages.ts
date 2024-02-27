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
    pathname: '/toolpad/building-pages',
    title: 'Building Pages',
  },
  {
    pathname: '/toolpad/using-data',
    title: 'Using data',
    children: [
      { pathname: '/toolpad/using-data/data-providers', title: 'Data Providers' },
      {
        pathname: '/toolpad/using-data/connecting-to-components',
        title: 'Connecting to Components',
      },
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
