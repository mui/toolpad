import * as React from 'react';
import { Emitter } from '@mui/toolpad-utils/events';
import useEventCallback from '@mui/utils/useEventCallback';
import { useNonNullableContext } from '@mui/toolpad-utils/react';
import { useQuery } from '@tanstack/react-query';
import { ProjectEvents } from './types';

const ProjectEventsContext = React.createContext<Emitter<ProjectEvents> | null>(null);

export interface ProjectEventsProviderProps {
  url: string;
  children?: React.ReactNode;
}

function fetchAppDevManifest(url: string) {
  return fetch(`${url}/__toolpad_dev__/manifest.json`).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch app dev manifest: ${response.status}`);
    }
    return response.json();
  });
}

export function ProjectEventsProvider({ url, children }: ProjectEventsProviderProps) {
  const projectEvents = React.useRef(new Emitter<ProjectEvents>());

  const { data: manifest } = useQuery(['app-dev-manifest', url], () => fetchAppDevManifest(url), {
    suspense: true,
  });

  const { wsUrl } = manifest || {};

  React.useEffect(() => {
    if (!wsUrl) {
      return () => {};
    }

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
