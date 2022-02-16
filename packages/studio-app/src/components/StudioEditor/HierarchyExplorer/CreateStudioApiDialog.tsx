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
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import client from '../../../api';

export interface CreateStudioApiDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateStudioApiDialog({ onClose, ...props }: CreateStudioApiDialogProps) {
  const [connectionId, setConnectionID] = React.useState('');
  const dom = useDom();
  const domApi = useDomApi();
  const navigate = useNavigate();

  const connectionsQuery = useQuery('connections', client.query.getConnections);

  const handleSelectionChange = React.useCallback((event: SelectChangeEvent<string>) => {
    setConnectionID(event.target.value);
  }, []);

  return (
    <Dialog {...props} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const connectionType = (connectionsQuery.data || []).find(
            ({ id }) => id === connectionId,
          )?.type;
          if (!connectionType) {
            throw new Error(
              `Invariant: can't find a datasource for existing connection "${connectionId}"`,
            );
          }
          const newApiNode = studioDom.createNode(dom, 'api', {
            query: {},
            connectionId,
            connectionType,
          });
          const appNode = studioDom.getApp(dom);
          domApi.addNode(newApiNode, appNode, 'apis');
          onClose();
          navigate(`/apis/${newApiNode.id}`);
        }}
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
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
              {(connectionsQuery.data || []).map(({ id, type, name }) => (
                <MenuItem key={id} value={id}>
                  {name} | {type}
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
      </form>
    </Dialog>
  );
}
