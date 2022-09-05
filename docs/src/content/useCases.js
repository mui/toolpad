import * as React from 'react';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';

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
        'Quickly provide the latest numbers and status reports that fuel data-driven decisions. Build and share your dashboard by combining data from multiple sources with dependable deployment mechanism when needed.',
    },
    {
      title: 'Admin panel',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-admin-panel.svg',
      description:
        'Enable your teams to quickly view and manage customer orders, queries, and refunds by creating apps powered by native Toolpad integrations and third party APIs from providers like Stripe, Twilio, etc. Toolpad allows end users to create, read, update or delete records.',
    },
    {
      title: 'Custom CMS',
      wip: false,
      imageUrl: '/static/toolpad/marketing/index-custom-cms.svg',
      description:
        'Enable your operations teams to efficiently manage day to day chores using task specific content management apps. Built with MUI components, apps are fast, manageable and scalable. Toolpad allows you to bind data the pro-code way by writing JavaScript anywhere. ',
    },
  ],
};

export default useCases;
