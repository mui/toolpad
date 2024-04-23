import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const baseTheme = createTheme();

const theme = createTheme(baseTheme, {
  palette: {
    background: {
      default: baseTheme.palette.grey['50'],
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
          borderColor: baseTheme.palette.divider,
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
          color: baseTheme.palette.primary.dark,
          padding: 8,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.grey['600'],
          fontSize: 12,
          fontWeight: '700',
          height: 40,
          paddingLeft: 32,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            '& .MuiListItemIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTypography-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiSvgIcon-root': {
              color: baseTheme.palette.primary.dark,
            },
            '& .MuiTouchRipple-child': {
              backgroundColor: baseTheme.palette.primary.dark,
            },
          },
          '& .MuiSvgIcon-root': {
            color: baseTheme.palette.action.active,
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
          minWidth: '34px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderBottomWidth: 2,
          margin: '8px 16px 0',
        },
      },
    },
  },
});

const NAVIGATION = [
  {
    title: 'Main items',
    items: [
      {
        label: 'Dashboard',
        icon: <DashboardIcon />,
      },
      {
        label: 'Orders',
        icon: <ShoppingCartIcon />,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        label: 'Reports',
        icon: <BarChartIcon />,
        items: [
          {
            label: 'Sales',
            icon: <DescriptionIcon />,
          },
          {
            label: 'Traffic',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        label: 'Integrations',
        icon: <LayersIcon />,
      },
    ],
  },
];

function DocsToolpadAppFrame({ children }) {
  const docsTheme = useTheme();

  const frameRef = React.useRef(null);
  const [hasFrameContent, setHasFrameContent] = React.useState(false);

  React.useEffect(() => {
    if (frameRef.current) {
      setHasFrameContent(true);
    }
  }, []);

  const emotionCache = createCache({
    key: 'dashboard-layout',
    container: frameRef.current?.contentWindow.document.head,
  });

  return (
    <iframe
      ref={frameRef}
      title="dashboard-layout"
      height="600"
      width="100%"
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: docsTheme.palette.grey['200'],
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        marginBottom: '-9px',
      }}
    >
      {hasFrameContent
        ? ReactDOM.createPortal(
            <CacheProvider value={emotionCache}>{children}</CacheProvider>,
            frameRef.current.contentWindow.document.body,
          )
        : null}
    </iframe>
  );
}

DocsToolpadAppFrame.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function BasicDashboardLayout() {
  return (
    <DocsToolpadAppFrame>
      <AppProvider theme={theme} navigation={NAVIGATION}>
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
    </DocsToolpadAppFrame>
  );
}
