import * as React from 'react';
import { useQuery } from 'react-query';
import { Alert, Box, Button, LinearProgress, Stack, Toolbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { NodeId } from '../../../types';
import dataSources from '../../../toolpadDataSources/client';
import client from '../../../api';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import useDebounced from '../../../utils/useDebounced';
import NodeNameEditor from '../NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';
import { ConnectionSelect } from '../HierarchyExplorer/CreateApiNodeDialog';
import JsonView from '../../JsonView';
import { usePrompt } from '../../../utils/router';

interface ApiEditorContentProps<Q> {
  appId: string;
  className?: string;
  apiNode: appDom.ApiNode<Q>;
}

function ApiEditorContent<Q, PQ>({ appId, className, apiNode }: ApiEditorContentProps<Q>) {
  const domApi = useDomApi();
  const dom = useDom();

  const [apiQuery, setApiQuery] = React.useState<Q>(apiNode.attributes.query.value);
  const savedQuery = React.useRef(apiNode.attributes.query.value);

  const conectionId = apiNode.attributes.connectionId.value as NodeId;
  const connection = appDom.getMaybeNode(dom, conectionId, 'connection');
  const dataSourceName = apiNode.attributes.dataSource.value;
  const dataSource = dataSources[dataSourceName] || null;

  const previewApi: appDom.ApiNode<Q> = React.useMemo(() => {
    return {
      ...apiNode,
      attributes: { ...apiNode.attributes, query: appDom.createConst(apiQuery) },
    };
  }, [apiNode, apiQuery]);

  const debouncedPreviewApi = useDebounced(previewApi, 250);

  const previewQuery = useQuery(['api', debouncedPreviewApi], async () =>
    client.query.execApi(appId, debouncedPreviewApi, {}),
  );

  const queryEditorApi = React.useMemo(() => {
    return {
      fetchPrivate: async (query: PQ | {}) =>
        client.query.dataSourceFetchPrivate(appId, conectionId, query),
    };
  }, [appId, conectionId]);

  const handleConnectionChange = React.useCallback(
    (newConnectionId) => {
      if (apiNode) {
        domApi.setNodeNamespacedProp(
          apiNode,
          'attributes',
          'connectionId',
          appDom.createConst(newConnectionId),
        );
      }
    },
    [apiNode, domApi],
  );

  const allChangesAreCommitted = savedQuery.current === apiQuery;

  usePrompt(
    'Your API has unsaved changes. Are you sure you want to navigate away? All changes will be discarded.',
    !allChangesAreCommitted,
  );

  if (!dataSource) {
    return (
      <NotFoundEditor className={className} message={`DataSource "${dataSourceName}" not found`} />
    );
  }

  const previewIsInvalid: boolean = !connection && !previewQuery.isError;

  return (
    <Box sx={{ position: 'relative', flex: 1 }}>
      <SplitPane
        split="horizontal"
        allowResize
        defaultSize="60%"
        paneStyle={{
          width: '100%',
          overflowY: 'auto',
          display: 'block',
        }}
      >
        <Stack sx={{ width: '100%', p: 3 }}>
          <Stack direction="row" gap={2}>
            <NodeNameEditor node={apiNode} />
            <ConnectionSelect
              dataSource={dataSourceName}
              value={connection?.id ?? null}
              onChange={handleConnectionChange}
            />
          </Stack>
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
                    appDom.createConst(apiQuery),
                  );
                });
                savedQuery.current = apiQuery;
              }}
              disabled={allChangesAreCommitted}
            >
              Update
            </Button>
          </Toolbar>
          <Stack spacing={2}>
            <dataSource.QueryEditor
              api={queryEditorApi}
              // TODO: Add disabled mode to QueryEditor
              // disabled={!connection}
              value={apiQuery}
              onChange={(newApiQuery) => setApiQuery(newApiQuery)}
            />
          </Stack>
        </Stack>
        {previewQuery.isLoading || (previewIsInvalid && previewQuery.isFetching) ? (
          <LinearProgress />
        ) : null}
        <Box sx={{ p: 2 }}>
          {previewQuery.isError ? (
            <Alert severity="error">{(previewQuery.error as Error).message}</Alert>
          ) : null}
          {!previewIsInvalid && previewQuery.isSuccess ? (
            <JsonView src={previewQuery.data} />
          ) : null}
        </Box>
      </SplitPane>
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
  const apiNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'api');
  return apiNode ? (
    <ApiEditorContent className={className} key={nodeId} appId={appId} apiNode={apiNode} />
  ) : (
    <NotFoundEditor className={className} message={`Non-existing api "${nodeId}"`} />
  );
}
