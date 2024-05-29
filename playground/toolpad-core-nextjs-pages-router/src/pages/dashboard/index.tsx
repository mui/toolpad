import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function DashboardPage() {
  return (
    <Box
      sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Welcome to the Toolpad dashboard!
      </Typography>
    </Box>
  );
}

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
