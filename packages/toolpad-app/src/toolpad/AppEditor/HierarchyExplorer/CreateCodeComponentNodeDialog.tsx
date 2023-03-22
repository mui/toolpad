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
import * as appDom from '../../../appDom';
import { useAppStateApi, useDom } from '../../AppState';
import { format } from '../../../utils/prettier';
import DialogForm from '../../../components/DialogForm';
import useEvent from '../../../utils/useEvent';
import { useNodeNameValidation } from './validation';
import client from '../../../api';
import useLatest from '../../../utils/useLatest';

const DEFAULT_NAME = 'MyComponent';

function createDefaultCodeComponent(name: string): string {
  const componentId = name.replace(/\s/g, '');
  const propTypeId = `${componentId}Props`;
  return format(`
    import * as React from 'react';
    import { Typography } from '@mui/material';
    import { createComponent } from '@mui/toolpad-core';
    
    export interface ${propTypeId} {
      msg: string;
    }
    
    function ${componentId}({ msg }: ${propTypeId}) {
      return (
        <Typography>{msg}</Typography>
      );
    }

    export default createComponent(${componentId}, {
      argTypes: {
        msg: {
          typeDef: { type: "string", default: "Hello world!" },
        },
      },
    });    
  `);
}

export interface CreateCodeComponentDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCodeComponentDialog({
  open,
  onClose,
  ...props
}: CreateCodeComponentDialogProps) {
  const { dom } = useDom();
  const appStateApi = useAppStateApi();

  const existingNames = React.useMemo(
    () => appDom.getExistingNamesForChildren(dom, appDom.getApp(dom), 'codeComponents'),
    [dom],
  );

  const [name, setName] = React.useState(appDom.proposeName(DEFAULT_NAME, existingNames));

  // Reset form
  const handleReset = useEvent(() => setName(appDom.proposeName(DEFAULT_NAME, existingNames)));

  React.useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  const handleInputFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

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
          onSubmit={(event) => {
            invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');

            event.preventDefault();
            const newNode = appDom.createNode(dom, 'codeComponent', {
              name,
              attributes: {
                code: appDom.createConst(createDefaultCodeComponent(name)),
                isNew: appDom.createConst(true),
              },
            });
            const appNode = appDom.getApp(dom);

            appStateApi.update((draft) =>
              appDom.addNode(draft, newNode, appNode, 'codeComponents'),
            );

            setSnackbarState({ name });

            onClose();
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
                <Button
                  size="small"
                  onClick={() => {
                    client.mutation.openCodeComponentEditor(name);
                  }}
                >
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
        </Portal>
      ) : null}
    </React.Fragment>
  );
}
