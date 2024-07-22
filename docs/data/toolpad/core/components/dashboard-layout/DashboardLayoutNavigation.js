import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { extendTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const demoTheme = extendTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutNavigation(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState('/page');

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    // preview-start
    <AppProvider
      navigation={[
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
      ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutNavigation.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutNavigation;
