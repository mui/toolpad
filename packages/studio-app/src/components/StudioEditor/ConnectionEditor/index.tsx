import * as React from 'react';
import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { NodeId, StudioConnectionParamsEditorProps, StudioDataSourceClient } from '../../../types';
import { useDom, useDomApi } from '../../DomLoader';
import * as studioDom from '../../../studioDom';
import dataSources from '../../../studioDataSources/client';
import NodeNameEditor from '../PageEditor/NodeNameEditor';
import NotFoundEditor from '../NotFoundEditor';

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

  const [connectionParams, setConnectionParams] = React.useState<P>(connectionNode.params);
  const savedConnectionParams = React.useRef<P | null>(connectionNode.params);

  const dataSource = dataSources[connectionNode.dataSource];

  return (
    <Box className={className} sx={{ px: 3 }}>
      <Toolbar disableGutters>
        <Button
          onClick={() => {
            (Object.keys(connectionParams) as (keyof P)[]).forEach((propName) => {
              if (typeof propName !== 'string' || !connectionParams[propName]) {
                return;
              }
              domApi.setNodeAttribute(connectionNode, 'params', connectionParams);
            });
            savedConnectionParams.current = connectionParams;
          }}
          disabled={connectionParams === savedConnectionParams.current}
        >
          Update
        </Button>
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
          <Typography>Unrecognized datasource &quot;{connectionNode.dataSource}&quot;</Typography>
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
