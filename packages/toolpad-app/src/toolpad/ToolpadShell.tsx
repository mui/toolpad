import * as React from 'react';
import {
  styled,
  Alert,
  AppBar,
  Button,
  Box,
  Collapse,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useMenu from '../utils/useMenu';
import useLocalStorageState from '../utils/useLocalStorageState';
import client from '../api';

const DOCUMENTATION_URL = 'https://mui.com/toolpad/getting-started/setup/';
const REPORT_BUG_URL =
  'https://github.com/mui/mui-toolpad/issues/new?assignees=&labels=status%3A+needs+triage&template=1.bug.yml';
const FEATURE_REQUEST_URL = 'https://github.com/mui/mui-toolpad/issues';
const CURRENT_RELEASE_VERSION = `v${process.env.TOOLPAD_VERSION}`;

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
  const { buttonProps, menuProps } = useMenu();

  return (
    <React.Fragment>
      <Tooltip title="Help and resources">
        <IconButton {...buttonProps} color="inherit">
          <HelpOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu {...menuProps}>
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

function UpdateBanner() {
  const { data: latestRelease } = client.useQuery('getLatestToolpadRelease', [], {
    staleTime: 1000 * 60 * 10,
  });

  const [dismissedVersion, setDismissedVersion] = useLocalStorageState<string | null>(
    'update-banner-dismissed-version',
    null,
  );

  const handleDismissClick = React.useCallback(() => {
    setDismissedVersion(CURRENT_RELEASE_VERSION);
  }, [setDismissedVersion]);

  const hideBanner =
    (latestRelease && latestRelease.tag === CURRENT_RELEASE_VERSION) ||
    dismissedVersion === CURRENT_RELEASE_VERSION;

  return (
    <React.Fragment>
      {latestRelease && process.env.TOOLPAD_TARGET === 'CE' ? (
        <Collapse in={!hideBanner}>
          <Alert
            action={
              <Stack direction="row" sx={{ gap: 2 }}>
                <Button
                  aria-label="update"
                  color="inherit"
                  endIcon={<OpenInNewIcon fontSize="inherit" />}
                  component="a"
                  target="_blank"
                  href={DOCUMENTATION_URL}
                >
                  Update
                </Button>
                <Button
                  aria-label="view changelog"
                  color="inherit"
                  endIcon={<OpenInNewIcon fontSize="inherit" />}
                  component="a"
                  target="_blank"
                  href={latestRelease.url}
                >
                  View changelog
                </Button>
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleDismissClick}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            }
            severity="info"
          >
            A new version <strong>{latestRelease.tag}</strong> of Toolpad is available.
          </Alert>
        </Collapse>
      ) : null}
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
        <Chip sx={{ ml: 1 }} label="Demo" color="primary" size="small" />
        {navigation}
        <Box flex={1} />
        {actions}
        <UserFeedback />
      </Toolbar>
    </AppBar>
  );
}

export default function ToolpadShell({ children, ...props }: ToolpadShellProps) {
  return (
    <ToolpadShellRoot>
      <Header {...props} />
      <ViewPort>{children}</ViewPort>
      <UpdateBanner />
    </ToolpadShellRoot>
  );
}
