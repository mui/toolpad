import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { SxProps, Theme } from '@mui/system';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UPGRADE_URL } from '../../constants';

export function UpgradeAlert({
  type,
  feature,
  warning,
  action,
  sx,
}: {
  type?: AlertColor;
  feature?: string;
  warning?: string;
  action?: boolean;
  sx?: SxProps<Theme>;
}) {
  let message = `This feature requires a paid plan.`;

  if (warning) {
    message = warning;
  }
  if (feature) {
    message = `${feature} requires a paid plan.`;
  }

  return (
    <Alert
      severity={type ?? 'info'}
      sx={{ '.MuiAlert-action': { pt: 0 }, ...sx }}
      action={
        action ? (
          <Button
            variant="text"
            sx={{ fontSize: 'inherit' }}
            href={UPGRADE_URL}
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            Upgrade
          </Button>
        ) : null
      }
    >
      {message}
    </Alert>
  );
}

export interface UpgradeChipProps {
  sx?: SxProps;
  feature?: string;
  warning?: string;
}

export function UpgradeChip({ sx, feature, warning }: UpgradeChipProps) {
  let message = `This feature requires a paid plan.`;

  if (warning) {
    message = warning;
  }
  if (feature) {
    message = `${feature} requires a paid plan.`;
  }
  return (
    <Tooltip title={`${message} Click to learn more.`}>
      <Chip
        variant="outlined"
        color="primary"
        component="a"
        href={UPGRADE_URL}
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
