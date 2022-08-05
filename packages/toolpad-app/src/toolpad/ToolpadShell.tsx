import * as React from 'react';
import {
  styled,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  Tooltip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const DOCUMENTATION_URL = 'https://mui.com/toolpad/getting-started/setup/';
const REPORT_BUG_URL =
  'https://github.com/mui/mui-toolpad/issues/new?assignees=&labels=status%3A+needs+triage&template=1.bug.yml';
const FEATURE_REQUEST_URL = 'https://github.com/mui/mui-toolpad/issues';

interface FeedbackMenuItemLinkProps {
  href: string;
  children: React.ReactNode;
}

function FeedbackMenuItemLink({ href, children }: FeedbackMenuItemLinkProps) {
  return (
    <MenuItem component="a" target="_blank" href={href}>
      <ListItemText>{children}</ListItemText>
      <OpenInNewIcon fontSize="inherit" sx={{ ml: 3, color: 'text.secondary' }} />
    </MenuItem>
  );
}

export interface ToolpadShellProps {
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const ToolpadShellRoot = styled('div')({
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const ViewPort = styled('div')({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
});

function UserFeedback() {
  const menuId = React.useId();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Tooltip title="Help and resources">
        <IconButton
          id={menuId}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          color="inherit"
        >
          <HelpOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': menuId,
        }}
      >
        <FeedbackMenuItemLink href={DOCUMENTATION_URL}>Documentation</FeedbackMenuItemLink>
        <FeedbackMenuItemLink href={REPORT_BUG_URL}>Report bug</FeedbackMenuItemLink>
        <FeedbackMenuItemLink href={FEATURE_REQUEST_URL}>
          Request or upvote feature
        </FeedbackMenuItemLink>
        <Divider />
        <MenuItem disabled>Version {process.env.TOOLPAD_VERSION}</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export interface HeaderProps {
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
}

function Header({ actions, navigation }: HeaderProps) {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ zIndex: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          size="medium"
          edge="start"
          color="inherit"
          aria-label="Home"
          component="a"
          href={`/`}
        >
          <HomeIcon fontSize="medium" />
        </IconButton>
        <Typography data-test-id="brand" variant="h6" color="inherit" component="div">
          MUI Toolpad {process.env.TOOLPAD_TARGET}
        </Typography>
        {navigation}
        <UserFeedback />
        <Box flex={1} />
        {actions}
      </Toolbar>
    </AppBar>
  );
}

export default function ToolpadShell({ children, ...props }: ToolpadShellProps) {
  return (
    <ToolpadShellRoot>
      <Header {...props} />
      <ViewPort>{children}</ViewPort>
    </ToolpadShellRoot>
  );
}
