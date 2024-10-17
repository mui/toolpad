import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const NAVIGATION = [
  { segment: '', title: 'ACME' },
  {
    segment: 'inbox',
    title: 'Home',
    children: [
      {
        segment: 'orders',
        title: 'Orders',
      },
    ],
  },
];

export default function TitleBreadcrumbsPageContainer() {
  const router = useDemoRouter('/inbox/orders');

  const theme = useTheme();

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <Paper sx={{ width: '100%' }}>
        <PageContainer />
      </Paper>
    </AppProvider>
  );
}
