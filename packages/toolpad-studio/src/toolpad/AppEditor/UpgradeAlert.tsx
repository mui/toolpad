import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import { SxProps, Theme } from '@mui/system';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UPGRADE_URL } from '../../constants';

export function UpgradeAlert({
  type,
  feature,
  warning,
  hideAction,
  sx,
}: {
  type?: AlertColor;
  feature?: string;
  warning?: string;
  hideAction?: boolean;
  sx?: SxProps<Theme>;
}) {
  let alert = `This feature requires a paid plan.`;
  if (warning) {
    alert = warning;
  }
  if (feature) {
    alert = `${feature} requires a paid plan.`;
  }

  return (
    <Alert
      severity={type ?? 'error'}
      sx={sx}
      action={
        hideAction ? null : (
          <Button variant={'text'} LinkComponent={'a'} href={UPGRADE_URL} target="_blank">
            Upgrade
            <OpenInNewIcon fontSize="inherit" sx={{ ml: 1 }} />
          </Button>
        )
      }
    >
      {alert}
    </Alert>
  );
}
