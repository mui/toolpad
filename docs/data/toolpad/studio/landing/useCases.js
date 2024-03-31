import * as React from 'react';
import Typography from '@mui/material/Typography';
import GradientText from 'docs/src/components/typography/GradientText';

const useCases = {
  overline: 'Use cases',
  Headline: (
    <Typography variant="h2" maxWidth={300} marginBottom={3}>
      Toolpad Studio is ideal for <GradientText>building</GradientText>
    </Typography>
  ),
  cards: [
    {
      title: 'Utility apps',
      wip: false,
      imageUrl: '/static/toolpad/marketing/qr-generator.png',
      description:
        'Provide the stakeholders with simple apps to manage their daily operations. You can quickly build an app on Toolpad Studio by calling APIs or writing custom functions. Your app remains secure as the code never leaves your network, and you can securely deploy it to any service you choose.',
      action: {
        href: '/toolpad/studio/examples/qr-generator/',
        label: 'View example',
      },
    },
    {
      title: 'Admin panel',
      wip: false,
      imageUrl: '/static/toolpad/marketing/admin-app.png',
      description:
        'Enable your teams to quickly view and manage customer orders, queries, and refunds by creating admin apps that gather data from third-party APIs providers like Stripe, Twilio, Zendesk, etc. Toolpad Studio allows end users to create, read, update, or delete records.',
      action: {
        href: '/toolpad/studio/examples/basic-crud-app/',
        label: 'View example',
      },
    },
    {
      title: 'BI dashboard',
      wip: false,
      imageUrl: '/static/toolpad/marketing/npm-stats.png',
      description:
        'Build BI dashboards to slice and dice any metric across various dimensions. Further, use them to monitor KPIs, track business goals, and identify trends and opportunities. Toolpad Studio allows you to combine data from multiple sources and bind it by writing JavaScript anywhere.',
      action: {
        href: '/toolpad/studio/examples/npm-stats/',
        label: 'View example',
      },
    },
  ],
};

export default useCases;
