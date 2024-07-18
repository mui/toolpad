import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const NAVIGATION = [
  {
    slug: '/home',
    title: 'Home',
    icon: <DescriptionIcon />,
  },
  {
    slug: '/about',
    title: 'About Us',
    icon: <DescriptionIcon />,
  },
  {
    slug: '/movies',
    title: 'Movies',
    icon: <FolderIcon />,
    children: [
      {
        slug: '/fantasy',
        title: 'Fantasy',
        icon: <DescriptionIcon />,
        children: [
          {
            kind: 'header',
            title: 'Epic Fantasy',
          },
          {
            slug: '/lord-of-the-rings',
            title: 'Lord of the Rings',
            icon: <DescriptionIcon />,
          },
          {
            slug: '/harry-potter',
            title: 'Harry Potter',
            icon: <DescriptionIcon />,
          },
          { kind: 'divider' },
          {
            kind: 'header',
            title: 'Modern Fantasy',
          },
          {
            slug: '/chronicles-of-narnia',
            title: 'Chronicles of Narnia',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        slug: '/action',
        title: 'Action',
        icon: <DescriptionIcon />,
        children: [
          {
            slug: '/mad-max',
            title: 'Mad Max',
            icon: <DescriptionIcon />,
          },
          {
            slug: '/die-hard',
            title: 'Die Hard',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        slug: '/sci-fi',
        title: 'Sci-Fi',
        icon: <DescriptionIcon />,
        children: [
          {
            slug: '/star-wars',
            title: 'Star Wars',
            icon: <DescriptionIcon />,
          },
          {
            slug: '/matrix',
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
    slug: '/mammals',
    title: 'Mammals',
    icon: <DescriptionIcon />,
    children: [
      {
        slug: '/lion',
        title: 'Lion',
        icon: <DescriptionIcon />,
      },
      {
        slug: '/elephant',
        title: 'Elephant',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    slug: '/birds',
    title: 'Birds',
    icon: <DescriptionIcon />,
    children: [
      {
        slug: '/eagle',
        title: 'Eagle',
        icon: <DescriptionIcon />,
      },
      {
        slug: '/parrot',
        title: 'Parrot',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    slug: '/reptiles',
    title: 'Reptiles',
    icon: <DescriptionIcon />,
    children: [
      {
        slug: '/crocodile',
        title: 'Crocodile',
        icon: <DescriptionIcon />,
      },
      {
        slug: '/snake',
        title: 'Snake',
        icon: <DescriptionIcon />,
      },
    ],
  },
];

export default function DashboardLayoutNavigation() {
  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo(() => {
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
