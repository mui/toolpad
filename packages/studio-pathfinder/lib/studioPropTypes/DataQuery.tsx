import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import * as React from 'react';
import useSWR from 'swr';
import {
  EditorProps,
  PropTypeDefinition,
  StudioConnectionSummary,
  StudioDataSourceClient,
  StudioPageQuery,
} from '../types';
import { useEditorApi, useEditorState } from '../components/StudioEditor/EditorProvider';
import { newQueryId } from '../studioPage';
import fetcher from '../fetcher';
import dataSources from "../studioDataSources/client";

function DataQueryEditor<Q>({ name, value, onChange, disabled }: EditorProps<string | null>) {
  const { data: availableConnections } = useSWR<StudioConnectionSummary[]>(
    '/api/connections',
    fetcher,
  );
  const state = useEditorState();
  const api = useEditorApi();
  const queryId = React.useMemo(() => value || newQueryId(state.page), [value, state.page]);
  const [editoropen, setEditorOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setEditorOpen(true), []);
  const handleClose = React.useCallback(() => setEditorOpen(false), []);
  const [input, setInput] = React.useState<StudioPageQuery<Q> | null>(
    (value && state.page.queries[value]) || null,
  );

  const handleQueryChange = React.useCallback((query: Q) => {
    setInput((input) => input && { ...input, query });
  }, []);

  const getDataSource = React.useCallback(
    (connectionId: string): StudioDataSourceClient<any, Q> | null => {
      const connection = availableConnections?.find((connection) => connection.id === connectionId);
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
      setInput({
        connectionId,
        query: dataSource.getInitialQueryValue(),
      });
    },
    [getDataSource],
  );

  const QueryEditor = React.useMemo(() => {
    if (input) {
      const dataSource = getDataSource(input.connectionId);
      return dataSource?.QueryEditor ?? null;
    }
    return null;
  }, [getDataSource, input]);

  const handleSave = React.useCallback(() => {
    if (input) {
      api.saveQuery(queryId, input);
      handleClose();
      onChange(queryId);
    }
  }, [api, queryId, input, handleClose, onChange]);

  return (
    <React.Fragment>
      <Dialog onClose={handleClose} open={editoropen}>
        <DialogTitle>Query</DialogTitle>
        <DialogContent>
          <Stack my={1} gap={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="select-connection">Connection</InputLabel>
              <Select
                value={input?.connectionId || ''}
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
            {input && QueryEditor ? (
              <QueryEditor value={input.query} onChange={handleQueryChange} />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Button onClick={handleOpen}>edit</Button>
    </React.Fragment>
  );
}

const dataQueryType: PropTypeDefinition<string | null> = {
  Editor: DataQueryEditor,
};

export default dataQueryType;
