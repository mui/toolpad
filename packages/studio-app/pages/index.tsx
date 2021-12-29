import type { NextPage } from 'next';
import * as React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { LoadingButton } from '@mui/lab';
import StudioAppBar from '../src/components/StudioAppBar';
import { StudioApp } from '../src/types';
import { uuidv4 } from '../src/utils/uuid';

const dummyData: StudioApp[] = [];
async function getApps(): Promise<StudioApp[]> {
  return dummyData;
}

async function addApp(app: StudioApp) {
  await new Promise((r) => setTimeout(r, 2000));
  dummyData.push(app);
  return app;
}

const CreateNewButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '100%',
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
}));

interface CreateStudioAppDialogProps extends DialogProps {
  onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'appCreated') => void;
}

function CreateStudioAppDialog({ onClose, ...props }: CreateStudioAppDialogProps) {
  const [name, setName] = React.useState('');
  const router = useRouter();

  const queryClient = useQueryClient();
  const addAppMutation = useMutation(addApp, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('apps');
      router.push(`/app/${encodeURIComponent(data.id)}`);
    },
  });

  const handleClose = React.useCallback(
    (event, reason) => {
      if (!addAppMutation.isLoading) {
        onClose?.(event, reason);
      }
    },
    [onClose, addAppMutation.isLoading],
  );

  return (
    <Dialog {...props} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addAppMutation.mutate({
            id: uuidv4(),
            name,
          });
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle>Create a new MUI Studio application</DialogTitle>
        <DialogContent>
          <Typography>
            You&apos;re about to create a brand new MUI Studio application. Please provide us with a
            name for your new application.
          </Typography>
          <TextField
            autoFocus
            disabled={addAppMutation.isLoading}
            fullWidth
            sx={{ mt: 2 }}
            size="small"
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton type="submit" disabled={!name} loading={addAppMutation.isLoading}>
            Create
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const Home: NextPage = () => {
  const router = useRouter();

  const [createAppDialogOpen, setCreateAppDialogOpen] = React.useState(false);
  const handleCreateAppDialogOpen = React.useCallback(() => setCreateAppDialogOpen(true), []);
  const handleCreateAppDialogClose = React.useCallback(() => setCreateAppDialogOpen(false), []);
  const [pageId, setPageId] = React.useState('');
  const [error, setError] = React.useState('');

  const appsQuery = useQuery('apps', getApps);

  const handleCreateClick = React.useCallback(async () => {
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        body: JSON.stringify({ id: pageId }),
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        router.push(`/_studio/editor/${pageId}`);
      } else {
        setError(`failed with ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [pageId, router]);

  return (
    <React.Fragment>
      <StudioAppBar actions={null} />
      <Container>
        <TextField
          label="page name"
          value={pageId}
          onChange={(event) => setPageId(event.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button disabled={!pageId} onClick={handleCreateClick}>
          Create
        </Button>
        <Typography variant="h2">Applications</Typography>
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CreateNewButton onClick={handleCreateAppDialogOpen}>Create New</CreateNewButton>
          </Grid>
          {appsQuery.data?.map((app) => (
            <Grid item key={app.id} xs={12} sm={6} md={4} lg={3} sx={{ justifyContent: 'stretch' }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div" />
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {app.name}
                  </Typography>
                  <Typography variant="body2">Last updated: {Date.now()}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">View</Button>
                  <Button size="small">Edit</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <CreateStudioAppDialog open={createAppDialogOpen} onClose={handleCreateAppDialogClose} />
    </React.Fragment>
  );
};

export default Home;
