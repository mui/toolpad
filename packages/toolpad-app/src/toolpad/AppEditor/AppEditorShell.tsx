import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  IconButton,
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
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Outlet } from 'react-router-dom';
import invariant from 'invariant';
import DialogForm from '../../components/DialogForm';
import { DomLoader, useDomLoader, useDomApi } from '../DomLoader';
import ToolpadShell from '../ToolpadShell';
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

  const isFormValid = lastRelease.isSuccess;

  const deployMutation = client.useMutation('deploy');
  const doSubmit = handleSubmit(async (releaseParams) => {
    invariant(isFormValid, 'Invalid form state being submited');

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
          <LoadingButton disabled={!isFormValid} loading={deployMutation.isLoading} type="submit">
            Deploy
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

function getSaveState(domLoader: DomLoader): React.ReactNode {
  if (domLoader.saveError) {
    return (
      <Tooltip title="Error while saving">
        <SyncProblemIcon color="primary" />
      </Tooltip>
    );
  }

  const isSaving = domLoader.unsavedChanges > 0;

  if (isSaving) {
    return (
      <Tooltip title="Saving changes…">
        <SyncIcon color="primary" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title="All changes saved!">
      <CloudDoneIcon color="primary" />
    </Tooltip>
  );
}

export interface ToolpadShellProps {
  appId: string;
  actions?: React.ReactNode;
}

export default function AppEditorShell({ appId, ...props }: ToolpadShellProps) {
  const domLoader = useDomLoader();
  const domApi = useDomApi();

  const {
    value: createReleaseDialogOpen,
    setTrue: handleCreateReleaseDialogOpen,
    setFalse: handleCreateReleaseDialogClose,
  } = useBoolean(false);

  return (
    <ToolpadShell
      actions={
        <Stack direction="row" gap={1} alignItems="center">
          <IconButton onClick={domApi.undo}>
            <Tooltip title="Undo">
              <Undo />
            </Tooltip>
          </IconButton>
          <IconButton onClick={domApi.redo}>
            <Tooltip title="Redo">
              <Redo />
            </Tooltip>
          </IconButton>
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            color="primary"
            component="a"
            href={`/app/${appId}/preview`}
            target="_blank"
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            endIcon={<RocketLaunchIcon />}
            color="primary"
            onClick={handleCreateReleaseDialogOpen}
          >
            Deploy
          </Button>
        </Stack>
      }
      status={getSaveState(domLoader)}
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
          onClose={handleCreateReleaseDialogClose}
        />
      </Box>
    </ToolpadShell>
  );
}
