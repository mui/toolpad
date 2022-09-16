import * as React from 'react';
import {
  styled,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  Tooltip,
  Link,
  useTheme,
} from '@mui/material';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Image from 'next/image';
import useMenu from '../utils/useMenu';
import {
  TOOLPAD_TARGET_CLOUD,
  TOOLPAD_TARGET_CE,
  TOOLPAD_TARGET_PRO,
  DOCUMENTATION_URL,
} from '../constants';
import productIconDark from '../../public/product-icon-dark.svg';
import productIconLight from '../../public/product-icon-light.svg';

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
  actions?: React.ReactNode;
  status?: React.ReactNode;
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

function getReadableTarget(): string {
  switch (process.env.TOOLPAD_TARGET) {
    case TOOLPAD_TARGET_CLOUD:
      return 'Cloud';
    case TOOLPAD_TARGET_CE:
      return 'Community';
    case TOOLPAD_TARGET_PRO:
      return 'Pro';
    default:
      return 'Unknown';
  }
}

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
        <MenuItem disabled>{getReadableTarget()}</MenuItem>
        <MenuItem disabled>Version {process.env.TOOLPAD_VERSION}</MenuItem>
        <MenuItem disabled>Build {process.env.TOOLPAD_BUILD}</MenuItem>
      </Menu>
    </React.Fragment>
  );
}
export interface HeaderProps {
  actions?: React.ReactNode;
  status?: React.ReactNode;
}

function Header({ actions, status }: HeaderProps) {
  const theme = useTheme();
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ zIndex: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'start',
          }}
        >
          <Tooltip title="Home">
            <Link
              color="inherit"
              aria-label="Home"
              href="/"
              underline="none"
              sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Image
                src={theme.palette.mode === 'dark' ? productIconDark : productIconLight}
                alt="Toolpad product icon"
                width={25}
                height={25}
              />
              <Box
                data-test-id="brand"
                sx={{
                  color: 'primary.main',
                  lineHeight: '21px',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                MUI Toolpad
              </Box>
            </Link>
          </Tooltip>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {actions}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'end',
            gap: 2,
          }}
        >
          {status}
          <UserFeedback />
        </Box>
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
