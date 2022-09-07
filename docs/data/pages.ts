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
    pathname: '/toolpad/connecting-to-datasources',
    title: 'Connecting to datasources',
    icon: 'TableViewIcon',
    children: [
      {
        pathname: '/toolpad/connecting-to-datasources/queries',
        title: 'Queries',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/connections',
        title: 'Connections',
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
    title: 'Building UI',
    icon: 'VisibilityIcon',
    children: [
      {
        pathname: '/toolpad/building-ui/component-library',
        title: 'Component library',
      },
      {
        pathname: '/toolpad/building-ui/canvas-and-inspector',
        title: 'Canvas & Inspector',
      },
      {
        pathname: '/toolpad/building-ui/custom-components',
        title: 'Custom components',
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
