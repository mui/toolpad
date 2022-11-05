import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import invariant from 'invariant';
import client from '../../api';
import DialogForm from '../../components/DialogForm';
import type { AppMeta } from '../../server/data';

interface AppDuplicateDialogProps {
  open: boolean;
  app?: AppMeta | null;
  onClose: () => void;
}

const AppDuplicateDialog = ({ onClose, app, ...props }: AppDuplicateDialogProps) => {
  const duplicateAppMutation = client.useMutation('duplicateApp');

  const [duplicateName, setDuplicateName] = React.useState('');

  const duplicateApp = React.useCallback(async () => {
    if (app) {
      const duplicated = await duplicateAppMutation.mutateAsync([app.id, duplicateName, true]);
      const url = new URL(`/_toolpad/app/${duplicated.id}`, window.location.href);
      window.open(url, '_blank');
    }
    await client.invalidateQueries('getApps');
  }, [app, duplicateName, duplicateAppMutation]);

  const isFormValid = Boolean(duplicateName);

  return (
    <Dialog {...props} onClose={onClose} maxWidth="xs">
      <DialogForm
        onSubmit={async (event) => {
          invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');
          event.preventDefault();
          await duplicateApp();
          onClose();
        }}
      >
        <DialogTitle>Duplicate app</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            required
            autoFocus
            fullWidth
            label="Name"
            value={duplicateName}
            error={duplicateAppMutation.isError}
            helperText={(duplicateAppMutation.error as Error)?.message || ''}
            onChange={(event) => {
              setDuplicateName(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            variant="text"
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={duplicateAppMutation.isLoading}
            disabled={!isFormValid}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
};

export default AppDuplicateDialog;
