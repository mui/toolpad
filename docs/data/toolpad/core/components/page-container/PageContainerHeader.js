import * as React from 'react';
// preview-start
import { PageHeader } from '@toolpad/core/PageContainer';
// preview-end
import { AppProvider } from '@toolpad/core/AppProvider';
import { useDemoRouter } from '@toolpad/core/internal';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

const NAVIGATION = [
  { segment: '', title: 'Home' },
  { segment: 'orders', title: 'Orders' },
];

export default function PageContainerHeader() {
  const router = useDemoRouter('/orders');

  const theme = useTheme();

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <Paper sx={{ width: '100%' }}>
        {/* preview-start */}
        <Container sx={{ my: 2 }}>
          <PageHeader />
          <Box sx={{ mt: 1 }}>Page content</Box>
        </Container>
        {/* preview-end */}
      </Paper>
    </AppProvider>
  );
}
