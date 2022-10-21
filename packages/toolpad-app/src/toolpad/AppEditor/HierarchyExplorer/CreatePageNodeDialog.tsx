import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as appDom from '../../../appDom';
import DialogForm from '../../../components/DialogForm';
import useEvent from '../../../utils/useEvent';
import { useDom, useDomApi } from '../../DomLoader';
import { useNameInputError } from './validation';

export interface CreatePageDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreatePageDialog({
  appId,
  open,
  onClose,
  ...props
}: CreatePageDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const existingNames = React.useMemo(
    () => appDom.getExistingNamesForChildren(dom, appDom.getApp(dom), 'pages'),
    [dom],
  );

  const [name, setName] = React.useState(appDom.proposeName('page', existingNames));

  const navigate = useNavigate();

  // Reset form
  const handleReset = useEvent(() => setName(appDom.proposeName('page', existingNames)));

  React.useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  const inputErrorMsg = useNameInputError(name, existingNames, 'page');
  const isNameInvalid = !!inputErrorMsg;

  return (
    <Dialog open={open} onClose={onClose} {...props}>
      <DialogForm
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const newNode = appDom.createNode(dom, 'page', {
            name,
            attributes: {
              title: appDom.createConst(name),
            },
          });
          const appNode = appDom.getApp(dom);
          domApi.addNode(newNode, appNode, 'pages');

          onClose();
          navigate(`/app/${appId}/pages/${newNode.id}`);
        }}
      >
        <DialogTitle>Create a new MUI Toolpad Page</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            autoFocus
            fullWidth
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={isNameInvalid}
            helperText={inputErrorMsg}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name || isNameInvalid}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
