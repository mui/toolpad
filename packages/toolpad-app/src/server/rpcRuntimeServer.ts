import { createMethod, MethodsOf } from './rpc';
import type { ToolpadProject } from './localMode';

// Methods exposed to the Toolpad editor
export function createRpcRuntimeServer(project: ToolpadProject) {
  return {
    query: {},
    mutation: {
      execQuery: createMethod<typeof project.dataManager.execQuery>(({ params }) => {
        return project.dataManager.execQuery(...params);
      }),
    },
  } as const;
}

export type ServerDefinition = MethodsOf<ReturnType<typeof createRpcRuntimeServer>>;
