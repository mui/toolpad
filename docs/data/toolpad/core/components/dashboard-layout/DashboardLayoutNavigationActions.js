import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CallIcon from '@mui/icons-material/Call';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';

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

const CALLS_NAVIGATION = [
  {
    segment: 'made',
    title: 'Made',
    icon: <CallMadeIcon />,
    action: <Chip label={12} color="success" size="small" />,
  },
  {
    segment: 'received',
    title: 'Received',
    icon: <CallReceivedIcon />,
    action: <Chip label={4} color="error" size="small" />,
  },
];

function DashboardLayoutNavigationActions(props) {
  const { window } = props;

  const router = useDemoRouter('/contacts');

  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null);

  const isPopoverOpen = Boolean(popoverAnchorEl);
  const popoverId = isPopoverOpen ? 'simple-popover' : undefined;

  const handlePopoverButtonClick = (event) => {
    event.stopPropagation();
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event) => {
    event.stopPropagation();
    setPopoverAnchorEl(null);
  };

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const popoverMenuAction = (
    <React.Fragment>
      <IconButton aria-describedby={popoverId} onClick={handlePopoverButtonClick}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id={popoverId}
        open={isPopoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        disableAutoFocus
        disableAutoFocusItem
      >
        <MenuItem onClick={handlePopoverClose}>New call</MenuItem>
        <MenuItem onClick={handlePopoverClose}>Mark all as read</MenuItem>
      </Menu>
    </React.Fragment>
  );

  return (
    // preview-start
    <AppProvider
      navigation={[
        {
          segment: 'contacts',
          title: 'Contacts',
          icon: <PersonIcon />,
          action: <Chip label={7} color="primary" size="small" />,
        },
        {
          segment: 'calls',
          title: 'Calls',
          icon: <CallIcon />,
          action: popoverMenuAction,
          children: CALLS_NAVIGATION,
        },
      ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutNavigationActions.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutNavigationActions;
