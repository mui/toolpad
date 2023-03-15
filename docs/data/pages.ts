import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: 'DescriptionIcon',
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/quickstart' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/roadmap' },
    ],
  },
  {
    pathname: '/toolpad/connecting-to-datasources',
    icon: 'TableViewIcon',
    children: [
      {
        pathname: '/toolpad/connecting-to-datasources/queries',
      },
      // {
      //   pathname: '/toolpad/connecting-to-datasources/connections',
      // },
      {
        pathname: '/toolpad/connecting-to-datasources/fetch',
        title: 'Fetch datasource',
      },
      // {
      //   pathname: '/toolpad/connecting-to-datasources/function',
      //   title: 'Function datasource',
      // },
      // {
      //   pathname: '/toolpad/connecting-to-datasources/google-sheets',
      //   title: 'Google Sheets datasource',
      // },
      // {
      //   pathname: '/toolpad/connecting-to-datasources/postgre-sql',
      //   title: 'PostgreSQL datasource',
      // },
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
      {
        pathname: '/toolpad/building-ui/data-grid-component',
        title: 'DataGrid component',
      },
    ],
  },
  {
    pathname: '/toolpad/data-binding',
    icon: 'CodeIcon',
  },
  // {
  //   pathname: '/toolpad/versioning-and-deploying',
  //   title: 'Versioning & deploying [TODO]',
  //   icon: 'ToggleOnIcon',
  //   children: [
  //     {
  //       pathname: '/toolpad/versioning-and-deploying/releases',
  //     },
  //   ],
  // },
  // {
  //   pathname: '/toolpad/faq',
  //   title: 'FAQ [TODO]',
  //   icon: 'ReaderIcon',
  // },
];

export default pages;
