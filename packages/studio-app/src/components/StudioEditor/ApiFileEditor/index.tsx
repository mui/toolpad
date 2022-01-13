import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Stack, TextField, Toolbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LoadingButton } from '@mui/lab';
import { DefaultNodeProps, NodeId, StudioConnection, StudioDataSourceClient } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomProvider';
import { useEditorState } from '../EditorProvider';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface ApiEditorProps {
  apiNodeId: NodeId;
}

function ApiEditorContent<Q extends DefaultNodeProps>({ apiNodeId }: ApiEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = studioDom.getNode(dom, apiNodeId);
  studioDom.assertIsApi<Q>(api);

  const [name, setName] = React.useState(api.name);
  const [query, setQuery] = React.useState(studioDom.getPropConstValues(api) as Q);

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const datasource = connectionData && getDataSource<Q>(connectionData);

  const previewApi: studioDom.StudioApiNode<Q> = studioDom.setPropConstValues(api, query);
  const { data: previewData } = useQuery(['api', previewApi], () =>
    client.query.execApi(previewApi),
  );

  const { fields = {}, data: rows = [] } = previewData ?? {};

  const columns = React.useMemo(
    () =>
      Object.entries(fields).map(([field, def]) => ({
        ...(def as any),
        field,
      })),
    [fields],
  );

  const columnsFingerPrint = React.useMemo(() => JSON.stringify(columns), [columns]);

  return datasource ? (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        Always hit the save button (top right) after clicking &quot;update&quot;. Will implement
        automatic save later.
        <Toolbar>
          <LoadingButton
            onClick={() => {
              domApi.setNodeName(apiNodeId, name);
              Object.keys(query).forEach((prop: keyof Q & string) => {
                domApi.setNodeConstPropValue<Q>(api, prop, query[prop]);
              });
            }}
          >
            Update
          </LoadingButton>
        </Toolbar>
        <Stack spacing={2} p={2}>
          <TextField
            label="name"
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <datasource.QueryEditor value={query} onChange={(newQuery) => setQuery(newQuery)} />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={rows} columns={columns} key={columnsFingerPrint} />
      </Box>
    </Box>
  ) : null;
}

interface ApiFileEditorProps {
  className?: string;
}

export default function ApiFileEditor({ className }: ApiFileEditorProps) {
  const state = useEditorState();
  if (state.editorType !== 'api') {
    return null;
  }
  return (
    <Box className={className}>
      <ApiEditorContent apiNodeId={state.editor.nodeId} />
    </Box>
  );
}
