import * as React from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Stack, Toolbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { StudioDataSourceClient, NodeId } from '../../../types';
import dataSources from '../../../studioDataSources/client';
import client from '../../../api';
import * as studioDom from '../../../studioDom';
import { useDom, useDomApi } from '../../DomLoader';
import useDebounced from '../../../utils/useDebounced';
import NodeNameEditor from '../NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';

function getDataSource<Q>(
  connection: studioDom.StudioConnectionNode,
): StudioDataSourceClient<any, Q> | null {
  return dataSources[connection.attributes.dataSource.value] || null;
}

interface ApiEditorContentProps<Q> {
  appId: string;
  className?: string;
  apiNode: studioDom.StudioApiNode<Q>;
}

function ApiEditorContent<Q>({ appId, className, apiNode }: ApiEditorContentProps<Q>) {
  const domApi = useDomApi();
  const dom = useDom();

  const [apiQuery, setApiQuery] = React.useState<Q>(apiNode.attributes.query.value);
  const savedQuery = React.useRef(apiNode.attributes.query.value);

  const conectionId = apiNode.attributes.connectionId.value as NodeId;
  const connection = studioDom.getMaybeNode(dom, conectionId, 'connection');
  const dataSource = connection && getDataSource<Q>(connection);

  const previewApi: studioDom.StudioApiNode<Q> = React.useMemo(() => {
    return {
      ...apiNode,
      attributes: { ...apiNode.attributes, query: studioDom.createConst(apiQuery) },
    };
  }, [apiNode, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const { data: previewData } = useQuery(
    ['api', debouncedPreviewApi],
    async () => client.query.execApi(appId, debouncedPreviewApi, {}),
    {},
  );

  const queryEditorApi = React.useMemo(() => {
    return {
      fetchPrivate: async (query: any) => client.query.dataSourceFetchPrivate(conectionId, query),
    };
  }, [conectionId]);

  if (!connection) {
    return (
      <NotFoundEditor
        className={className}
        message={`Connection "${apiNode.attributes.connectionId.value}" not found`}
      />
    );
  }

  if (!dataSource) {
    return (
      <NotFoundEditor
        className={className}
        message={`DataSource "${connection.attributes.dataSource.value}" not found`}
      />
    );
  }

  return (
    <Box className={className} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', px: 3 }}>
        <Toolbar disableGutters>
          <Button
            onClick={() => {
              (Object.keys(apiQuery) as (keyof Q)[]).forEach((propName) => {
                if (typeof propName !== 'string' || !apiQuery[propName]) {
                  return;
                }
                domApi.setNodeNamespacedProp(
                  apiNode,
                  'attributes',
                  'query',
                  studioDom.createConst(apiQuery),
                );
              });
              savedQuery.current = apiQuery;
            }}
            disabled={savedQuery.current === apiQuery}
          >
            Update
          </Button>
        </Toolbar>
        <Stack spacing={2}>
          <NodeNameEditor node={apiNode} />
          <dataSource.QueryEditor
            api={queryEditorApi}
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
  appId: string;
  className?: string;
}

export default function ApiEditor({ appId, className }: ApiEditorProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const apiNode = studioDom.getMaybeNode(dom, nodeId as NodeId, 'api');
  return apiNode ? (
    <ApiEditorContent className={className} key={nodeId} appId={appId} apiNode={apiNode} />
  ) : (
    <NotFoundEditor className={className} message={`Non-existing api "${nodeId}"`} />
  );
}
