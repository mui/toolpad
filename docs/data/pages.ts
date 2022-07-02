import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad',
    title: 'Overview',
    icon: 'DescriptionIcon',
  },
  {
    pathname: '/toolpad/getting-started',
    title: 'Getting started',
    icon: 'CreateIcon',
    children: [
      { pathname: '/toolpad/getting-started/setup' },
      { pathname: '/toolpad/getting-started', title: 'Tutorial' },
    ],
  },
  {
    pathname: '/toolpad/data-fetching',
    icon: 'TableViewIcon',
    children: [
      { pathname: '/toolpad/data-fetching', title: 'Overview' },
      { pathname: '/toolpad/data-fetching/rest', title: 'REST API' },
      { pathname: '/toolpad/data-fetching/google-sheets', title: 'Google Sheets' },
      { pathname: '/toolpad/data-fetching/queries' },
    ],
  },
];

export default pages;
