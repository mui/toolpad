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
import { useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DialogForm from '../DialogForm';
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
                size="small"
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

export interface ToolpadAppShellProps {
  appId: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AppEditorShell({ appId, children, ...props }: ToolpadAppShellProps) {
  const domLoader = useDomLoader();

  const [createReleaseDialogOpen, setCreateReleaseDialogOpen] = React.useState(false);

  return (
    <ToolpadAppShell
      appId={appId}
      actions={
        <React.Fragment>
          {domLoader.saving ? (
            <Box display="flex" flexDirection="row" alignItems="center">
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            </Box>
          ) : null}
          <Typography>{domLoader.unsavedChanges} unsaved change(s).</Typography>
          <IconButton
            aria-label="Create release"
            color="inherit"
            sx={{ ml: 1 }}
            onClick={() => setCreateReleaseDialogOpen(true)}
          >
            <RocketLaunchIcon />
          </IconButton>
        </React.Fragment>
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
            borderRight: `1px solid 'divider'`,
          }}
        />
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
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
