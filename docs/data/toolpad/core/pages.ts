import type { MuiPage } from '@mui/monorepo/docs/src/MuiPage';

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
      { pathname: '/toolpad/core/components', title: 'All components' },
      {
        pathname: '/toolpad/core/components/layout-group',
        subheader: 'Layout',
        children: [
          {
            pathname: '/toolpad/core/components/dashboard',
            title: 'Dashboard',
          },
        ],
      },
      {
        pathname: '/toolpad/core/components/data-group',
        subheader: 'Data',
        children: [
          {
            pathname: '/toolpad/core/components/data-grid',
            title: 'Data Grid',
          },
          {
            pathname: '/toolpad/core/components/line-chart',
            title: 'Line Chart',
          },
        ],
      },
      {
        pathname: '/toolpad/core/components/filter-group',
        subheader: 'Filters',
        children: [
          {
            pathname: '/toolpad/core/components/select-filter',
            title: 'Select',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/core/api-group',
    title: 'API',
    children: [
      {
        pathname: '/toolpad/core/api',
        title: 'Index',
      },
      {
        pathname: '/toolpad/core/api/components-group',
        subheader: 'Components',
        children: [
          {
            pathname: '/toolpad/core/api/dashboard',
            title: 'Dashboard',
          },
          {
            pathname: '/toolpad/core/api/data-grid',
            title: 'Data Grid',
          },
          {
            pathname: '/toolpad/core/api/line-chart',
            title: 'Line Chart',
          },
        ],
      },
      {
        pathname: '/toolpad/core/api/filters-group',
        subheader: 'Filters',
        children: [
          {
            pathname: '/toolpad/core/api/select-filter',
            title: 'Select',
          },
        ],
      },
      {
        pathname: '/toolpad/core/api/hooks-group',
        subheader: 'Hooks',
        children: [
          {
            pathname: '/toolpad/core/api/use-filter-state',
            title: 'useFilterState',
          },
        ],
      },
    ],
  },
  {
    pathname: '/toolpad/core/customization',
    title: 'Customization',
  },
];

export default pages;
