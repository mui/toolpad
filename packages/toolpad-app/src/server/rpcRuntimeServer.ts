import { createMethod, MethodResolvers } from './rpc';
import type { ToolpadProject } from './localMode';

// Methods exposed to the Toolpad editor
export function createRpcRuntimeServer(project: ToolpadProject) {
  return {
    execQuery: createMethod<typeof project.dataManager.execQuery>(({ params }) => {
      return project.dataManager.execQuery(...params);
    }),
  } satisfies MethodResolvers;
}

export type ServerDefinition = ReturnType<typeof createRpcRuntimeServer>;
