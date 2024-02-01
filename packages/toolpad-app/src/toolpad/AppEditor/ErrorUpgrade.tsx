import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UPGRADE_URL } from '../../constants';

export function ErrorUpgrade({ feature, hideAction }: { feature?: string; hideAction?: boolean }) {
  return (
    <Alert
      severity="error"
      action={
        hideAction ? null : (
          <Button variant={'text'} LinkComponent={'a'} href={UPGRADE_URL} target="_blank">
            Upgrade
            <OpenInNewIcon fontSize="inherit" sx={{ ml: 1 }} />
          </Button>
        )
      }
    >
      {`${feature ?? 'This feature'} is only available on paid plans.`}
    </Alert>
  );
}
