import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
// import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';
// import ChromeReaderModeRoundedIcon from '@mui/icons-material/ChromeReaderModeRounded';

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/getting-started',
    icon: ArticleRoundedIcon,
    children: [
      { pathname: '/toolpad/getting-started/overview' },
      { pathname: '/toolpad/getting-started/quickstart' },
      { pathname: '/toolpad/getting-started/installation' },
      { pathname: '/toolpad/getting-started/roadmap' },
    ],
  },
  {
    pathname: '/toolpad/connecting-to-datasources',
    icon: TableViewRoundedIcon,
    children: [
      {
        pathname: '/toolpad/connecting-to-datasources/queries',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/serverside-http-request',
        title: 'serverside HTTP request',
      },
      {
        pathname: '/toolpad/connecting-to-datasources/serverside-javascript',
        title: 'serverside JavaScript',
      },
    ],
  },
  {
    pathname: '/toolpad/building-ui',
    title: 'Building UI',
    icon: VisibilityRoundedIcon,
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
    icon: CodeRoundedIcon,
  },
  {
    pathname: '/toolpad/deployment',
    icon: RocketLaunchIcon,
  },
  // {
  //   pathname: '/toolpad/versioning-and-deploying',
  //   title: 'Versioning & deploying [TODO]',
  //   icon: ToggleOffRoundedIcon,
  //   children: [
  //     {
  //       pathname: '/toolpad/versioning-and-deploying/releases',
  //     },
  //   ],
  // },
  // {
  //   pathname: '/toolpad/faq',
  //   title: 'FAQ [TODO]',
  //   icon: ChromeReaderModeRoundedIcon,
  // },
];

export default pages;
