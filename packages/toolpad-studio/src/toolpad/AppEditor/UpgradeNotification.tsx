import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { SxProps, Theme } from '@mui/system';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UPGRADE_URL } from '../../constants';

export function UpgradeNotification({
  type,
  feature,
  warning,
  variant,
  action,
  sx,
}: {
  type?: AlertColor;
  feature?: string;
  warning?: string;
  variant?: 'alert' | 'chip';
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

  if (variant === 'alert') {
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
  if (variant === 'chip') {
    return (
      <Tooltip title={`${message} Click to learn more.`}>
        <Chip
          variant="outlined"
          color="primary"
          component="a"
          href={UPGRADE_URL}
          target="_blank"
          rel="noopener"
          clickable
          sx={{
            height: '1.5rem',
            fontSize: 'inherit',
            verticalAlign: 'inherit',
            mx: '0.2rem',
          }}
          label="Pro"
        />
      </Tooltip>
    );
  }
}
