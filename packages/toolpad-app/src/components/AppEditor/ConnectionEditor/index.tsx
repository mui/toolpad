import * as React from 'react';
import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import CheckIcon from '@mui/icons-material/Check';
import CrossIcon from '@mui/icons-material/Clear';
import { ConnectionStatus, NodeId, ConnectionEditorProps, ClientDataSource } from '../../../types';
import { useDom, useDomApi } from '../../DomLoader';
import * as appDom from '../../../appDom';
import dataSources from '../../../toolpadDataSources/client';
import NodeNameEditor from '../NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';
import client from '../../../api';
import AppEditorShell from '../AppEditorShell';

function getConnectionStatusIcon(status: ConnectionStatus) {
  return status.error ? <CrossIcon /> : <CheckIcon />;
}

interface ConnectionParamsEditorProps<P> extends ConnectionEditorProps<P> {
  dataSource: ClientDataSource<P, any>;
}

function ConnectionParamsEditor<P>({
  dataSource,
  value,
  onChange,
  connectionId,
  appId,
  handlerBasePath,
}: ConnectionParamsEditorProps<P>) {
  const { ConnectionParamsInput } = dataSource;
  return (
    <ConnectionParamsInput
      handlerBasePath={handlerBasePath}
      connectionId={connectionId}
      value={value}
      onChange={onChange}
      appId={appId}
    />
  );
}

interface ConnectionEditorContentProps<P> {
  appId: string;
  className?: string;
  connectionNode: appDom.ConnectionNode<P>;
}

function ConnectionEditorContent<P>({
  appId,
  className,
  connectionNode,
}: ConnectionEditorContentProps<P>) {
  const domApi = useDomApi();

  const [connectionParams, setConnectionParams] = React.useState<P>(
    connectionNode.attributes.params.value,
  );
  const savedConnectionParams = React.useRef<P | null>(connectionNode.attributes.params.value);
  const dataSourceType = connectionNode.attributes.dataSource.value;

  const dataSource = dataSources[dataSourceType];

  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    connectionParams: P;
    status: ConnectionStatus;
  } | null>(null);

  const handleConnectionTest = React.useCallback(async () => {
    if (!savedConnectionParams) {
      return;
    }
    try {
      setIsTesting(true);
      const status = await client.mutation.testConnection({
        ...connectionNode,
        attributes: {
          ...connectionNode.attributes,
          params: appDom.createSecret(connectionParams),
        },
      });
      if (status) {
        setTestResult({
          connectionParams,
          status,
        });
        if (status.error) {
          alert(status.error);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTesting(false);
    }
  }, [connectionNode, connectionParams]);

  return (
    <Box className={className} sx={{ width: '100%', height: '100%', px: 3 }}>
      <Toolbar disableGutters>
        <Button
          onClick={() => {
            (Object.keys(connectionParams) as (keyof P)[]).forEach((propName) => {
              if (typeof propName !== 'string' || !connectionParams[propName]) {
                return;
              }
              domApi.setNodeNamespacedProp(
                connectionNode,
                'attributes',
                'params',
                appDom.createSecret(connectionParams),
              );
            });
            savedConnectionParams.current = connectionParams;
          }}
          disabled={connectionParams === savedConnectionParams.current}
        >
          Update
        </Button>
        <LoadingButton
          disabled={!connectionParams}
          onClick={handleConnectionTest}
          loading={isTesting}
          endIcon={
            connectionParams === testResult?.connectionParams
              ? getConnectionStatusIcon(testResult.status)
              : null
          }
        >
          Test
        </LoadingButton>
      </Toolbar>
      <Stack spacing={1}>
        <NodeNameEditor node={connectionNode} />
        {dataSource ? (
          <ConnectionParamsEditor
            dataSource={dataSource}
            value={connectionParams}
            onChange={setConnectionParams}
            handlerBasePath={`/api/dataSources/${dataSourceType}`}
            appId={appId}
            connectionId={connectionNode.id}
          />
        ) : (
          <Typography>
            Unrecognized datasource &quot;{connectionNode.attributes.dataSource.value}&quot;
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export interface ConnectionProps {
  appId: string;
}

export default function ConnectionEditor({ appId }: ConnectionProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const connectionNode = appDom.getMaybeNode(dom, nodeId as NodeId, 'connection');
  return (
    <AppEditorShell appId={appId} activeNodeId={connectionNode?.id}>
      {connectionNode ? (
        <ConnectionEditorContent appId={appId} key={nodeId} connectionNode={connectionNode} />
      ) : (
        <NotFoundEditor message={`Non-existing Connection "${nodeId}"`} />
      )}
    </AppEditorShell>
  );
}
