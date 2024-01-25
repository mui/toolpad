import * as React from 'react';
import {
  Chip,
  Divider,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import invariant from 'invariant';
import useBoolean from '@mui/toolpad-utils/hooks/useBoolean';
import useMenu from '../../../../utils/useMenu';
import { DOCUMENTATION_URL, VERSION_CHECK_INTERVAL } from '../../../../constants';
import { useProjectApi } from '../../../../projectApi';
import type { PackageManager } from '../../../../server/versionInfo';

const REPORT_BUG_URL =
  'https://github.com/mui/mui-toolpad/issues/new?assignees=&labels=status%3A+needs+triage&template=1.bug.yml';
const FEATURE_REQUEST_URL = 'https://github.com/mui/mui-toolpad/issues';
const SUPPORT_URL = 'https://mui.com/toolpad/getting-started/support';
interface SnippetProps {
  children: string;
}

function CliCommandSnippet({ children }: SnippetProps) {
  return (
    <Box
      component="pre"
      sx={{
        p: 1,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  );
}

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

function getUpgradeMessage(packageManager: PackageManager | null): string {
  const pkgName = '@mui/toolpad';
  switch (packageManager) {
    case 'yarn':
      return `yarn add ${pkgName}`;
    case 'pnpm':
      return `pnpm add ${pkgName}`;
    default:
      return `npm install ${pkgName}`;
  }
}

function UserFeedback() {
  const { buttonProps, menuProps } = useMenu();
  const projectApi = useProjectApi();

  invariant(process.env.TOOLPAD_VERSION, 'Missing env var TOOLPAD_VERSION');
  invariant(process.env.TOOLPAD_BUILD, 'Missing env var TOOLPAD_BUILD');

  const { data: versionInfo } = projectApi.useQuery('getVersionInfo', [], {
    staleTime: VERSION_CHECK_INTERVAL,
  });

  const {
    value: updateDialogOpen,
    setFalse: handleUpdateDialogClose,
    setTrue: handleUpdateDialogOpen,
  } = useBoolean(false);

  const updateAvailable = !!versionInfo?.updateAvailable;

  return (
    <React.Fragment>
      <Dialog open={updateDialogOpen} onClose={handleUpdateDialogClose} maxWidth="xs">
        <DialogTitle>Update Toolpad</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A new Toolpad version is available. To upgrade to the latest version, run:
            <CliCommandSnippet>
              {getUpgradeMessage(versionInfo?.packageManager ?? null)}
            </CliCommandSnippet>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip title="Help and resources">
        <IconButton {...buttonProps} color="primary">
          <HelpOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu {...menuProps}>
        <FeedbackMenuItemLink href={DOCUMENTATION_URL}>Documentation</FeedbackMenuItemLink>
        <FeedbackMenuItemLink href={REPORT_BUG_URL}>Report bug</FeedbackMenuItemLink>
        <FeedbackMenuItemLink href={FEATURE_REQUEST_URL}>
          Request or upvote feature
        </FeedbackMenuItemLink>
        <FeedbackMenuItemLink href={SUPPORT_URL}>Request support</FeedbackMenuItemLink>
        <Divider />

        <MenuItem
          disabled={!updateAvailable}
          onClick={handleUpdateDialogOpen}
          sx={{ justifyContent: 'space-between' }}
        >
          Version {process.env.TOOLPAD_VERSION}
          {updateAvailable ? (
            <Chip size="small" color="error" variant="outlined" label="Update" clickable />
          ) : null}
        </MenuItem>
        <MenuItem disabled>Build {process.env.TOOLPAD_BUILD}</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default UserFeedback;
