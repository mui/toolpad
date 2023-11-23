import * as React from 'react';
import { Button, Dialog, IconButton, List, ListItem, ListItemText, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppState, useAppStateApi } from '../AppState';
import * as appDom from '../../appDom';

export default function AppAuthorizationEditor() {
  const { dom } = useAppState();
  const appState = useAppStateApi();

  const appNode = appDom.getApp(dom);
  const authorization = appNode.attributes.authorization;
  const roles = authorization?.roles;

  const [input, setInput] = React.useState<string>('');

  const handleAddRole = React.useCallback(() => {
    appState.update((draft) => {
      const app = appDom.getApp(draft);

      draft = appDom.setNodeNamespacedProp(draft, app, 'attributes', 'authorization', {
        ...app.attributes?.authorization,
        roles: [
          ...(app.attributes?.authorization?.roles ?? []),
          {
            name: input,
          },
        ],
      });

      return draft;
    });
  }, [appState, input]);

  return (
    <div>
      <TextField
        label="Role name"
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
      <Button variant="contained" onClick={handleAddRole} disabled={!input}>
        Add role
      </Button>
      <List>
        {roles?.map((role) => (
          <ListItem
            key={role.name}
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={role.name} secondary={role.description} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export interface AppAuthorizationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AppAuthorizationDialog({ open, onClose }: AppAuthorizationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <AppAuthorizationEditor />
    </Dialog>
  );
}
