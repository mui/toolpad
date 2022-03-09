import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/system';
import Release from './Release';
import Releases from './Releases';
import StudioEditor from './StudioEditor';
import client from '../api';
import DialogForm from './DialogForm';
import { App } from '../../prisma/generated/client';

export interface CreateAppDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateAppDialog({ onClose, ...props }: CreateAppDialogProps) {
  const [name, setName] = React.useState('');
  const navigate = useNavigate();
  const createAppMutation = client.useMutation('createApp');

  return (
    <Dialog {...props} onClose={onClose}>
      <DialogForm
        onSubmit={async (event) => {
          event.preventDefault();

          const app = await createAppMutation.mutateAsync([name]);

          onClose();
          navigate(`/app/${app.id}/editor`);
        }}
      >
        <DialogTitle>Create a new MUI Studio App</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            autoFocus
            fullWidth
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton type="submit" loading={createAppMutation.isLoading} disabled={!name}>
            Create
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}

interface AppCardProps {
  app: App;
}

function AppCard({ app }: AppCardProps) {
  return (
    <Card sx={{ gridColumn: 'span 1' }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {app.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Some app description here
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/app/${app.id}/editor`}>
          Edit
        </Button>
        <Button size="small" component="a" href={`/deploy/${app.id}`}>
          open
        </Button>
      </CardActions>
    </Card>
  );
}

function Overview() {
  const { data: apps = [] } = client.useQuery('getApps', []);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <Container>
      <Typography variant="h2">Apps</Typography>
      <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />

      <Box
        sx={{
          my: 5,
          display: 'grid',
          gridTemplateColumns: {
            lg: 'repeat(4, 1fr)',
            md: 'repeat(3, 1fr)',
            sm: 'repeat(2, fr)',
            xs: 'repeat(1, fr)',
          },
          gap: 2,
        }}
      >
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
        <Button onClick={() => setCreateDialogOpen(true)}>Create New</Button>
      </Box>
    </Container>
  );
}
export interface EditorProps {
  basename: string;
}

export default function Editor({ basename }: EditorProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/app/:appId/editor/*" element={<StudioEditor />} />
        <Route path="/app/:appId/releases" element={<Releases />} />
        <Route path="/app/:appId/releases/:version" element={<Release />} />
      </Routes>
    </BrowserRouter>
  );
}
