import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    title: 'Getting started',
    icon: 'DescriptionIcon',
    children: [
      { pathname: '/toolpad/getting-started/overview', title: 'Overview' },
      { pathname: '/toolpad/getting-started/quickstart', title: 'Quickstart' },
    ],
  },
  {
    pathname: '/toolpad/connecting-to-data-sources',
    title: 'Connecting to data sources',
    icon: 'TableViewIcon',
    children: [
      {
        pathname: '/toolpad/connecting-to-data-sources/queries',
        title: 'Queries',
      },
      {
        pathname: '/toolpad/connecting-to-data-sources/connections',
        title: 'Connections',
      },
      {
        pathname: '/toolpad/connecting-to-data-sources/fetch',
        title: 'Fetch type',
      },
      {
        pathname: '/toolpad/connecting-to-data-sources/function',
        title: 'Function type',
      },
      {
        pathname: '/toolpad/connecting-to-data-sources/google-sheets',
        title: 'Google sheets type',
      },
      {
        pathname: '/toolpad/connecting-to-data-sources/postgres',
        title: 'Postgres type',
      },
    ],
  },
  {
    pathname: '/toolpad/building-ui',
    title: 'Building UI [TODO]',
    icon: 'VisibilityIcon',
    children: [
      {
        pathname: '/toolpad/building-ui/build-in-components',
        title: 'Built in components',
      },
    ],
  },
  {
    pathname: '/toolpad/data-binding',
    title: 'Data binding',
    icon: 'CodeIcon',
  },
  {
    pathname: '/toolpad/versioning-and-deploying',
    title: 'Versioning & deploying [TODO]',
    icon: 'ToggleOnIcon',
    children: [
      {
        pathname: '/toolpad/versioning-and-deploying/releases',
        title: 'Releases',
      },
    ],
  },
  {
    pathname: '/toolpad/faq',
    title: 'FAQ [TODO]',
    icon: 'ReaderIcon',
  },
];

export default pages;
