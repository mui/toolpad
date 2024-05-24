import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';
import pagesApi from './pagesApi';

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
        pathname: '/toolpad/core/introduction/build-deploy',
        title: 'Build and Deploy',
      },
      {
        pathname: '/toolpad/core/introduction/roadmap',
        title: 'Roadmap',
      },
      {
        pathname: '/toolpad/core/introduction/support',
        title: 'Support',
      },
      {
        pathname: '/toolpad/core/features-group',
        subheader: 'Features',
        children: [
          {
            pathname: '/toolpad/core/features/authentication',

            title: 'Authentication',
          },
          {
            pathname: '/toolpad/core/features/data-providers',
            title: 'Data Providers',
          },
          {
            pathname: '/toolpad/core/features/audit-logs',
            title: 'Audit Logs',
            plan: 'pro',
          },
        ],
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
        ],
      },
      {
        pathname: '/toolpad/core/components/filter-group',
        subheader: 'Utils',
        children: [
          {
            pathname: '/toolpad/core/components/dialogs',
            title: 'dialogs',
          },
          {
            pathname: '/toolpad/core/components/notifications',
            title: 'notifications',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/core/api-group',
    title: 'APIs',
    children: pagesApi,
  },
  {
    pathname: '/toolpad/core/customization',
    title: 'Customization',
  },
];

export default pages;
