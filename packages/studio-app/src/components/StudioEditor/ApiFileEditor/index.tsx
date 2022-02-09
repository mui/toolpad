import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, TextField, Toolbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { StudioConnection, StudioDataSourceClient, NodeId } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import useDebounced from '../../../utils/useDebounced';

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
  const [apiQuery, setApiQuery] = React.useState(api.query);

  const { data: connectionData } = useQuery(['connection', api.connectionId], () =>
    client.query.getConnection(api.connectionId),
  );

  const datasource = connectionData && getDataSource<P>(connectionData);

  const previewApi: studioDom.StudioApiNode<P> = React.useMemo(() => {
    return { ...api, query: apiQuery };
  }, [api, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const { data: previewData } = useQuery(
    ['api', debouncedPreviewApi],
    () => client.query.execApi(debouncedPreviewApi, {}),
    {},
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
              (Object.keys(apiQuery) as (keyof P)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiQuery[propName]) {
                  return;
                }
                domApi.setNodeAttribute(api, 'query', apiQuery);
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
            value={apiQuery}
            onChange={(newApiQuery) => setApiQuery(newApiQuery)}
          />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', borderTop: 1, borderColor: 'divider' }}>
        <pre>{JSON.stringify(previewData, null, 2)}</pre>
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
