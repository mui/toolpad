import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, TextField, Toolbar, Typography } from '@mui/material';
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

interface ApiEditorProps<Q> {
  apiNode: studioDom.StudioApiNode<Q>;
}

function ApiEditorContent<Q>({ apiNode }: ApiEditorProps<Q>) {
  const domApi = useDomApi();

  const [name, setName] = React.useState(apiNode.name);
  const [apiQuery, setApiQuery] = React.useState<Q>(apiNode.query);

  const { data: connectionData } = useQuery(['connection', apiNode.connectionId], () =>
    client.query.getConnection(apiNode.connectionId),
  );

  const datasource = connectionData && getDataSource<Q>(connectionData);

  const previewApi: studioDom.StudioApiNode<Q> = React.useMemo(() => {
    return { ...apiNode, query: apiQuery };
  }, [apiNode, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const { data: previewData } = useQuery(
    ['api', debouncedPreviewApi],
    () => client.query.execApi(debouncedPreviewApi, {}),
    {},
  );

  return datasource ? (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Toolbar>
          <Button
            onClick={() => {
              domApi.setNodeName(apiNode.id, name);
              (Object.keys(apiQuery) as (keyof Q)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiQuery[propName]) {
                  return;
                }
                domApi.setNodeAttribute(apiNode, 'query', apiQuery);
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
  const dom = useDom();
  const { nodeId } = useParams();
  const apiNode = studioDom.getMaybeNode(dom, nodeId as NodeId, 'api');
  return (
    <Box className={className}>
      {apiNode ? (
        <ApiEditorContent key={nodeId} apiNode={apiNode} />
      ) : (
        <Typography sx={{ p: 4 }}>Non-existing Api &quot;{nodeId}&quot;</Typography>
      )}
    </Box>
  );
}
