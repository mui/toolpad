import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';
import type { StudioDataSourceClient, StudioPageQuery } from '../types';
import dataSources from '../studioDataSources/client';
import client from '../api';
import { generateRandomId } from '../utils/randomId';
import { WithControlledProp } from '../utils/types';

export default function QueryEditor<Q>({
  value,
  onChange,
}: WithControlledProp<StudioPageQuery<Q> | null>) {
  const { data: availableConnections } = useQuery('connections', client.query.getConnections);

  const handleQueryChange = React.useCallback(
    (query: Q) => {
      onChange(value && { ...value, query });
    },
    [value, onChange],
  );

  const getDataSource = React.useCallback(
    (connectionId: string): StudioDataSourceClient<any, Q> | null => {
      const connection = availableConnections?.find(
        (availableConnection) => availableConnection.id === connectionId,
      );
      if (connection) {
        const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
        if (dataSource) {
          return dataSource;
        }
      }
      return null;
    },
    [availableConnections],
  );

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      const connectionId = event.target.value;
      const dataSource = getDataSource(connectionId);
      if (!dataSource) {
        throw new Error(`Can't resolve datasource for connection "${connectionId}"`);
      }
      onChange({
        id: generateRandomId(),
        connectionId,
        query: dataSource.getInitialQueryValue(),
      });
    },
    [getDataSource, onChange],
  );

  const QueryEditorComponent = React.useMemo(() => {
    if (value) {
      const dataSource = getDataSource(value.connectionId);
      return dataSource?.QueryEditor ?? null;
    }
    return null;
  }, [getDataSource, value]);

  return (
    <Stack my={1} gap={2}>
      <FormControl size="small" fullWidth>
        <InputLabel id="select-connection">Connection</InputLabel>
        <Select
          value={value?.connectionId || ''}
          labelId="select-connection"
          label="Connection"
          onChange={handleSelectionChange}
        >
          {(availableConnections || []).map(({ id, type, name }) => (
            <MenuItem key={id} value={id}>
              {name} | {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Divider />
      {value && QueryEditorComponent ? (
        <QueryEditorComponent value={value.query} onChange={handleQueryChange} />
      ) : null}
    </Stack>
  );
}
