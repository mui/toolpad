import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Outlet } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import invariant from 'invariant';
import DialogForm from '../../components/DialogForm';
import { useDomLoader } from '../DomLoader';
import ToolpadAppShell from '../ToolpadAppShell';
import PagePanel from './PagePanel';
import client from '../../api';
import useBoolean from '../../utils/useBoolean';

interface CreateReleaseDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

function CreateReleaseDialog({ appId, open, onClose }: CreateReleaseDialogProps) {
  const lastRelease = client.useQuery('findLastRelease', [appId]);

  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: {
      description: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [reset, open]);

  const deployMutation = client.useMutation('deploy');
  const doSubmit = handleSubmit(async (releaseParams) => {
    await deployMutation.mutateAsync([appId, releaseParams]);
    const url = new URL(`/deploy/${appId}/pages`, window.location.href);
    const deploymentWindow = window.open(url, '_blank');
    invariant(deploymentWindow, 'window failed to open');
    deploymentWindow.focus();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogForm autoComplete="off" onSubmit={doSubmit}>
        <DialogTitle>Deploy application</DialogTitle>
        <DialogContent>
          {lastRelease.isSuccess ? (
            <Stack spacing={1}>
              <Typography>
                You are about to deploy your application to production. Please summarize the changes
                you have made to the application since the last release:
              </Typography>
              <TextField
                label="description"
                autoFocus
                fullWidth
                multiline
                rows={5}
                {...register('description')}
                error={Boolean(formState.errors.description)}
                helperText={formState.errors.description?.message}
              />
            </Stack>
          ) : null}

          {deployMutation.isError ? (
            <Alert severity="error">{(deployMutation.error as Error).message}</Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            disabled={!lastRelease.isSuccess}
            loading={deployMutation.isLoading}
            type="submit"
          >
            Deploy
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

function getSaveStateMessage(isSaving: boolean, hasUnsavedChanges: boolean): string {
  if (isSaving) {
    return 'Saving changes...';
  }
  if (hasUnsavedChanges) {
    return 'You have unsaved changes.';
  }
  return 'All changes saved!';
}

export interface ToolpadAppShellProps {
  appId: string;
  actions?: React.ReactNode;
}

export default function AppEditorShell({ appId, ...props }: ToolpadAppShellProps) {
  const domLoader = useDomLoader();

  const {
    value: createReleaseDialogOpen,
    setTrue: handleCreateReleasDialogOpen,
    setFalse: handleCreateReleasDialogClose,
  } = useBoolean(false);

  const [isSaveStateVisible, setIsSaveStateVisible] = React.useState(false);

  const hasUnsavedChanges = domLoader.unsavedChanges > 0;
  const isSaving = domLoader.saving;

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (!hasUnsavedChanges) {
      timeout = setTimeout(() => {
        setIsSaveStateVisible(false);

        if (timeout) {
          clearTimeout(timeout);
        }
      }, 4500);
    } else {
      setIsSaveStateVisible(true);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [hasUnsavedChanges]);

  return (
    <ToolpadAppShell
      appId={appId}
      actions={
        <Stack direction="row" gap={1} alignItems="center">
          {isSaveStateVisible ? (
            <Tooltip title={getSaveStateMessage(isSaving, hasUnsavedChanges)}>
              <Box display="flex" flexDirection="row" alignItems="center">
                {isSaving ? (
                  <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                ) : (
                  <CloudDoneIcon
                    color={hasUnsavedChanges ? 'disabled' : 'success'}
                    fontSize="medium"
                  />
                )}
              </Box>
            </Tooltip>
          ) : null}
          <Button
            variant="outlined"
            color="inherit"
            component="a"
            href={`/app/${appId}/preview`}
            target="_blank"
            endIcon={<OpenInNewIcon />}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCreateReleasDialogOpen}
            endIcon={<RocketLaunchIcon />}
          >
            Deploy
          </Button>
        </Stack>
      }
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <PagePanel
          appId={appId}
          sx={{
            width: 250,
            borderRight: 1,
            borderColor: 'divider',
          }}
        />
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Outlet />
        </Box>

        <CreateReleaseDialog
          appId={appId}
          open={createReleaseDialogOpen}
          onClose={handleCreateReleasDialogClose}
        />
      </Box>
    </ToolpadAppShell>
  );
}
