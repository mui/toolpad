import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, TextField, Toolbar } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useParams } from 'react-router-dom';
import { NodeId, StudioConnection, StudioDataSourceClient } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomProvider';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface ApiEditorProps {
  nodeId: NodeId;
}

function ApiEditorContent<Q>({ nodeId }: ApiEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = studioDom.getNode(dom, nodeId);
  studioDom.assertIsApi<Q>(api);

  const [name, setName] = React.useState(api.name);
  const [query, setQuery] = React.useState(studioDom.fromConstPropValues(api.query) as Q);

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const datasource = connectionData && getDataSource<Q>(connectionData);

  const previewApi: studioDom.StudioApiNode<Q> = React.useMemo(() => {
    return { ...api, props: studioDom.toConstPropValues(query) };
  }, [api, query]);

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
          <Button
            onClick={() => {
              domApi.setNodeName(nodeId, name);
              (Object.keys(query) as (keyof Q)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !query[propName]) {
                  return;
                }
                domApi.setNodeNamespacedProp(api, 'query', propName, {
                  type: 'const',
                  value: query[propName],
                });
              });
            }}
          >
            Update
          </Button>
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
        <DataGridPro density="compact" rows={rows} columns={columns} key={columnsFingerPrint} />
      </Box>
    </Box>
  ) : null;
}

interface ApiFileEditorProps {
  className?: string;
}

export default function ApiFileEditor({ className }: ApiFileEditorProps) {
  const { nodeId } = useParams();
  return (
    <Box className={className}>
      <ApiEditorContent key={nodeId} nodeId={nodeId as NodeId} />
    </Box>
  );
}
