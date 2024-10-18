import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const NAVIGATION = [
  { segment: '', title: 'Home' },
  { segment: 'orders', title: 'Orders' },
];

export default function BasicPageContainer() {
  const router = useDemoRouter('/orders');

  const theme = useTheme();

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <Paper sx={{ width: '100%' }}>
        {/* preview-start */}
        <PageContainer>Page content</PageContainer>
        {/* preview-end */}
      </Paper>
    </AppProvider>
  );
}
