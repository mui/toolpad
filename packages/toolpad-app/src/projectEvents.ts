import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import useEventCallback from '@mui/utils/useEventCallback';
import { ProjectEvents } from './types';
import config from './config';

const projectEvents = new Emitter<ProjectEvents>();

if (typeof window !== 'undefined') {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(
    `${wsProtocol}//${window.location.hostname}:${config.wsPort}/toolpad-ws`,
  );

  ws.addEventListener('error', () => console.error(`Websocket failed to connect "${ws.url}"`));

  ws.addEventListener('open', () => {
    // eslint-disable-next-line no-console
    console.log('Socket connected');
  });

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    switch (message.kind) {
      case 'projectEvent': {
        projectEvents.emit(message.event, message.payload);
        break;
      }
      default:
        throw new Error(`Unknown message kind: ${message.kind}`);
    }
  });
}

export { projectEvents };

export function useOnProjectEvent<K extends keyof ProjectEvents>(
  event: K,
  handler: (payload: ProjectEvents[K]) => void,
) {
  const stableHandler = useEventCallback(handler);
  return React.useEffect(() => {
    return projectEvents.subscribe(event, stableHandler);
  }, [event, stableHandler]);
}
