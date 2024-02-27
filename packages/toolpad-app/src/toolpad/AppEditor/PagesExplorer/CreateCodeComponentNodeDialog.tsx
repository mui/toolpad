import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Portal,
  Snackbar,
  TextField,
} from '@mui/material';
import * as React from 'react';
import invariant from 'invariant';
import CloseIcon from '@mui/icons-material/Close';
import useEventCallback from '@mui/utils/useEventCallback';
import useLatest from '@mui/toolpad-utils/hooks/useLatest';
import * as appDom from '@mui/toolpad-core/appDom';
import DialogForm from '../../../components/DialogForm';
import { useNodeNameValidation } from './validation';
import { useProjectApi } from '../../../projectApi';
import OpenCodeEditorButton from '../../OpenCodeEditor';
import { useToolpadComponents } from '../toolpadComponents';

function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.target.select();
}

const DEFAULT_NAME = 'MyComponent';

export interface CreateCodeComponentDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCodeComponentDialog({
  open,
  onClose,
  ...props
}: CreateCodeComponentDialogProps) {
  const projectApi = useProjectApi();

  const codeComponents = useToolpadComponents();

  const existingNames = React.useMemo(
    () =>
      new Set(
        Object.values(codeComponents)
          .map((component) => component?.displayName)
          .filter(Boolean),
      ),
    [codeComponents],
  );

  const [name, setName] = React.useState(appDom.proposeName(DEFAULT_NAME, existingNames));

  // Reset form
  const handleReset = useEventCallback(() =>
    setName(appDom.proposeName(DEFAULT_NAME, existingNames)),
  );

  React.useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  const inputErrorMsg = useNodeNameValidation(name, existingNames, 'component');
  const isNameValid = !inputErrorMsg;
  const isFormValid = isNameValid;

  const [snackbarState, setSnackbarState] = React.useState<{ name: string } | null>(null);
  const lastSnackbarState = useLatest(snackbarState);
  const handleSnackbarClose = React.useCallback(() => {
    setSnackbarState(null);
  }, []);

  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose} {...props}>
        <DialogForm
          autoComplete="off"
          onSubmit={async (event) => {
            event.preventDefault();
            invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');
            await projectApi.methods.createComponent(name);
            onClose();
            setSnackbarState({ name });
          }}
        >
          <DialogTitle>Create a new Code Component</DialogTitle>
          <DialogContent>
            <TextField
              sx={{ my: 1 }}
              required
              onFocus={handleInputFocus}
              autoFocus
              fullWidth
              label="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={open && !isNameValid}
              helperText={inputErrorMsg}
            />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Create
            </Button>
          </DialogActions>
        </DialogForm>
      </Dialog>
      {lastSnackbarState ? (
        <Portal>
          <Snackbar
            open={!!snackbarState}
            onClose={handleSnackbarClose}
            message={`Component "${lastSnackbarState.name}" created`}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            action={
              <React.Fragment>
                <OpenCodeEditorButton
                  filePath={name}
                  variant="text"
                  fileType="component"
                  color="primary"
                  onSuccess={handleSnackbarClose}
                />
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
        </Portal>
      ) : null}
    </React.Fragment>
  );
}
