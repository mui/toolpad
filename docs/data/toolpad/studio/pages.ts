import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import componentsManifest from './reference/components/manifest.json';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/studio/getting-started-group',
    title: 'Getting Started',
    children: [
      { pathname: '/toolpad/studio/getting-started', title: 'Overview' },
      { pathname: '/toolpad/studio/getting-started/installation' },
      { pathname: '/toolpad/studio/getting-started/why-toolpad', title: 'Why Toolpad Studio?' },
      { pathname: '/toolpad/studio/getting-started/first-app', title: 'Build your first app' },
      {
        pathname: '/toolpad/studio/examples-group',
        title: 'Examples',
        children: [
          { pathname: '/toolpad/studio/examples', title: 'Overview' },
          { pathname: '/toolpad/studio/examples/npm-stats', title: 'npm stats' },
          { pathname: '/toolpad/studio/examples/basic-crud-app', title: 'Basic CRUD application' },
          { pathname: '/toolpad/studio/examples/qr-generator', title: 'QR Code generator' },
        ],
      },
      { pathname: '/toolpad/studio/getting-started/roadmap' },
      {
        pathname: '/toolpad/studio/getting-started/support',
        title: 'Support',
      },
    ],
  },
  {
    pathname: '/toolpad/studio/concepts',
    children: [
      {
        pathname: '/toolpad/studio/concepts/building-ui',
        title: 'Building UI',
      },
      {
        pathname: '/toolpad/studio/concepts/connecting-to-data',
        title: 'Connecting to data',
        children: [
          {
            pathname: '/toolpad/studio/concepts/queries',
            title: 'Overview',
          },
          {
            pathname: '/toolpad/studio/concepts/http-requests',
            title: 'HTTP requests',
          },
          {
            pathname: '/toolpad/studio/concepts/custom-functions',
            title: 'Custom functions',
          },
          {
            pathname: '/toolpad/studio/concepts/data-providers',
            title: 'Data providers',
          },
        ],
      },
      {
        pathname: '/toolpad/studio/concepts/data-binding',
        title: 'Data binding',
      },
      {
        pathname: '/toolpad/studio/concepts/event-handling',
      },
      {
        pathname: '/toolpad/studio/concepts/file-structure',
        title: 'File structure',
      },
      {
        pathname: '/toolpad/studio/concepts/deployment',
      },
      {
        pathname: '/toolpad/studio/concepts/custom-components',
      },
      {
        pathname: '/toolpad/studio/concepts/theming',
      },
      {
        pathname: '/toolpad/studio/concepts/page-properties',
      },
      {
        pathname: '/toolpad/studio/concepts/authorization',
        title: 'Authorization',
        children: [
          {
            pathname: '/toolpad/studio/concepts/authentication',
            title: 'Authentication',
          },
          {
            pathname: '/toolpad/studio/concepts/rbac',
            title: 'Role-based access control',
          },
        ],
      },
      { pathname: '/toolpad/studio/concepts/custom-server' },
    ],
  },
  {
    pathname: '/toolpad/studio/components',
    children: [
      { pathname: '/toolpad/studio/components/button' },
      {
        pathname: '/toolpad/studio/components/data-grid',
        title: 'Data Grid',
      },
      { pathname: '/toolpad/studio/components/list' },
      { pathname: '/toolpad/studio/components/date-picker', title: 'Date Picker' },
      { pathname: '/toolpad/studio/components/text-field', title: 'Text Field' },
    ],
  },
  {
    pathname: '/toolpad/studio/how-to-guides',
    title: 'How-to guides',
    children: [
      {
        pathname: '/toolpad/studio/how-to-guides/connect-to-datasource',
        subheader: 'Connect to datasource',
        children: [
          {
            pathname: '/toolpad/studio/how-to-guides/connect-to-databases',
            title: 'MySQL',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/connect-to-googlesheets',
            title: 'Google Sheets',
          },
        ],
      },
      {
        pathname: '/toolpad/studio/how-to-guides/deployment',
        subheader: 'Deployment',
        children: [
          {
            pathname: '/toolpad/studio/how-to-guides/render-deploy',
            title: 'Deploy to Render',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/railway-deploy',
            title: 'Deploy to Railway',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/gcp-deploy',
            title: 'Deploy to Google Cloud',
          },
        ],
      },
      {
        pathname: '/toolpad/studio/how-to-guides/custom-components',
        subheader: 'Create custom components',
        children: [
          {
            pathname: '/toolpad/studio/how-to-guides/map-display',
            title: 'Map component',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/cube-component',
            title: '3D cube component',
          },
        ],
      },
      {
        pathname: '/toolpad/studio/how-to-guides/misc',
        subheader: 'Miscellaneous',
        children: [
          {
            pathname: '/toolpad/studio/how-to-guides/customize-datagrid',
            title: 'Customize data grids',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/delete-datagrid-row',
            title: 'Delete a data grid row',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/embed-pages',
            title: 'Embedding Toolpad Studio pages',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/basic-auth',
            title: 'Enable basic auth',
          },
          {
            pathname: '/toolpad/studio/how-to-guides/editor-path',
            title: 'Troubleshoot missing editor',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/studio/reference-group',
    title: 'Reference',
    children: [
      {
        pathname: '/toolpad/studio/reference/file-schema',
        title: 'File schema',
      },
      {
        pathname: '/toolpad/studio/reference/components-group',
        title: 'Components',
        children: componentsManifest.pages,
      },
      {
        pathname: '/toolpad/studio/reference/api-group',
        title: 'API',
        children: [
          {
            pathname: '/toolpad/studio/reference/api',
            title: 'Index',
          },
          {
            pathname: '/toolpad/studio/reference/api/functions-group',
            subheader: 'Functions',
            children: [
              {
                title: 'createComponent',
                pathname: '/toolpad/studio/reference/api/create-component',
              },
              {
                title: 'createDataProvider',
                pathname: '/toolpad/studio/reference/api/create-data-provider',
              },
              {
                title: 'createFunction',
                pathname: '/toolpad/studio/reference/api/create-function',
              },
              {
                title: 'createHandler',
                pathname: '/toolpad/studio/reference/api/create-handler',
              },
              {
                title: 'getContext',
                pathname: '/toolpad/studio/reference/api/get-context',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default pages;
