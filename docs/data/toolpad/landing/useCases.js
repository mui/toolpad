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
        'Provide the stakeholders with simple apps to manage their daily operations. An app can be quickly built on Toolpad by importing external packages or by calling a REST API. Your code never leaves your network and the app can be securely deployed to any service of your choice.',
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
        'Enable your teams to quickly view and manage customer orders, queries, and refunds by creating apps powered by native Toolpad integrations and third party APIs from providers like Stripe, Twilio, etc. Toolpad allows end users to create, read, update or delete records.',
      action: {
        href: ROUTES.toolpadUtilityAppExample,
        label: 'View example',
      },
    },
    {
      title: 'BI dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-custom-cms.svg',
      description:
        'Build customizable BI dashboards to view and analyze various data points, monitor KPIs, track business goals, and identify trends and opportunities. Toolpad allows you to combine data from multiple sources and bind it the pro-code way by writing JavaScript anywhere.',
      action: {
        href: ROUTES.toolpadUtilityAppExample,
        label: 'View example',
      },
    },
  ],
};

export default useCases;
