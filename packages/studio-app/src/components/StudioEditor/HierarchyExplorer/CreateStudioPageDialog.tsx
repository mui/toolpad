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
import * as studioDom from '../../../studioDom';
import DialogForm from '../../DialogForm';
import { useDom, useDomApi } from '../../DomLoader';

export interface CreateStudioPageDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateStudioPageDialog({ onClose, ...props }: CreateStudioPageDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const [name, setName] = React.useState('');
  const navigate = useNavigate();

  return (
    <Dialog {...props} onClose={onClose}>
      <DialogForm
        onSubmit={(e) => {
          e.preventDefault();
          const newNode = studioDom.createNode(dom, 'page', {
            name,
            attributes: {
              title: studioDom.createConst(name),
              urlQuery: studioDom.createConst({}),
            },
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newNode, appNode, 'pages');

          const container = studioDom.createElement(dom, 'Container', {
            sx: studioDom.createConst({ my: 2 }),
          });
          domApi.addNode(container, newNode, 'children');

          const stack = studioDom.createElement(dom, 'Stack', {
            gap: studioDom.createConst(2),
            direction: studioDom.createConst('column'),
            alignItems: studioDom.createConst('stretch'),
          });
          domApi.addNode(stack, container, 'children');

          onClose();
          navigate(`/editor/pages/${newNode.id}`);
        }}
      >
        <DialogTitle>Create a new MUI Studio Page</DialogTitle>
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
          <Button type="submit" disabled={!name}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
