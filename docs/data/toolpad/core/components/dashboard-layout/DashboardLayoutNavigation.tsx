import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { AppProvider, Router } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import type { Navigation } from '@toolpad/core';

const NAVIGATION: Navigation = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'about',
    title: 'About Us',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'movies',
    title: 'Movies',
    icon: <FolderIcon />,
    children: [
      {
        segment: 'fantasy',
        title: 'Fantasy',
        icon: <DescriptionIcon />,
        children: [
          {
            kind: 'header',
            title: 'Epic Fantasy',
          },
          {
            segment: 'lord-of-the-rings',
            title: 'Lord of the Rings',
            icon: <DescriptionIcon />,
          },
          {
            segment: 'harry-potter',
            title: 'Harry Potter',
            icon: <DescriptionIcon />,
          },
          { kind: 'divider' },
          {
            kind: 'header',
            title: 'Modern Fantasy',
          },
          {
            segment: 'chronicles-of-narnia',
            title: 'Chronicles of Narnia',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        segment: 'action',
        title: 'Action',
        icon: <DescriptionIcon />,
        children: [
          {
            segment: 'mad-max',
            title: 'Mad Max',
            icon: <DescriptionIcon />,
          },
          {
            segment: 'die-hard',
            title: 'Die Hard',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        segment: 'sci-fi',
        title: 'Sci-Fi',
        icon: <DescriptionIcon />,
        children: [
          {
            segment: 'star-wars',
            title: 'Star Wars',
            icon: <DescriptionIcon />,
          },
          {
            segment: 'matrix',
            title: 'The Matrix',
            icon: <DescriptionIcon />,
          },
        ],
      },
    ],
  },
  { kind: 'divider' },
  {
    kind: 'header',
    title: 'Animals',
  },
  {
    segment: 'mammals',
    title: 'Mammals',
    icon: <DescriptionIcon />,
    children: [
      {
        segment: 'lion',
        title: 'Lion',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'elephant',
        title: 'Elephant',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'birds',
    title: 'Birds',
    icon: <DescriptionIcon />,
    children: [
      {
        segment: 'eagle',
        title: 'Eagle',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'parrot',
        title: 'Parrot',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'reptiles',
    title: 'Reptiles',
    icon: <DescriptionIcon />,
    children: [
      {
        segment: 'crocodile',
        title: 'Crocodile',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'snake',
        title: 'Snake',
        icon: <DescriptionIcon />,
      },
    ],
  },
];

export default function DashboardLayoutNavigation() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <DashboardLayout>
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>Dashboard content for {pathname}</Typography>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
