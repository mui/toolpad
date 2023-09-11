import { createMethod, MethodsOf } from './rpc';
import type { ToolpadProject } from './localMode';

// Methods exposed to the Toolpad editor
export function createRpcRuntimeServer(project: ToolpadProject) {
  return {
    query: {
      introspectDataProvider: createMethod<typeof project.functionsManager.introspectDataProvider>(
        ({ params }) => {
          return project.functionsManager.introspectDataProvider(...params);
        },
      ),
    },
    mutation: {
      execQuery: createMethod<typeof project.dataManager.execQuery>(({ params }) => {
        return project.dataManager.execQuery(...params);
      }),
    },
  } as const;
}

export type ServerDefinition = MethodsOf<ReturnType<typeof createRpcRuntimeServer>>;
