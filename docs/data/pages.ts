import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import SchemaIcon from '@mui/icons-material/Schema';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import TableViewIcon from '@mui/icons-material/TableView';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
        title: 'Custom Functions',
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
    title: 'Data Binding',
    icon: CodeIcon,
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
    pathname: '/toolpad/schema-reference',
    title: 'Schema reference',
    icon: SchemaIcon,
  },
];

export default pages;
