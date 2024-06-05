import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const NAVIGATION = [
  {
    title: 'Page',
    icon: <DashboardIcon />,
  },
];

export default function TutorialDefault() {
  return (
    <AppProvider navigation={NAVIGATION}>
      <DashboardLayout>
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>Dashboard content</Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
