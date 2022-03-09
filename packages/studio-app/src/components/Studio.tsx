import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import Release from './Release';
import Releases from './Releases';
import StudioEditor from './StudioEditor';
import client from '../api';
import DialogForm from './DialogForm';

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

function Overview() {
  const { data: apps = [] } = client.useQuery('getApps', []);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  return (
    <Container>
      <Typography variant="h2">Apps</Typography>
      <Toolbar>
        <Button onClick={() => setCreateDialogOpen(true)}>Create New</Button>
        <CreateAppDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      </Toolbar>
      <List>
        {apps.map((app) => (
          <ListItem button component={Link} to={`/app/${app.id}/editor`} key={app.id}>
            <ListItemText primary={app.name} />
          </ListItem>
        ))}
      </List>
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
