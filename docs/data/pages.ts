import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import componentsManifest from './toolpad/reference/components/manifest.json';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started-group',
    title: 'Getting Started',
    children: [
      { pathname: '/toolpad/getting-started', title: 'Overview' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/why-toolpad', title: 'Why Toolpad?' },
      { pathname: '/toolpad/getting-started/first-app', title: 'Build your first app' },
      {
        pathname: '/toolpad/examples-group',
        title: 'Examples',
        children: [
          { pathname: '/toolpad/examples', title: 'Overview' },
          { pathname: '/toolpad/examples/npm-stats', title: 'npm stats' },
          { pathname: '/toolpad/examples/basic-crud-app', title: 'Basic CRUD application' },
          { pathname: '/toolpad/examples/qr-generator', title: 'QR Code generator' },
        ],
      },
      { pathname: '/toolpad/getting-started/roadmap' },
      {
        pathname: '/toolpad/getting-started/support',
        title: 'Support',
      },
    ],
  },
  {
    pathname: '/toolpad/concepts',
    children: [
      {
        pathname: '/toolpad/concepts/building-ui',
        title: 'Building UI',
      },
      {
        pathname: '/toolpad/concepts/connecting-to-data',
        title: 'Connecting to data',
        children: [
          {
            pathname: '/toolpad/concepts/queries',
            title: 'Overview',
          },
          {
            pathname: '/toolpad/concepts/http-requests',
            title: 'HTTP requests',
          },
          {
            pathname: '/toolpad/concepts/custom-functions',
            title: 'Custom functions',
          },
          {
            pathname: '/toolpad/concepts/data-providers',
            title: 'Data providers',
          },
        ],
      },
      {
        pathname: '/toolpad/concepts/data-binding',
        title: 'Data binding',
      },
      {
        pathname: '/toolpad/concepts/event-handling',
      },
      {
        pathname: '/toolpad/concepts/file-structure',
        title: 'File structure',
      },
      {
        pathname: '/toolpad/concepts/deployment',
      },
      {
        pathname: '/toolpad/concepts/custom-components',
      },
      {
        pathname: '/toolpad/concepts/theming',
      },
      {
        pathname: '/toolpad/concepts/page-properties',
      },
      {
        pathname: '/toolpad/concepts/authorization',
        title: 'Authorization',
        children: [
          {
            pathname: '/toolpad/concepts/authentication',
            title: 'Authentication',
          },
          {
            pathname: '/toolpad/concepts/rbac',
            title: 'Role-based access control',
          },
        ],
      },
      { pathname: '/toolpad/concepts/custom-server' },
    ],
  },
  {
    pathname: '/toolpad/components',
    children: [
      { pathname: '/toolpad/components/button' },
      {
        pathname: '/toolpad/components/datagrid',
        title: 'Data Grid',
      },
    ],
  },
  {
    pathname: '/toolpad/how-to-guides',
    title: 'How-to guides',
    children: [
      {
        pathname: '/toolpad/how-to-guides/connect-to-datasource',
        subheader: 'Connect to datasource',
        children: [
          {
            pathname: '/toolpad/how-to-guides/connect-to-databases',
            title: 'MySQL',
          },
          {
            pathname: '/toolpad/how-to-guides/connect-to-googlesheets',
            title: 'Google Sheets',
          },
        ],
      },
      {
        pathname: '/toolpad/how-to-guides/deployment',
        subheader: 'Deployment',
        children: [
          {
            pathname: '/toolpad/how-to-guides/render-deploy',
            title: 'Deploy to Render',
          },
        ],
      },
      {
        pathname: '/toolpad/how-to-guides/custom-components',
        subheader: 'Create custom components',
        children: [
          {
            pathname: '/toolpad/how-to-guides/map-display',
            title: 'Map component',
          },
          {
            pathname: '/toolpad/how-to-guides/cube-component',
            title: '3D cube component',
          },
        ],
      },
      {
        pathname: '/toolpad/how-to-guides/misc',
        subheader: 'Miscellaneous',
        children: [
          {
            pathname: '/toolpad/how-to-guides/customize-datagrid',
            title: 'Customize data grids',
          },
          {
            pathname: '/toolpad/how-to-guides/delete-datagrid-row',
            title: 'Delete a data grid row',
          },
          {
            pathname: '/toolpad/how-to-guides/embed-pages',
            title: 'Embedding Toolpad pages',
          },
          {
            pathname: '/toolpad/how-to-guides/basic-auth',
            title: 'Enable basic auth',
          },
          {
            pathname: '/toolpad/how-to-guides/editor-path',
            title: 'Troubleshoot missing editor',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/reference-group',
    title: 'Reference',
    children: [
      {
        pathname: '/toolpad/reference/file-schema',
        title: 'File schema',
      },
      {
        pathname: '/toolpad/reference/components-group',
        title: 'Components',
        children: componentsManifest.pages,
      },
      {
        pathname: '/toolpad/reference/api-group',
        title: 'API',
        children: [
          {
            pathname: '/toolpad/reference/api',
            title: 'Index',
          },
          {
            pathname: '/toolpad/reference/api/functions-group',
            subheader: 'Functions',
            children: [
              {
                title: 'createComponent',
                pathname: '/toolpad/reference/api/create-component',
              },
              {
                title: 'createDataProvider',
                pathname: '/toolpad/reference/api/create-data-provider',
              },
              {
                title: 'createFunction',
                pathname: '/toolpad/reference/api/create-function',
              },
              {
                title: 'createHandler',
                pathname: '/toolpad/reference/api/create-handler',
              },
              {
                title: 'getContext',
                pathname: '/toolpad/reference/api/get-context',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default pages;
