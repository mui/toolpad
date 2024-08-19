import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import pagesApi from './pagesApi';

// TODO: Split pagesApi into components and hooks

const pages: MuiPage[] = [
  {
    pathname: '/toolpad/core/intro-group',
    title: 'Introduction',
    children: [
      {
        pathname: '/toolpad/core/introduction',
        title: 'Overview',
      },
      {
        pathname: '/toolpad/core/introduction/installation',
        title: 'Installation',
      },
      {
        pathname: '/toolpad/core/introduction/tutorial',
        title: 'Tutorial',
      },
      {
        pathname: '/toolpad/core/introduction/examples',
        title: 'Examples',
      },
      {
        pathname: '/toolpad/core/introduction/roadmap',
        title: 'Roadmap',
      },
      {
        pathname: '/toolpad/core/introduction/support',
        title: 'Support',
      },
    ],
  },
  {
    pathname: '/toolpad/core/components-group',
    title: 'Components',
    children: [
      { pathname: '/toolpad/core/all-components', title: 'All components' },
      {
        pathname: '/toolpad/core/provider-group',
        subheader: 'Provider',
        children: [
          {
            pathname: '/toolpad/core/react-app-provider',
            title: 'App Provider',
          },
        ],
      },
      {
        pathname: '/toolpad/core/layout-group',
        subheader: 'Layout',
        children: [
          {
            pathname: '/toolpad/core/react-dashboard-layout',
            title: 'Dashboard Layout',
          },
          {
            pathname: '/toolpad/core/react-page-container',
            title: 'Page Container',
          },
          {
            pathname: '/toolpad/core/react-sign-in-page',
            title: 'Sign In Page',
          },
          {
            pathname: '/toolpad/core/react-account',
            title: 'Account',
          },
        ],
      },
      {
        pathname: '/toolpad/core/components/filter-group',
        subheader: 'Utils',
        children: [
          {
            pathname: '/toolpad/core/react-use-dialogs',
            title: 'useDialogs',
          },
          {
            pathname: '/toolpad/core/react-use-notifications',
            title: 'useNotifications',
          },
          {
            pathname: '/toolpad/core/react-persistent-state',
            title: 'Persisted state',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/core/api-group',
    title: 'APIs',
    children: [
      {
        pathname: '/toolpad/core/api/components-group',
        inSideNav: false,
        subheader: 'Components',
        children: [
          ...pagesApi,
          {
            pathname: '/toolpad/core/react-use-notifications/api/',
            title: 'useNotifications',
          },
          {
            pathname: '/toolpad/core/react-use-dialogs/api/',
            title: 'useDialogs',
          },
          {
            pathname: '/toolpad/core/react-persistent-state/use-local-storage-state-api/',
            title: 'useLocalStorageState',
          },
          {
            pathname: '/toolpad/core/react-persistent-state/use-session-storage-state-api/',
            title: 'useSessionStorageState',
          },
        ],
      },
    ],
  },
];

export default pages;
