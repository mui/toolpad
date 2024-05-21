import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const NAVIGATION = [
  {
    title: 'Item 1',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Item 2',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Folder 1',
    icon: <FolderIcon />,
    children: [
      {
        title: 'Item A1',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Item A2',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Folder A1',
        icon: <FolderIcon />,
        children: [
          {
            title: 'Item B1',
            icon: <DescriptionIcon />,
          },
          {
            title: 'Item B2',
            icon: <DescriptionIcon />,
          },
        ],
      },
    ],
  },
  { kind: 'divider' },
  {
    kind: 'header',
    title: 'Header 1',
  },
  {
    title: 'Item A',
    icon: <DescriptionIcon />,
  },
  {
    kind: 'header',
    title: 'Header 2',
  },
  {
    title: 'Item B',
    icon: <DescriptionIcon />,
  },
  {
    title: 'Folder 2',
    icon: <FolderIcon />,
    children: [
      {
        kind: 'header',
        title: 'Header A1',
      },
      {
        title: 'Item C1',
        icon: <DescriptionIcon />,
      },
      {
        title: 'Item C2',
        icon: <DescriptionIcon />,
      },
      { kind: 'divider' },
      {
        kind: 'header',
        title: 'Header A2',
      },
      {
        title: 'Item C3',
        icon: <DescriptionIcon />,
      },
    ],
  },
];

export default function DashboardLayoutNavigation() {
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
          <Typography>Dashboard content goes here.</Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
