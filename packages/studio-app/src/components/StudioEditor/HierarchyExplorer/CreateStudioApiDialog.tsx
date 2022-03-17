import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as studioDom from '../../../studioDom';
import DialogForm from '../../DialogForm';
import { useDom, useDomApi } from '../../DomLoader';

export interface CreateStudioApiDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateStudioApiDialog({
  appId,
  onClose,
  ...props
}: CreateStudioApiDialogProps) {
  const [connectionId, setConnectionID] = React.useState('');
  const dom = useDom();
  const domApi = useDomApi();
  const navigate = useNavigate();

  const app = studioDom.getApp(dom);
  const { connections = [] } = studioDom.getChildNodes(dom, app);

  const handleSelectionChange = React.useCallback((event: SelectChangeEvent<string>) => {
    setConnectionID(event.target.value);
  }, []);

  return (
    <Dialog {...props} onClose={onClose}>
      <DialogForm
        onSubmit={(e) => {
          e.preventDefault();
          const newApiNode = studioDom.createNode(dom, 'api', {
            attributes: {
              query: studioDom.createConst({}),
              connectionId: studioDom.createConst(connectionId),
            },
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newApiNode, appNode, 'apis');
          onClose();
          navigate(`/app/${appId}/editor/apis/${newApiNode.id}`);
        }}
      >
        <DialogTitle>Create a new MUI Studio API</DialogTitle>
        <DialogContent>
          <Typography>Please select a connection for your API</Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id="select-connection-type">Connection</InputLabel>
            <Select
              size="small"
              fullWidth
              value={connectionId}
              labelId="select-connection-type"
              label="Connection"
              onChange={handleSelectionChange}
            >
              {connections.map((connection) => (
                <MenuItem key={connection.id} value={connection.id}>
                  {connection.name} | {connection.attributes.dataSource.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={!connectionId}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
