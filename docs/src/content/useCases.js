import * as React from 'react';
import Typography from '@mui/material/Typography';
import GradientText from '../components/landing/GradientText';

const useCases = {
  Headline: (
    <Typography variant="h2" maxWidth={300} marginBottom={3}>
      Toolpad is ideal for <GradientText>building</GradientText>
    </Typography>
  ),
  cards: [
    {
      title: 'Monitoring dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/toolpad-monitoring-dashboard.png',
      description:
        'Quickly provide the latest numbers and status reports that fuel data-driven decisions. Build and share your dashboard by combining data from multiple sources with dependable version control to rollback changes when needed.',
    },
    {
      title: 'Admin panel',
      wip: false,
      imageUrl: '/static/toolpad/marketing/toolpad-admin-panel.png',
      description:
        'Enable your teams to quickly view and manage customer orders, queries, and refunds by creating apps powered by native Toolpad integrations and third party APIs from providers like Stripe, Twilio, etc. Toolpad allows end users to create, read, update or delete records.',
    },
    {
      title: 'Custom CMS',
      wip: false,
      imageUrl: '/static/toolpad/marketing/toolpad-custom-cms.png',
      description:
        'Enable your operations team to efficiently manage day to day chores using operation specific content management apps. Built with MUI components, apps are fast, manageable and scalable. Toolpad allows you to bind data the pro-code way by writing JavaScript anywhere. ',
    },
  ],
};

export default useCases;
