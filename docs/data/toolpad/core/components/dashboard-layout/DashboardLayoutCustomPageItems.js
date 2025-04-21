import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LinkIcon from '@mui/icons-material/Link';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AppProvider } from '@toolpad/core/AppProvider';
import {
  DashboardLayout,
  DashboardSidebarPageItem,
} from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'external',
    title: 'External Link',
    icon: <LinkIcon />,
  },
  {
    segment: 'selected',
    title: 'Selected Item',
    icon: <CheckBoxIcon />,
  },
  {
    segment: 'disabled',
    title: 'Disabled Item',
    icon: <DisabledByDefaultIcon />,
  },
  {
    segment: 'hidden',
    title: 'Hidden Item',
    icon: <VisibilityOffIcon />,
  },
  {
    segment: 'expanded',
    title: 'Expanded Folder',
    icon: <FolderIcon />,
    children: [
      {
        segment: 'sub-item-1',
        title: 'Sub-Item 1',
        icon: <DescriptionIcon />,
      },
      {
        segment: 'sub-item-2',
        title: 'Sub-Item 2',
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: 'custom',
    title: 'Custom Item',
  },
];

function CustomPageItem({ item, mini }) {
  return (
    <ListItem
      sx={(theme) => ({
        color: theme.palette.secondary.main,
        overflowX: 'hidden',
      })}
    >
      {mini ? (
        <IconButton
          aria-label="custom"
          sx={(theme) => ({
            color: theme.palette.secondary.main,
          })}
        >
          <AutoAwesomeIcon />
        </IconButton>
      ) : (
        <ListItemButton>
          <ListItemIcon
            sx={(theme) => ({
              color: theme.palette.secondary.main,
            })}
          >
            <AutoAwesomeIcon />
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              whiteSpace: 'nowrap',
            }}
          />
        </ListItemButton>
      )}
    </ListItem>
  );
}

CustomPageItem.propTypes = {
  item: PropTypes.shape({
    action: PropTypes.node,
    children: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.shape({
          kind: PropTypes.oneOf(['header']).isRequired,
          title: PropTypes.string.isRequired,
        }),
        PropTypes.shape({
          kind: PropTypes.oneOf(['divider']).isRequired,
        }),
      ]).isRequired,
    ),
    icon: PropTypes.node,
    kind: PropTypes.oneOf(['page']),
    pattern: PropTypes.string,
    segment: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  mini: PropTypes.bool.isRequired,
};

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
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

function DashboardLayoutCustomPageItems(props) {
  const { window } = props;

  const router = useDemoRouter('/dashboard');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  // preview-start
  const renderPageItem = React.useCallback((item, { mini }) => {
    if (item.title === 'External Link') {
      return (
        <DashboardSidebarPageItem item={item} href="https://www.mui.com/toolpad" />
      );
    }
    if (item.title === 'Selected Item') {
      return <DashboardSidebarPageItem item={item} selected />;
    }
    if (item.title === 'Disabled Item') {
      return <DashboardSidebarPageItem item={item} disabled />;
    }
    if (item.title === 'Hidden Item') {
      return null;
    }
    if (item.title === 'Expanded Folder') {
      return <DashboardSidebarPageItem item={item} expanded />;
    }
    if (item.title === 'Custom Item') {
      return <CustomPageItem item={item} mini={mini} />;
    }

    return <DashboardSidebarPageItem item={item} />;
  }, []);
  // preview-end

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      {/* preview-start */}
      <DashboardLayout renderPageItem={renderPageItem}>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
      {/* preview-end */}
    </AppProvider>
  );
}

DashboardLayoutCustomPageItems.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutCustomPageItems;
