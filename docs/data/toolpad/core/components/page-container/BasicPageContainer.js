import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internals/demo';
import { Paper } from '@mui/material';

const NAVIGATION = [
  { segment: '', title: 'Home' },
  { segment: 'orders', title: 'Orders' },
];

export default function BasicPageContainer() {
  const router = useDemoRouter('/orders');

  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <Paper sx={{ width: '100%' }}>
        {/* preview-start */}
        <PageContainer>Page content</PageContainer>
        {/* preview-end */}
      </Paper>
    </AppProvider>
  );
}
