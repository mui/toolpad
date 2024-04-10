import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { SxProps } from '@mui/system';

import { UPGRADE_URL } from '../../constants';

export interface UpgradeAlertProps {
  sx?: SxProps;
  type?: AlertColor;
  action?: React.ReactNode;
  message?: string;
}

export function UpgradeAlert({ sx, type, action, message }: UpgradeAlertProps) {
  return (
    <Alert
      severity={type ?? 'info'}
      sx={{ '.MuiAlert-action': { pt: 0 }, ...sx }}
      action={action ?? null}
    >
      {message}
    </Alert>
  );
}

export interface UpgradeChipProps {
  sx?: SxProps;
  message?: string;
  url?: string;
}

export function UpgradeChip({
  sx,
  message = `This feature requires a paid plan.`,
  url = UPGRADE_URL,
}: UpgradeChipProps) {
  return (
    <Tooltip title={`${message} Click to learn more.`}>
      <Chip
        variant="outlined"
        color="primary"
        component="a"
        href={url}
        target="_blank"
        rel="noopener"
        size="small"
        clickable
        label="Pro"
        sx={sx}
      />
    </Tooltip>
  );
}
