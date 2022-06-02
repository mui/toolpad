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
import * as appDom from '../../../appDom';
import { NodeId } from '../../../types';
import { WithControlledProp } from '../../../utils/types';
import DialogForm from '../../DialogForm';
import { useDom, useDomApi } from '../../DomLoader';
import dataSources from '../../../toolpadDataSources/client';

export interface ConnectionSelectProps extends WithControlledProp<NodeId | null> {
  dataSource?: string;
}

export function ConnectionSelect({ dataSource, value, onChange }: ConnectionSelectProps) {
  const dom = useDom();

  const app = appDom.getApp(dom);
  const { connections = [] } = appDom.getChildNodes(dom, app);

  const filtered = React.useMemo(() => {
    return dataSource
      ? connections.filter((connection) => connection.attributes.dataSource.value === dataSource)
      : connections;
  }, [connections, dataSource]);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      onChange((event.target.value as NodeId) || null);
    },
    [onChange],
  );

  return (
    <FormControl fullWidth>
      <InputLabel id="select-connection-type">Connection</InputLabel>
      <Select
        fullWidth
        value={value || ''}
        labelId="select-connection-type"
        label="Connection"
        onChange={handleSelectionChange}
      >
        {filtered.map((connection) => (
          <MenuItem key={connection.id} value={connection.id}>
            {connection.name} | {connection.attributes.dataSource.value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export interface CreateApiNodeDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateApiNodeDialog({
  appId,
  onClose,
  ...props
}: CreateApiNodeDialogProps) {
  const [connectionId, setConnectionID] = React.useState<NodeId | null>(null);
  const dom = useDom();
  const domApi = useDomApi();
  const navigate = useNavigate();

  return (
    <Dialog {...props} onClose={onClose}>
      <DialogForm
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const connection = connectionId && appDom.getMaybeNode(dom, connectionId, 'connection');

          if (!connection) {
            throw new Error(`Invariant: Selected non-existing connection "${connectionId}"`);
          }

          const dataSource = dataSources[connection.attributes.dataSource.value];
          if (!dataSource) {
            throw new Error(
              `Invariant: Selected non-existing dataSource "${connection.attributes.dataSource.value}"`,
            );
          }

          const newApiNode = appDom.createNode(dom, 'api', {
            attributes: {
              query: appDom.createConst(dataSource.getInitialQueryValue()),
              connectionId: appDom.createConst(connectionId),
              dataSource: connection.attributes.dataSource,
              transformEnabled: appDom.createConst(false),
              transform: appDom.createConst('(data) => { return data }'),
            },
          });
          const appNode = appDom.getApp(dom);
          domApi.addNode(newApiNode, appNode, 'apis');
          onClose();
          navigate(`/app/${appId}/editor/apis/${newApiNode.id}`);
        }}
      >
        <DialogTitle>Create a new MUI Toolpad API</DialogTitle>
        <DialogContent>
          <Typography>Please select a connection for your API</Typography>
          <ConnectionSelect value={connectionId} onChange={setConnectionID} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!connectionId}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
