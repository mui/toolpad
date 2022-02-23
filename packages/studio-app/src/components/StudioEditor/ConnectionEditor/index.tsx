import * as React from 'react';
import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import CheckIcon from '@mui/icons-material/Check';
import CrossIcon from '@mui/icons-material/Clear';
import {
  ConnectionStatus,
  NodeId,
  StudioConnectionParamsEditorProps,
  StudioDataSourceClient,
} from '../../../types';
import { useDom, useDomApi } from '../../DomLoader';
import * as studioDom from '../../../studioDom';
import dataSources from '../../../studioDataSources/client';
import NodeNameEditor from '../PageEditor/NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';
import client from '../../../api';

function getConnectionStatusIcon(status: ConnectionStatus) {
  return status.error ? <CrossIcon /> : <CheckIcon />;
}

interface ConnectionParamsEditorProps<P> extends StudioConnectionParamsEditorProps<P> {
  dataSource: StudioDataSourceClient<P, any>;
}

function ConnectionParamsEditor<P>({
  dataSource,
  value,
  onChange,
  connectionName,
}: ConnectionParamsEditorProps<P>) {
  const { ConnectionParamsInput } = dataSource;
  return (
    <ConnectionParamsInput connectionName={connectionName} value={value} onChange={onChange} />
  );
}

interface ConnectionEditorContentProps<P> {
  className?: string;
  connectionNode: studioDom.StudioConnectionNode<P>;
}

function ConnectionEditorContent<P>({
  className,
  connectionNode,
}: ConnectionEditorContentProps<P>) {
  const domApi = useDomApi();

  const [connectionParams, setConnectionParams] = React.useState<P>(
    connectionNode.attributes.params.value,
  );
  const savedConnectionParams = React.useRef<P | null>(connectionNode.attributes.params.value);

  const dataSource = dataSources[connectionNode.attributes.dataSource.value];

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
          params: studioDom.createConst(connectionParams),
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
    <Box className={className} sx={{ px: 3 }}>
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
                studioDom.createConst(connectionParams),
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
            connectionName={connectionNode.name}
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
  className?: string;
}

export default function ConnectionEditor({ className }: ConnectionProps) {
  const dom = useDom();
  const { nodeId } = useParams();
  const connectionNode = studioDom.getMaybeNode(dom, nodeId as NodeId, 'connection');
  return connectionNode ? (
    <ConnectionEditorContent className={className} key={nodeId} connectionNode={connectionNode} />
  ) : (
    <NotFoundEditor className={className} message={`Non-existing Connection "${nodeId}"`} />
  );
}
