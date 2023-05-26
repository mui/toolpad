import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
// import TableViewIcon from '@mui/icons-material/TableView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import componentsManifest from './toolpad/reference/components/manifest.json';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: DescriptionIcon,
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/first-app', title: 'Build your first app' },
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
        title: 'Connecting to data',
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
    ],
  },
  {
    pathname: '/toolpad/how-to-guides',
    title: 'How-to guides',
    icon: BuildIcon,
    children: [
      {
        pathname: '/toolpad/how-to-guides/connect-to-databases',
      },
      {
        pathname: '/toolpad/how-to-guides/delete-datagrid-row',
        title: 'Delete a data grid row',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/custom-columns',
        title: 'Create custom columns',
      },
      {
        pathname: '/toolpad/how-to-guides/deploy-render',
        title: 'Deploy your app to Render',
      },
      {
        pathname: '/toolpad/how-to-guides/embed-apps',
        title: 'Embed your app',
      },
      {
        pathname: '/toolpad/how-to-guides/basic-auth',
        title: 'Enable basic auth',
      },
    ],
  },
  {
    pathname: '/toolpad/deployment',
    icon: BuildIcon,
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
