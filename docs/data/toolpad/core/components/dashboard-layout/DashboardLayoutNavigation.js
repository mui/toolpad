import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const defaultTheme = createTheme({
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

const theme = createTheme(defaultTheme, {
  palette: {
    background: {
      default: defaultTheme.palette.grey['50'],
    },
  },
  typography: {
    h6: {
      fontWeight: '700',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderWidth: 0,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: defaultTheme.palette.divider,
          boxShadow: 'none',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: defaultTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: defaultTheme.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: defaultTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: defaultTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: defaultTheme.palette.action.active,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          '& .MuiTypography-root': {
            fontWeight: '500',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 34,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderBottomWidth: 2,
          marginLeft: '16px',
          marginRight: '16px',
        },
      },
    },
  },
});

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
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <AppProvider navigation={NAVIGATION} router={router} theme={theme}>
      <DashboardLayout container={container}>
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

DashboardLayoutNavigation.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutNavigation;
