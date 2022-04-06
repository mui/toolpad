import { styled } from '@mui/system';
import * as React from 'react';
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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import AppHeader from '../AppHeader';
import PageEditor from './PageEditor';
import PagePanel from './PagePanel';
import DomProvider, { useDomLoader } from '../DomLoader';
import ApiEditor from './ApiEditor';
import CodeComponentEditor from './CodeComponentEditor';
import ConnectionEditor from './ConnectionEditor';
import client from '../../api';
import DialogForm from '../DialogForm';

const classes = {
  content: 'Toolpad_Content',
  hierarchyPanel: 'Toolpad_HierarchyPanel',
  editorPanel: 'Toolpad_EditorPanel',
};

const EditorRoot = styled('div')(({ theme }) => ({
  height: '100vh',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [`& .${classes.content}`]: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  [`& .${classes.hierarchyPanel}`]: {
    width: 250,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.editorPanel}`]: {
    flex: 1,
    overflow: 'hidden',
  },
}));

interface FileEditorProps {
  appId: string;
  className?: string;
}

function FileEditor({ appId, className }: FileEditorProps) {
  return (
    <Routes>
      <Route
        path="connections/:nodeId"
        element={<ConnectionEditor appId={appId} className={className} />}
      />
      <Route path="apis/:nodeId" element={<ApiEditor appId={appId} className={className} />} />
      <Route path="pages/:nodeId" element={<PageEditor appId={appId} className={className} />} />
      <Route
        path="codeComponents/:nodeId"
        element={<CodeComponentEditor className={className} />}
      />
    </Routes>
  );
}

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

export interface EditorContentProps {
  appId: string;
}

function EditorContent({ appId }: EditorContentProps) {
  const domLoader = useDomLoader();

  const [createReleaseDialogOpen, setCreateReleaseDialogOpen] = React.useState(false);

  return (
    <EditorRoot>
      <AppHeader
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
      />
      {domLoader.dom ? (
        <div className={classes.content}>
          <PagePanel className={classes.hierarchyPanel} appId={appId} />
          <FileEditor className={classes.editorPanel} appId={appId} />
        </div>
      ) : (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          {domLoader.error ? (
            <Alert severity="error">{domLoader.error}</Alert>
          ) : (
            <CircularProgress />
          )}
        </Box>
      )}
      <CreateReleaseDialog
        appId={appId}
        open={createReleaseDialogOpen}
        onClose={() => setCreateReleaseDialogOpen(false)}
      />
    </EditorRoot>
  );
}
export default function Editor() {
  const { appId } = useParams();

  if (!appId) {
    throw new Error(`Missing queryParam "appId"`);
  }

  return (
    <DomProvider appId={appId}>
      <EditorContent appId={appId} />
    </DomProvider>
  );
}
