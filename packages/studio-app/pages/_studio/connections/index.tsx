import type { NextPage } from 'next';
import * as React from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CheckIcon from '@mui/icons-material/Check';
import CrossIcon from '@mui/icons-material/Clear';
import { useQuery } from 'react-query';
import dataSources from '../../../src/studioDataSources/client';
import { ExactEntriesOf } from '../../../src/utils/types';
import {
  ConnectionStatus,
  StudioConnection,
  StudioDataSourceClient,
  StudioConnectionParamsEditorProps,
} from '../../../src/types';
import client from '../../../src/api';
import StudioAppBar from '../../../src/components/StudioAppBar';

interface ConnectionParamsEditorProps<P> extends StudioConnectionParamsEditorProps<P> {
  dataSource: StudioDataSourceClient<P, any>;
}

function ConnectionParamsEditor<P>({
  dataSource,
  value,
  onChange,
  connectionName,
}: ConnectionParamsEditorProps<P>) {
  const { ConnectionParamsInput } = dataSource;
  return (
    <ConnectionParamsInput connectionName={connectionName} value={value} onChange={onChange} />
  );
}

function getConnectionStatusIcon(status: ConnectionStatus) {
  return status.error ? <CrossIcon /> : <CheckIcon />;
}

interface EditConnectionDialogProps<P> {
  connection: StudioConnection<P> | null;
  open: boolean;
  onClose: () => void;
}

function EditConnectionDialog<P>({ connection, open, onClose }: EditConnectionDialogProps<P>) {
  const isCreate = !connection;
  const [loading, setLoading] = React.useState(false);

  // Bundling params and dataSource in single state to make sure they are always in sync
  const [paramsEditor, setParamsEditor] = React.useState<{
    type: string;
    params: P;
    dataSource: StudioDataSourceClient<P>;
  } | null>(null);

  const setType = React.useCallback((type: string, params?: P) => {
    const dataSource = type ? dataSources[type] : null;
    setParamsEditor(
      dataSource
        ? {
            type,
            dataSource,
            params: params || dataSource.getInitialConnectionValue(),
          }
        : null,
    );
  }, []);

  const [name, setName] = React.useState(connection?.name || '');
  React.useEffect(() => {
    if (connection) {
      setType(connection.type, connection.params);
      setName(connection.name);
    } else {
      setType('');
      setName('');
    }
  }, [connection, setType]);

  const handleTypeChange = React.useCallback(
    (event: SelectChangeEvent) => {
      setType(event.target.value);
    },
    [setType],
  );

  const handleIdChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, []);

  const handleParamsChange = React.useCallback(
    (params: P) => setParamsEditor((editor) => editor && { ...editor, params }),
    [],
  );

  const newConnection = React.useMemo<StudioConnection | null>(() => {
    const { type, params, dataSource } = paramsEditor || {};
    if (type && name && params && dataSource?.isConnectionValid(params)) {
      if (isCreate) {
        return { id: '', name, type, params, status: null };
      }
      return { ...connection, params };
    }
    return null;
  }, [isCreate, connection, name, paramsEditor]);

  const handleConnectionSave = React.useCallback(async () => {
    if (!newConnection) {
      return;
    }
    try {
      setLoading(true);
      if (isCreate) {
        await client.mutation.addConnection(newConnection);
      } else {
        await client.mutation.updateConnection(newConnection);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [isCreate, onClose, newConnection]);

  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    connection: StudioConnection;
    status: ConnectionStatus;
  } | null>(null);

  const handleConnectionTest = React.useCallback(async () => {
    if (!newConnection) {
      return;
    }
    try {
      setIsTesting(true);
      const status = await client.mutation.testConnection(newConnection);
      if (status) {
        setTestResult({ connection: newConnection, status });
        if (status.error) {
          alert(status.error);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTesting(false);
    }
  }, [newConnection]);

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{isCreate ? 'Create Connection' : 'Edit connection'}</DialogTitle>
      <DialogContent>
        <Stack direction="column" gap={1} my={2}>
          <FormControl size="small" fullWidth>
            <InputLabel id="select-connection-type">Type</InputLabel>
            <Select
              labelId="select-connection-type"
              disabled={!isCreate}
              size="small"
              value={paramsEditor?.type || ''}
              label="Type"
              onChange={handleTypeChange}
            >
              {(Object.entries(dataSources) as ExactEntriesOf<typeof dataSources>).map(
                ([type, dataSource]) =>
                  dataSource && (
                    <MenuItem key={type} value={type}>
                      {dataSource.displayName}
                    </MenuItem>
                  ),
              )}
            </Select>
          </FormControl>
          <TextField size="small" label="Name" value={name} onChange={handleIdChange} />
        </Stack>

        {paramsEditor ? (
          <React.Fragment>
            <Divider />
            <Box mt={2}>
              <ConnectionParamsEditor
                key={paramsEditor.type} // Remount when type changes
                dataSource={paramsEditor.dataSource}
                value={paramsEditor.params}
                onChange={handleParamsChange}
                connectionName={name}
              />
            </Box>
          </React.Fragment>
        ) : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          disabled={!newConnection}
          onClick={handleConnectionTest}
          loading={isTesting}
          endIcon={
            newConnection === testResult?.connection
              ? getConnectionStatusIcon(testResult.status)
              : null
          }
        >
          Test
        </LoadingButton>
        <LoadingButton disabled={!newConnection} onClick={handleConnectionSave} loading={loading}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

const Connections: NextPage = () => {
  const { refetch, data, error } = useQuery('connections', client.query.getConnections);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editedConnection, setEditedConnection] = React.useState<StudioConnection | null>(null);
  const handleEditDialogClose = React.useCallback(() => {
    setDialogOpen(false);
    refetch();
  }, [refetch]);

  const handleConnectionRowClick = (connection: StudioConnection) => () => {
    setEditedConnection(connection);
    setDialogOpen(true);
  };

  const handleAddConnectionClick = React.useCallback(() => {
    setEditedConnection(null);
    setDialogOpen(true);
  }, []);

  return (
    <div>
      <StudioAppBar actions={null} />
      <Container>
        <EditConnectionDialog
          connection={editedConnection}
          open={dialogOpen}
          onClose={handleEditDialogClose}
        />
        <List>
          {(() => {
            if (error) {
              return (error as Error).message;
            }
            if (data) {
              return data.map((connection) => (
                <ListItem button key={connection.id} onClick={handleConnectionRowClick(connection)}>
                  {connection.type} | {connection.id} | {connection.name}
                </ListItem>
              ));
            }

            return 'loading...';
          })()}
        </List>
        <Button onClick={handleAddConnectionClick}>Add connection</Button>
      </Container>
    </div>
  );
};

export default Connections;
