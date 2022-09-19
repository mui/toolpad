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
import { useDom, useDomApi } from '../../DomLoader';

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
  const [name, setName] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (open) {
      // Reset form
      setName('');
    }
  }, [open]);

  return (
    <Dialog {...props} open={open} onClose={onClose}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
