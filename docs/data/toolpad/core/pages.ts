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
        pathname: '/toolpad/core/introduction/base-concepts',
        title: 'Base concepts',
      },
      {
        pathname: '/toolpad/core/introduction/tutorial',
        title: 'Tutorial',
      },
      {
        pathname: '/toolpad/core/introduction/examples',
        title: 'Examples',
        newFeature: true,
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
    pathname: '/toolpad/core/integrations-group',
    title: 'Integrations',
    children: [
      {
        pathname: '/toolpad/core/integrations/nextjs-approuter',
        title: 'Next.js App Router',
      },
      {
        pathname: '/toolpad/core/integrations/nextjs-pagesrouter',
        title: 'Next.js Pages Router',
      },
      {
        pathname: '/toolpad/core/integrations/react-router',
        title: 'Vite with React Router',
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
            pathname: '/toolpad/core/react-notification-center',
            title: 'Notification Center',
            planned: true,
          },
        ],
      },
      {
        pathname: '/toolpad/core/authentication-group',
        subheader: 'Authentication',
        children: [
          {
            pathname: '/toolpad/core/react-sign-in-page',
            title: 'Sign-in Page',
          },
          {
            pathname: '/toolpad/core/react-account',
            title: 'Account',
          },
          {
            pathname: '/toolpad/core/react-sign-up-page',
            title: 'Sign-up Page',
            planned: true,
          },
          {
            pathname: '/toolpad/core/react-rbac',
            title: 'RBAC',
            planned: true,
          },
        ],
      },
      {
        pathname: '/toolpad/core/data-group',
        subheader: 'Data',
        children: [
          {
            pathname: '/toolpad/core/react-crud-page',
            title: 'CRUD',
            planned: true,
          },
          {
            pathname: '/toolpad/core/react-stat-card',
            title: 'Stats Card',
            planned: true,
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
            pathname: '/toolpad/core/react-use-session',
            title: 'useSession',
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
        subheader: 'Components',
        children: pagesApi,
      },
      {
        pathname: '/toolpad/core/api/hooks-group',
        subheader: 'Hooks',
        children: [
          {
            pathname: '/toolpad/core/react-use-notifications/api',
            title: 'useNotifications',
          },
          {
            pathname: '/toolpad/core/react-use-dialogs/api',
            title: 'useDialogs',
          },
          {
            pathname: '/toolpad/core/react-persistent-state/use-local-storage-state-api',
            title: 'useLocalStorageState',
          },
          {
            pathname: '/toolpad/core/react-use-session/api',
            title: 'useSession',
          },
          {
            pathname: '/toolpad/core/react-persistent-state/use-session-storage-state-api',
            title: 'useSessionStorageState',
          },
        ],
      },
    ],
  },
];

export default pages;
