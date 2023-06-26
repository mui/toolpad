import * as React from 'react';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';
import ROUTES from '../../../src/route';

const useCases = {
  overline: 'Use cases',
  Headline: (
    <Typography variant="h2" maxWidth={300} marginBottom={3}>
      Toolpad is ideal for <GradientText>building</GradientText>
    </Typography>
  ),
  cards: [
    {
      title: 'Utility apps',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-monitoring-dashboard.svg',
      description:
        'Provide the stakeholders with simple apps to manage their daily operations. You can quickly build an app on Toolpad by calling APIs or writing custom functions. Your app remains secure as the code never leaves your network, and you can securely deploy the app to any service you choose.',
      action: {
        href: ROUTES.toolpadUtilityAppExample,
        label: 'View example',
      },
    },
    {
      title: 'Admin panel',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-admin-panel.svg',
      description:
        'Enable your teams to quickly view and manage customer orders, queries, and refunds by creating admin apps that gather data from third-party APIs providers like Stripe, Twilio, Zendesk, etc. Toolpad allows end users to create, read, update, or delete records.',
      action: {
        href: ROUTES.toolpadAdminExample,
        label: 'View example',
      },
    },
    {
      title: 'BI dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-custom-cms.svg',
      description:
        'Build BI dashboards to slice and dice any metric across various dimensions. Further, use them to monitor KPIs, track business goals, and identify trends and opportunities. Toolpad allows you to combine data from multiple sources and bind it by writing JavaScript anywhere.',
      action: {
        href: ROUTES.toolpadBIExample,
        label: 'View example',
      },
    },
  ],
};

export default useCases;
