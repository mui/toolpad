import * as React from 'react';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { Button, ButtonProps } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { DevRpcServer, WithDevtoolParams } from '../shared/types';
import RpcClient from '../shared/RpcClient';
import DevtoolOverlay from './DevtoolOverlay';

type ConnectionStatus = 'unknown' | 'connected' | 'disconnected';

const ServerContext = React.createContext<{
  connectionStatus: ConnectionStatus;
  client: RpcClient<DevRpcServer>;
} | null>(null);

interface ServerProviderProps {
  wsUrl: string;
  children?: React.ReactNode;
}

function ServerProvider({ wsUrl, children }: ServerProviderProps) {
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('unknown');

  React.useEffect(() => {
    const newWs = new WebSocket(wsUrl);
    setWs(newWs);

    newWs.addEventListener('open', () => {
      setConnectionStatus('connected');
    });

    newWs.addEventListener('close', () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      newWs.close();
    };
  }, [wsUrl]);

  const context = React.useMemo(() => {
    return ws
      ? {
          connectionStatus,
          client: new RpcClient<DevRpcServer>(ws),
        }
      : null;
  }, [ws, connectionStatus]);

  return <ServerContext.Provider value={context}>{children}</ServerContext.Provider>;
}

const useCurrentlyEditedComponentId =
  typeof window === 'undefined'
    ? () => [null, () => {}] as [string | null, React.Dispatch<React.SetStateAction<string | null>>]
    : () => useStorageState(window.sessionStorage, 'currently-edited-component-id', null);

const CurrentComponentIdContext = React.createContext<string | null>(null);

const nextId = 1;

export function EditButton(props: ButtonProps) {
  const [currentEditedComponentId, setCurrentlyEditedComponentId] = useCurrentlyEditedComponentId();
  const currentComponentId = React.useContext(CurrentComponentIdContext);

  if (currentEditedComponentId) {
    return null;
  }

  return (
    <Button
      {...props}
      variant="contained"
      onClick={() => setCurrentlyEditedComponentId(currentComponentId)}
      startIcon={<EditIcon />}
    >
      Edit
    </Button>
  );
}

export function withDevtool<P extends React.JSX.IntrinsicAttributes>(
  Component: React.ComponentType<P>,
  { name, file, wsUrl }: WithDevtoolParams,
): React.ComponentType<P> {
  return function ComponentWithDevtool(props) {
    const [currentlyEditedComponentId, setCurrentlyEditedComponentId] =
      useCurrentlyEditedComponentId();

    const [editedComponentId] = React.useState(() => {
      return `component-${nextId}`;
    });

    const editing = currentlyEditedComponentId === editedComponentId;

    return (
      <CurrentComponentIdContext.Provider value={editedComponentId}>
        {editing ? (
          <ServerProvider wsUrl={wsUrl}>
            <Component {...props} />
            <DevtoolOverlay
              name={name}
              file={file}
              onClose={() => setCurrentlyEditedComponentId(null)}
            />
          </ServerProvider>
        ) : (
          <Component {...props} />
        )}
      </CurrentComponentIdContext.Provider>
    );
  } satisfies React.ComponentType<P>;
}
