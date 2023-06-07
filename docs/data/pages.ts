import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import componentsManifest from './toolpad/reference/components/manifest.json';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: DescriptionIcon,
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/quickstart' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/configuration' },
      { pathname: '/toolpad/getting-started/roadmap' },
    ],
  },
  {
    pathname: '/toolpad/connecting-to-datasources',
    icon: TableViewIcon,
    children: [
      {
        pathname: '/toolpad/connecting-to-datasources/queries',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/http-requests',
        title: 'HTTP requests',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/custom-functions',
        title: 'Custom functions',
      },
    ],
  },
  {
    pathname: '/toolpad/building-ui',
    title: 'Building UI',
    icon: VisibilityIcon,
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
        title: 'Data Grid component',
      },
      {
        pathname: '/toolpad/building-ui/page-configuration',
        title: 'Page configuration',
      },
      {
        pathname: '/toolpad/building-ui/theming',
        title: 'Theming',
      },
    ],
  },
  {
    pathname: '/toolpad/data-binding',
    icon: LinkIcon,
    children: [
      {
        pathname: '/toolpad/data-binding/binding-state',
        title: 'Binding state',
      },
      {
        pathname: '/toolpad/data-binding/event-handling',
        title: 'Event handling',
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
  {
    pathname: '/toolpad/examples',
    icon: DescriptionIcon,
    children: [
      // { pathname: '/toolpad/examples/admin-app' },
      // { pathname: '/toolpad/examples/KPI-performance' },
      { pathname: '/toolpad/examples/qr-generator' },
    ],
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
