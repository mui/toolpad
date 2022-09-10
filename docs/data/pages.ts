import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: 'DescriptionIcon',
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/quickstart' },
    ],
  },
  {
    pathname: '/toolpad/connecting-to-datasources',
    icon: 'TableViewIcon',
    children: [
      {
        pathname: '/toolpad/connecting-to-datasources/queries',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/connections',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/fetch',
        title: 'Fetch datasource',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/function',
        title: 'Function datasource',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/google-sheets',
        title: 'Google sheets datasource',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/postgreSQL',
        title: 'PostgreSQL datasource',
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
      },
    ],
  },
  {
    pathname: '/toolpad/data-binding',
    icon: 'CodeIcon',
  },
  {
    pathname: '/toolpad/versioning-and-deploying',
    title: 'Versioning & deploying [TODO]',
    icon: 'ToggleOnIcon',
    children: [
      {
        pathname: '/toolpad/versioning-and-deploying/releases',
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
