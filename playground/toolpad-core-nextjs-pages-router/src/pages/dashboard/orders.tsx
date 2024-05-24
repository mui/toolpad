import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardOrdersPage() {
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
        Welcome to the Toolpad orders!
      </Typography>
    </Box>
  );
}

DashboardOrdersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
