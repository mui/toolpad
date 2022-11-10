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
import client from '../../api';
import DialogForm from '../../components/DialogForm';
import type { AppMeta } from '../../server/data';

interface AppDuplicateDialogProps {
  open: boolean;
  app?: AppMeta | null;
  existingAppNames?: string[];
  onClose: () => void;
}

const AppDuplicateDialog = ({
  onClose,
  app,
  existingAppNames,
  ...props
}: AppDuplicateDialogProps) => {
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

  const existingNames = React.useMemo(() => new Set(existingAppNames), [existingAppNames]);

  const isPristine = React.useRef<boolean>(true);

  const formError = React.useMemo(() => {
    if (!isPristine.current && !nameInput) {
      return 'A name is required';
    }
    if (existingNames.has(nameInput)) {
      return 'An app with that name already exists';
    }
    return null;
  }, [existingNames, nameInput]);

  const isFormValid = !formError;

  const handleFormSubmit = React.useCallback(() => {
    if (isFormValid) {
      duplicateApp();
    } else {
      setNameInput(app?.name ?? '');
    }
    onClose();
  }, [isFormValid, app?.name, setNameInput, duplicateApp, onClose]);

  const handleKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isPristine.current) {
        isPristine.current = false;
      }
      if (event.key === 'Enter') {
        handleFormSubmit();
      }
    },
    [handleFormSubmit],
  );

  return (
    <Dialog {...props} onClose={onClose} maxWidth="xs">
      <DialogForm
        onSubmit={(event) => {
          event.preventDefault();
          handleFormSubmit();
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
            value={nameInput}
            error={!isFormValid}
            helperText={formError}
            onChange={handleNameInputChange}
            onKeyPress={handleKeyPress}
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
