import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    title: 'Getting started',
    icon: 'DescriptionIcon',
    children: [
      { pathname: '/toolpad/getting-started/introduction', title: 'Introduction' },
      { pathname: '/toolpad/getting-started/quickstart', title: 'Quickstart' },
    ],
  },
  {
    pathname: '/toolpad/core-concepts',
    title: 'Core concepts',
    icon: 'CodeIcon',
    children: [
      {
        pathname: '/toolpad/core-concepts/connecting-to-data-sources',
        title: 'Connecting to data sources',
      },
      { pathname: '/toolpad/core-concepts/building-ui', title: 'Building UI' },
      { pathname: '/toolpad/core-concepts/data-binding', title: 'Data binding' },
      {
        pathname: '/toolpad/core-concepts/versioning-and-deploying',
        title: 'Versioning & deploying',
      },
    ],
  },
  {
    pathname: '/toolpad/faq',
    title: 'FAQ',
    icon: 'ReaderIcon',
  },
];

export default pages;
