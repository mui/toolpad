import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { StudioDataSourceClient, NodeId } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import useDebounced from '../../../utils/useDebounced';
import NodeNameEditor from '../PageEditor/NodeNameEditor';

function getDataSource<Q>(
  connection: studioDom.StudioConnectionNode,
): StudioDataSourceClient<any, Q> | null {
  return dataSources[connection.dataSource] || null;
}

interface ApiEditorContentProps<Q> {
  apiNode: studioDom.StudioApiNode<Q>;
}

function ApiEditorContent<Q>({ apiNode }: ApiEditorContentProps<Q>) {
  const domApi = useDomApi();
  const dom = useDom();

  const [apiQuery, setApiQuery] = React.useState<Q>(apiNode.query);
  const savedQuery = React.useRef(apiNode.query);

  const connection = studioDom.getMaybeNode(dom, apiNode.connectionId as NodeId, 'connection');
  const dataSource = connection && getDataSource<Q>(connection);

  const previewApi: studioDom.StudioApiNode<Q> = React.useMemo(() => {
    return { ...apiNode, query: apiQuery };
  }, [apiNode, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const { data: previewData } = useQuery(
    ['api', debouncedPreviewApi],
    async () => client.query.execApi(debouncedPreviewApi, {}),
    {},
  );

  if (!connection) {
    return <Typography>Connection &quot;{apiNode.connectionId}&quot; not found</Typography>;
  }

  if (!dataSource) {
    return <Typography>DataSource &quot;{connection.dataSource}&quot; not found</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Toolbar>
          <Button
            onClick={() => {
              (Object.keys(apiQuery) as (keyof Q)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiQuery[propName]) {
                  return;
                }
                domApi.setNodeAttribute(apiNode, 'query', apiQuery);
              });
              savedQuery.current = apiQuery;
            }}
            disabled={savedQuery.current === apiQuery}
          >
            Update
          </Button>
        </Toolbar>
        <Stack spacing={2} p={2}>
          <NodeNameEditor node={apiNode} />
          <dataSource.QueryEditor
            value={apiQuery}
            onChange={(newApiQuery) => setApiQuery(newApiQuery)}
          />
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', borderTop: 1, borderColor: 'divider' }}>
        <pre>{JSON.stringify(previewData, null, 2)}</pre>
      </Box>
    </Box>
  );
}

interface ApiEditorProps {
  className?: string;
}

export default function ApiEditor({ className }: ApiEditorProps) {
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
