import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, TextField, Toolbar } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useParams } from 'react-router-dom';
import { StudioConnection, StudioDataSourceClient } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomProvider';
import { NodeId } from '../../../types';

function getDataSource<Q>(connection: StudioConnection): StudioDataSourceClient<any, Q> | null {
  const dataSource = dataSources[connection.type] as StudioDataSourceClient<any, Q>;
  return dataSource || null;
}

interface ApiEditorProps {
  nodeId: NodeId;
}

function ApiEditorContent<P>({ nodeId }: ApiEditorProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = studioDom.getNode(dom, nodeId, 'api');

  const [name, setName] = React.useState(api.name);
  const [apiParams, setApiParams] = React.useState(api.apiParams);

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const datasource = connectionData && getDataSource<P>(connectionData);

  const previewApi: studioDom.StudioApiNode<P> = React.useMemo(() => {
    return { ...api, apiParams };
  }, [api, apiParams]);

  const { data: previewData } = useQuery(['api', previewApi], () => {
    console.log(previewApi);
    return client.query.execApi(previewApi, {});
  });

  const { fields = {}, data: rows = [] } = previewData ?? {};

  console.log(previewData);

  const columns = React.useMemo(
    () =>
      Object.entries(fields).map(([field, def]) => ({
        ...(def as any),
        field,
      })),
    [fields],
  );

  return datasource ? (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        Always hit the save button (top right) after clicking &quot;update&quot;. Will implement
        automatic save later.
        <Toolbar>
          <Button
            onClick={() => {
              domApi.setNodeName(nodeId, name);
              (Object.keys(apiParams) as (keyof P)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiParams[propName]) {
                  return;
                }
                domApi.setNodeAttribute(api, 'apiParams', apiParams);
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
          <datasource.QueryEditor
            value={apiParams}
            onChange={(newApiParams) => setApiParams(newApiParams)}
          />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGridPro density="compact" rows={rows} columns={columns} />
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
