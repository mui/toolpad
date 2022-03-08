import { styled } from '@mui/system';
import * as React from 'react';
import {
  Box,
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
import { Route, Routes, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import StudioAppBar from '../StudioAppBar';
import PageEditor from './PageEditor';
import PagePanel from './PagePanel';
import DomProvider, { useDomLoader } from '../DomLoader';
import ApiEditor from './ApiEditor';
import CodeComponentEditor from './CodeComponentEditor';
import ConnectionEditor from './ConnectionEditor';
import client from '../../api';
import DialogForm from '../DialogForm';

const classes = {
  content: 'StudioContent',
  hierarchyPanel: 'StudioHierarchyPanel',
  editorPanel: 'StudioEditorPanel',
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
  className?: string;
}

function FileEditor({ className }: FileEditorProps) {
  return (
    <Routes>
      <Route path="connections/:nodeId" element={<ConnectionEditor className={className} />} />
      <Route path="apis/:nodeId" element={<ApiEditor className={className} />} />
      <Route path="pages/:nodeId" element={<PageEditor className={className} />} />
      <Route
        path="codeComponents/:nodeId"
        element={<CodeComponentEditor className={className} />}
      />
    </Routes>
  );
}

interface CreateReleaseDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateReleaseDialog({ open, onClose }: CreateReleaseDialogProps) {
  const navigate = useNavigate();

  const { handleSubmit, register, formState, reset } = useForm({
    defaultValues: {
      version: '',
      description: '',
    },
  });

  const createReleaseMutation = client.useMutation('createRelease');
  const doSubmit = handleSubmit(async (releaseParams) => {
    try {
      const newRelease = await createReleaseMutation.mutateAsync([releaseParams]);
      reset();
      navigate(`/releases/${newRelease.version}`);
    } catch (error) {
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogForm onSubmit={doSubmit}>
        <DialogTitle>Create new release</DialogTitle>
        <DialogContent>
          <Stack spacing={1} my={1}>
            <TextField
              label="Version"
              size="small"
              fullWidth
              {...register('version', { required: true, minLength: 1 })}
              error={Boolean(formState.errors.version)}
              helperText={formState.errors.version?.message}
            />
            <TextField
              label="description"
              size="small"
              fullWidth
              multiline
              rows={5}
              {...register('description')}
              error={Boolean(formState.errors.description)}
              helperText={formState.errors.description?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={createReleaseMutation.isLoading} type="submit">
            Create
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

function EditorContent() {
  const domLoader = useDomLoader();

  const [createReleaseDialogOpen, setCreateReleaseDialogOpen] = React.useState(false);

  return (
    <EditorRoot>
      <StudioAppBar
        actions={
          <React.Fragment>
            {domLoader.saving ? (
              <Box display="flex" flexDirection="row" alignItems="center">
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              </Box>
            ) : null}
            <Typography>{domLoader.unsavedChanges} unsaved change(s).</Typography>
            <IconButton color="inherit" onClick={() => setCreateReleaseDialogOpen(true)}>
              <RocketLaunchIcon />
            </IconButton>
          </React.Fragment>
        }
      />
      {domLoader.dom ? (
        <div className={classes.content}>
          <PagePanel className={classes.hierarchyPanel} />
          <FileEditor className={classes.editorPanel} />
        </div>
      ) : (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
      <CreateReleaseDialog
        open={createReleaseDialogOpen}
        onClose={() => setCreateReleaseDialogOpen(false)}
      />
    </EditorRoot>
  );
}
export default function Editor() {
  return (
    <DomProvider>
      <EditorContent />
    </DomProvider>
  );
}
