import * as React from 'react';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';
import ROUTES from 'docs/src/route';

const useCases = {
  overline: 'Use cases',
  Headline: (
    <Typography variant="h2" maxWidth={300} marginBottom={3}>
      Toolpad is ideal for <GradientText>building</GradientText>
    </Typography>
  ),
  cards: [
    {
      title: 'Monitoring dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-monitoring-dashboard.svg',
      description:
        'Provide stakeholders with dashboards to track performance of systems and processes, identify potential issues, and ensure that critical services run smoothly. Build and share your monitoring dashboards by combining data from multiple sources with dependable deployment mechanism when needed.',
      action: {
        href: ROUTES.toolpadAdminExample,
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
        label: 'View example',
      },
    },
    {
      title: 'BI dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-custom-cms.svg',
      description:
        'Build customizable BI dashboards for stakeholders to view and analyze various data points, monitor KPIs, track business goals, and identify trends and opportunities. Built with MUI components, apps are fast, manageable and scalable. Toolpad allows you to bind data the pro-code way by writing JavaScript anywhere.',
      action: {
        label: 'View example',
      },
    },
  ],
};

export default useCases;
