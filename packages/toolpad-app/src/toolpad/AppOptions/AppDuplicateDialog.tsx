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
import { errorFrom } from '../../utils/errors';

interface AppDuplicateDialogProps {
  open: boolean;
  app?: AppMeta | null;
  onClose: () => void;
}

const AppDuplicateDialog = ({ app, onClose, ...props }: AppDuplicateDialogProps) => {
  const [nameInput, setNameInput] = React.useState('');

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const duplicateAppMutation = client.useMutation('duplicateApp');

  const duplicateApp = React.useCallback(async () => {
    if (app) {
      const duplicated = await duplicateAppMutation.mutateAsync([app.id, nameInput]);
      const url = new URL(`/_toolpad/app/${duplicated.id}`, window.location.href);
      window.open(url, '_blank');
    }
    await client.invalidateQueries('getApps');
  }, [app, nameInput, duplicateAppMutation]);

  const isFormValid = !duplicateAppMutation.isError;

  const formError = React.useMemo(() => {
    if (!isFormValid) {
      return errorFrom(duplicateAppMutation.error).message;
    }
    return '';
  }, [isFormValid, duplicateAppMutation.error]);

  return (
    <Dialog {...props} onClose={onClose} maxWidth="xs">
      <DialogForm
        onSubmit={(event) => {
          invariant(isFormValid, 'Form should not be submitted when invalid');
          event.preventDefault();
          duplicateApp();
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
            defaultValue={app?.name ?? ''}
            value={nameInput}
            error={!isFormValid}
            helperText={formError}
            onChange={handleNameInputChange}
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
