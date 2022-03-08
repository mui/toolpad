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
  const [title, setTitle] = React.useState('');
  const navigate = useNavigate();

  return (
    <Dialog {...props} onClose={onClose}>
      <DialogForm
        onSubmit={(e) => {
          e.preventDefault();
          const newNode = studioDom.createNode(dom, 'page', {
            attributes: {
              title: studioDom.createConst(title),
              urlQuery: studioDom.createConst({}),
            },
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newNode, appNode, 'pages');
          onClose();
          navigate(`/editor/pages/${newNode.id}`);
        }}
      >
        <DialogTitle>Create a new MUI Studio API</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            autoFocus
            fullWidth
            label="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={!title}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
