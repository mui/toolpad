import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import * as React from 'react';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import DialogForm from '../../../components/DialogForm';
import useEvent from '../../../utils/useEvent';
import { useAppStateApi, useDom } from '../../AppState';
import { useNodeNameValidation } from './validation';

const DEFAULT_NAME = 'page';

export interface CreatePageDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePageDialog({ open, onClose, ...props }: CreatePageDialogProps) {
  const { dom } = useDom();
  const appStateApi = useAppStateApi();

  const existingNames = React.useMemo(
    () => appDom.getExistingNamesForChildren(dom, appDom.getApp(dom), 'pages'),
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

  const inputErrorMsg = useNodeNameValidation(name, existingNames, 'page');
  const isNameValid = !inputErrorMsg;
  const isFormValid = isNameValid;

  return (
    <Dialog open={open} onClose={onClose} {...props}>
      <DialogForm
        autoComplete="off"
        onSubmit={(event) => {
          invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');

          event.preventDefault();
          const newNode = appDom.createNode(dom, 'page', {
            name,
            attributes: {
              title: name,
              display: 'shell',
            },
          });
          const appNode = appDom.getApp(dom);

          appStateApi.update((draft) => appDom.addNode(draft, newNode, appNode, 'pages'), {
            kind: 'page',
            nodeId: newNode.id,
          });

          onClose();
        }}
      >
        <DialogTitle>Create a new Page</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            required
            autoFocus
            fullWidth
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={!isNameValid}
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
  );
}
