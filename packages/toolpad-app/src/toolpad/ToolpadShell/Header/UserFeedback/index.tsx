import * as React from 'react';
import { Chip, Divider, ListItemText, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import useMenu from '../../../../utils/useMenu';
import {
  TOOLPAD_TARGET_CLOUD,
  TOOLPAD_TARGET_CE,
  TOOLPAD_TARGET_PRO,
  DOCUMENTATION_URL,
  DOCUMENTATION_INSTALLATION_URL,
} from '../../../../constants';
import client from '../../../../api';

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

function getReadableTarget(): string {
  switch (process.env.TOOLPAD_TARGET) {
    case TOOLPAD_TARGET_CLOUD:
      return 'Cloud';
    case TOOLPAD_TARGET_CE:
      return 'Community Edition';
    case TOOLPAD_TARGET_PRO:
      return 'Pro';
    default:
      return 'Unknown';
  }
}

function UserFeedback() {
  const { buttonProps, menuProps } = useMenu();

  const { data: latestRelease } = client.useQuery('getLatestToolpadRelease', [], {
    staleTime: 1000 * 60 * 10,
    enabled: process.env.TOOLPAD_TARGET !== TOOLPAD_TARGET_CLOUD,
  });

  return (
    <React.Fragment>
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
        <Divider />
        <MenuItem disabled>{getReadableTarget()}</MenuItem>
        {latestRelease && latestRelease.tag !== CURRENT_RELEASE_VERSION ? (
          <MenuItem
            component="a"
            target="_blank"
            href={DOCUMENTATION_INSTALLATION_URL}
            sx={{ justifyContent: 'space-between' }}
          >
            Version {process.env.TOOLPAD_VERSION}
            <Chip size="small" color="error" variant="outlined" label="Update" clickable />
          </MenuItem>
        ) : (
          <MenuItem disabled>Version {process.env.TOOLPAD_VERSION}</MenuItem>
        )}
        <MenuItem disabled>Build {process.env.TOOLPAD_BUILD}</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default UserFeedback;
