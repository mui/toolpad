import { Emitter } from '@toolpad/utils/events';
import { QueryClient, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useNonNullableContext } from '@toolpad/utils/react';
import invariant from 'invariant';
import { ProjectEvents } from './types';
import { ServerDefinition } from './server/projectRpcServer';
import { createRpcApi } from './rpcClient';

async function fetchAppDevManifest(url: string) {
  const response = await fetch(`${url}/__toolpad_dev__/manifest.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch app dev manifest: ${response.status}`);
  }
  return response.text();
}

function createProject(url: string, serializedManifest: string, queryClient: QueryClient) {
  const manifest = JSON.parse(serializedManifest);
  const events = new Emitter<ProjectEvents>();

  const ws = new WebSocket(manifest.wsUrl);

  ws.addEventListener('error', () => console.error(`Websocket failed to connect "${ws.url}"`));

  ws.addEventListener('open', () => {
    // eslint-disable-next-line no-console
    console.log('Socket connected');
  });

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    switch (message.kind) {
      case 'projectEvent': {
        events.emit(message.event, message.payload);
        break;
      }
      default:
        throw new Error(`Unknown message kind: ${message.kind}`);
    }
  });

  const api = createRpcApi<ServerDefinition>(queryClient, `${url}/__toolpad_dev__/rpc`);

  const unsubExternalChange = events.subscribe('externalChange', () => {
    api.invalidateQueries('loadDom', []);
  });

  const unsubFunctionsChanged = events.subscribe('functionsChanged', () => {
    api.invalidateQueries('introspect', []);
  });

  const dispose = () => {
    if (ws.readyState === ws.OPEN) {
      ws.close();
    } else {
      ws.onopen = () => {
        ws.close();
      };
    }
    unsubExternalChange();
    unsubFunctionsChanged();
  };

  return {
    url,
    rootDir: manifest.rootDir,
    api,
    events,
    dispose,
  };
}

type Project = Awaited<ReturnType<typeof createProject>>;

const ProjectContext = React.createContext<Project | undefined>(undefined);

export interface ProjectProviderProps {
  url: string;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function ProjectProvider({ url, children, fallback }: ProjectProviderProps) {
  const { data: manifest } = useSuspenseQuery({
    queryKey: ['app-dev-manifest', url],
    queryFn: () => fetchAppDevManifest(url),
  });

  invariant(manifest, "manifest should be defined, we're using suspense");

  const queryClient = useQueryClient();

  const [project, setProject] = React.useState<Project | undefined>();

  React.useEffect(() => {
    const newProject = createProject(url, manifest, queryClient);
    setProject(newProject);
    return () => {
      newProject.dispose();
    };
  }, [url, manifest, queryClient]);

  return (
    <ProjectContext.Provider value={project}>
      {project ? children : fallback}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useNonNullableContext(ProjectContext);
}
