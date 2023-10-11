import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import useEventCallback from '@mui/utils/useEventCallback';
import { useNonNullableContext } from '@mui/toolpad-utils/react';
import { ProjectEvents } from './types';

const ProjectEventsContext = React.createContext<Emitter<ProjectEvents> | null>(null);

export interface ProjectEventsProviderProps {
  wsUrl: string;
  children?: React.ReactNode;
}

export function ProjectEventsProvider({ wsUrl, children }: ProjectEventsProviderProps) {
  const projectEvents = React.useRef(new Emitter<ProjectEvents>());

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.addEventListener('error', () => console.error(`Websocket failed to connect "${ws.url}"`));

    ws.addEventListener('open', () => {
      // eslint-disable-next-line no-console
      console.log('Socket connected');
    });

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      switch (message.kind) {
        case 'projectEvent': {
          projectEvents.current.emit(message.event, message.payload);
          break;
        }
        default:
          throw new Error(`Unknown message kind: ${message.kind}`);
      }
    });

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  return (
    <ProjectEventsContext.Provider value={projectEvents.current}>
      {children}
    </ProjectEventsContext.Provider>
  );
}

export function useProjectEvents() {
  return useNonNullableContext(ProjectEventsContext);
}

export function useOnProjectEvent<K extends keyof ProjectEvents>(
  event: K,
  handler: (payload: ProjectEvents[K]) => void,
) {
  const stableHandler = useEventCallback(handler);
  const projectEvents = useProjectEvents();
  return React.useEffect(() => {
    return projectEvents.subscribe(event, stableHandler);
  }, [projectEvents, event, stableHandler]);
}
