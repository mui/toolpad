import * as React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import * as appDom from '@mui/toolpad-core/appDom';
import { ConnectionEditorProps, ClientDataSource } from '../../../types';
import { useAppState, useDomApi } from '../../AppState';
import dataSources from '../../../toolpadDataSources/client';
import { ConnectionContextProvider } from '../../../toolpadDataSources/context';
import NodeNameEditor from '../NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';
import useUndoRedo from '../../hooks/useUndoRedo';

interface ConnectionParamsEditorProps<P> extends ConnectionEditorProps<P> {
  dataSource: ClientDataSource<P, any>;
}

function ConnectionParamsEditor<P>({
  dataSource,
  value,
  onChange,
  connectionId,
  handlerBasePath,
}: ConnectionParamsEditorProps<P>) {
  const { ConnectionParamsInput } = dataSource;

  invariant(ConnectionParamsInput, 'Datasource has no ConnectionParamsInput');

  return (
    <ConnectionParamsInput
      handlerBasePath={handlerBasePath}
      connectionId={connectionId}
      value={value}
      onChange={onChange}
    />
  );
}

interface ConnectionEditorContentProps<P> {
  className?: string;
  connectionNode: appDom.ConnectionNode<P>;
}

function ConnectionEditorContent<P>({
  className,
  connectionNode,
}: ConnectionEditorContentProps<P>) {
  const domApi = useDomApi();

  const handleConnectionChange = React.useCallback(
    (connectionParams: P | null) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(
          draft,
          connectionNode,
          'attributes',
          'params',
          appDom.createSecret(connectionParams),
        ),
      );
    },
    [connectionNode, domApi],
  );

  const dataSourceId = connectionNode.attributes.dataSource;
  const dataSource = dataSources[dataSourceId];
  const connectionEditorContext = React.useMemo(
    () => ({ dataSourceId, connectionId: connectionNode.id }),
    [dataSourceId, connectionNode.id],
  );

  return (
    <Box className={className} sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <Container sx={{ my: 2 }}>
        <Stack spacing={1}>
          <NodeNameEditor node={connectionNode} />
          {dataSource ? (
            <ConnectionContextProvider value={connectionEditorContext}>
              <ConnectionParamsEditor
                dataSource={dataSource}
                value={connectionNode.attributes.params.$$secret}
                onChange={handleConnectionChange}
                handlerBasePath={`/api/dataSources/${dataSourceId}`}
                connectionId={connectionNode.id}
              />
            </ConnectionContextProvider>
          ) : (
            <Typography>
              Unrecognized datasource &quot;{connectionNode.attributes.dataSource}&quot;
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export interface ConnectionProps {
  nodeId?: NodeId;
}

export default function ConnectionEditor({ nodeId }: ConnectionProps) {
  const { dom } = useAppState();
  const connectionNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'connection');

  useUndoRedo();

  return connectionNode ? (
    <ConnectionEditorContent key={nodeId} connectionNode={connectionNode} />
  ) : (
    <NotFoundEditor message={`Non-existing Connection "${nodeId}"`} />
  );
}
