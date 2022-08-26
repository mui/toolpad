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
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Outlet, useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DialogForm from '../../components/DialogForm';
import { useDomLoader } from '../DomLoader';
import ToolpadAppShell from '../ToolpadAppShell';
import PagePanel from './PagePanel';
import client from '../../api';

interface CreateReleaseDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

function CreateReleaseDialog({ appId, open, onClose }: CreateReleaseDialogProps) {
  const navigate = useNavigate();

  const lastRelease = client.useQuery('findLastRelease', [appId]);

  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: {
      description: '',
    },
  });

  const createReleaseMutation = client.useMutation('createRelease');
  const doSubmit = handleSubmit(async (releaseParams) => {
    const newRelease = await createReleaseMutation.mutateAsync([appId, releaseParams]);
    reset();
    navigate(`/app/${appId}/releases/${newRelease.version}`);
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogForm autoComplete="off" onSubmit={doSubmit}>
        <DialogTitle>Create new release</DialogTitle>
        <DialogContent>
          {lastRelease.isSuccess ? (
            <Stack spacing={1}>
              <Typography>
                You are about to create a snapshot of your application under a unique url. You will
                be able to verify whether everything is working correctly before deploying this
                release to production.
              </Typography>
              <Typography>
                The new version to be created is &quot;
                {lastRelease.data ? lastRelease.data.version + 1 : 1}&quot;.
              </Typography>
              <Typography>
                Please summarize the changes you have made to the application since the last
                release:
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

          {createReleaseMutation.isError ? (
            <Alert severity="error">{(createReleaseMutation.error as Error).message}</Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            disabled={!lastRelease.isSuccess}
            loading={createReleaseMutation.isLoading}
            type="submit"
          >
            Create
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

  const [createReleaseDialogOpen, setCreateReleaseDialogOpen] = React.useState(false);

  const hasUnsavedChanges = domLoader.unsavedChanges > 0;

  return (
    <ToolpadAppShell
      appId={appId}
      actions={
        <Stack direction="row" gap={1} alignItems="center">
          {domLoader.saving ? (
            <Box display="flex" flexDirection="row" alignItems="center">
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            </Box>
          ) : null}
          <Typography>{getSaveStateMessage(domLoader.saving, hasUnsavedChanges)}</Typography>
          <IconButton
            aria-label="Create release"
            color="inherit"
            onClick={() => setCreateReleaseDialogOpen(true)}
          >
            <RocketLaunchIcon />
          </IconButton>
          <Button
            variant="outlined"
            component="a"
            href={`/app/${appId}/preview`}
            target="_blank"
            endIcon={<OpenInNewIcon />}
          >
            Preview
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
          onClose={() => setCreateReleaseDialogOpen(false)}
        />
      </Box>
    </ToolpadAppShell>
  );
}
