import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import invariant from 'invariant';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import client from '../../api';
import DialogForm from '../../components/DialogForm';
import type { AppMeta } from '../../server/data';
import { errorFrom } from '../../utils/errors';
import useLatest from '../../utils/useLatest';
import useRisingEdge from '../../utils/useRisingEdge';

interface AppDuplicateDialogProps {
  open: boolean;
  app: AppMeta;
  onClose: () => void;
}

function AppDuplicateDialog({ app, onClose, open, ...props }: AppDuplicateDialogProps) {
  const [nameInput, setNameInput] = React.useState(app.name);
  useRisingEdge(open, () => {
    setNameInput(app.name);
  });

  const [duplicatedApp, setDuplicatedApp] = React.useState<{
    name: string;
    url: string;
  } | null>(null);

  // To keep content around during closing animation
  const lastDuplicatedApp = useLatest(duplicatedApp);

  const handleNameInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value),
    [],
  );

  const duplicateAppMutation = client.useMutation('duplicateApp');

  const duplicateApp = React.useCallback(async () => {
    const duplicated = await duplicateAppMutation.mutateAsync([app.id, nameInput]);
    setDuplicatedApp({ name: duplicated.name, url: `/app/${duplicated.id}` });
    await client.invalidateQueries('getApps');
  }, [app, nameInput, duplicateAppMutation]);

  const isFormValid = !duplicateAppMutation.isError;

  const formError = React.useMemo(() => {
    if (!isFormValid) {
      return errorFrom(duplicateAppMutation.error).message;
    }
    return '';
  }, [isFormValid, duplicateAppMutation.error]);

  const handleSnackbarClose = React.useCallback(() => {
    setDuplicatedApp(null);
  }, []);

  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose} maxWidth="xs" {...props}>
        <DialogForm
          onSubmit={(event) => {
            invariant(isFormValid, 'Form should not be submitted when invalid');
            event.preventDefault();
            duplicateApp();
            onClose();
          }}
        >
          <DialogTitle>Duplicate app</DialogTitle>
          <DialogContent>
            <TextField
              sx={{ my: 1 }}
              autoFocus
              onFocus={(event) => event.target.select()}
              required
              fullWidth
              label="Name"
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
              aria-label="Duplicate app submit button"
              loading={duplicateAppMutation.isLoading}
              disabled={!isFormValid}
            >
              Create
            </LoadingButton>
          </DialogActions>
        </DialogForm>
      </Dialog>
      {lastDuplicatedApp ? (
        <Snackbar
          open={!!duplicatedApp}
          onClose={handleSnackbarClose}
          message={`App ${lastDuplicatedApp.name} created`}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          action={
            <React.Fragment>
              <Button size="small" component={Link} to={lastDuplicatedApp.url ?? '#'}>
                Open
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      ) : null}
    </React.Fragment>
  );
}

export default AppDuplicateDialog;
