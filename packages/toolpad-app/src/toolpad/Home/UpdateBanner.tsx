import * as React from 'react';
import { Button, Snackbar, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DOCUMENTATION_URL, TOOLPAD_TARGET_CLOUD } from '../../constants';
import client from '../../api';
import useLocalStorageState from '../../utils/useLocalStorageState';

const CURRENT_RELEASE_VERSION = `v${process.env.TOOLPAD_VERSION}`;

function UpdateBanner() {
  const { data: latestRelease } = client.useQuery('getLatestToolpadRelease', [], {
    staleTime: 1000 * 60 * 10,
    enabled: process.env.TOOLPAD_TARGET !== TOOLPAD_TARGET_CLOUD,
  });

  const [dismissedVersion, setDismissedVersion] = useLocalStorageState<string | null>(
    'update-banner-dismissed-version',
    null,
  );

  const handleDismissClick = React.useCallback(
    (event: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway' || reason === 'escapeKeyDown') {
        return;
      }
      setDismissedVersion(CURRENT_RELEASE_VERSION);
    },
    [setDismissedVersion],
  );

  const hideBanner =
    (latestRelease && latestRelease.tag === CURRENT_RELEASE_VERSION) ||
    dismissedVersion === CURRENT_RELEASE_VERSION;

  return latestRelease ? (
    <Snackbar
      open={!hideBanner}
      onClose={handleDismissClick}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      message={
        <React.Fragment>
          A new version <strong>{latestRelease.tag}</strong> of Toolpad is available.
        </React.Fragment>
      }
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
          <IconButton aria-label="close" color="inherit" size="small" onClick={handleDismissClick}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      }
    />
  ) : null;
}

export default UpdateBanner;
