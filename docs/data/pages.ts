import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import componentsManifest from './toolpad/reference/components/manifest.json';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: DescriptionIcon,
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/first-app', title: 'Build your first app' },
      {
        pathname: '/toolpad/examples',
        children: [
          { pathname: '/toolpad/examples/npm-stats', title: 'NPM stats' },
          { pathname: '/toolpad/examples/basic-crud-app', title: 'Basic CRUD application' },
          { pathname: '/toolpad/examples/qr-generator', title: 'QR Code generator' },
          { pathname: '/toolpad/examples/more-examples', title: 'More examples' },
        ],
      },
      { pathname: '/toolpad/getting-started/roadmap' },
    ],
  },
  {
    pathname: '/toolpad/concepts',
    icon: VisibilityIcon,
    children: [
      {
        pathname: '/toolpad/concepts/building-ui',
        title: 'Building UI',
      },
      {
        pathname: '/toolpad/concepts/connecting-to-data',
        title: 'Queries',
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
        ],
      },
      {
        pathname: '/toolpad/concepts/managing-state',
        title: 'Managing state',
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
        pathname: '/toolpad/concepts/display-mode',
      },
    ],
  },
  {
    pathname: '/toolpad/how-to-guides',
    title: 'How-to guides',
    icon: BuildIcon,
    children: [
      {
        pathname: '/toolpad/how-to-guides/connect-to-datasource',
        title: 'Connect to datasource',
        children: [
          {
            pathname: '/toolpad/how-to-guides/connect-to-databases',
            title: 'MySQL',
          },
          {
            pathname: '/toolpad/how-to-guides/connect-to-googlesheets',
            title: 'Google sheets',
          },
        ],
      },
      {
        pathname: '/toolpad/how-to-guides/custom-components',
        title: 'Create custom components',
        children: [
          {
            pathname: '/toolpad/how-to-guides/number-display',
            title: 'Number component',
          },
          {
            pathname: '/toolpad/how-to-guides/cube-component',
            title: '3D cube component',
          },
        ],
      },

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
        title: 'Embed a Toolpad page',
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
  {
    pathname: '/toolpad/tutorials',
    title: 'Tutorials',
    icon: SchoolIcon,
    children: [
      {
        pathname: '/toolpad/tutorials/render-deploy',
        title: 'Deploy your app to Render',
      },
    ],
  },
  {
    pathname: '/toolpad/reference-group',
    title: 'Reference',
    icon: CodeIcon,
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
                title: 'createFunction',
                pathname: '/toolpad/reference/api/create-function',
              },
              {
                title: 'createComponent',
                pathname: '/toolpad/reference/api/create-component',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default pages;
