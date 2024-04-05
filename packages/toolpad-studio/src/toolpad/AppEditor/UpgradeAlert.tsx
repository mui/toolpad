import * as React from 'react';
import Alert, { AlertColor } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/system';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Typography from '@mui/material/Typography';
import { UPGRADE_URL } from '../../constants';

function UpgradeAction({ variant }: { variant: 'button' | 'inline' }) {
  return variant === 'inline' ? (
    <Typography variant="button" component="span" color="primary">
      <a
        href={UPGRADE_URL}
        target="_blank"
        rel="noopener"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        Upgrade
      </a>
      <OpenInNewIcon fontSize="inherit" sx={{ mx: 0.5 }} />
    </Typography>
  ) : (
    <Button variant="text" LinkComponent="a" href={UPGRADE_URL} target="_blank" rel="noopener">
      Upgrade <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5 }} />
    </Button>
  );
}

export function UpgradeAlert({
  type,
  feature,
  warning,
  variant,
  sx,
}: {
  type?: AlertColor;
  feature?: string;
  warning?: string;
  variant?: 'inline' | 'button';
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
      action={variant === 'button' ? <UpgradeAction variant="button" /> : null}
    >
      {variant === 'inline' ? (
        <React.Fragment>
          {alert} <UpgradeAction variant="inline" />
        </React.Fragment>
      ) : (
        alert
      )}
    </Alert>
  );
}
