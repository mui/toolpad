import { createMethod, MethodResolvers } from './rpc';
import type { ToolpadProject } from './localMode';

// Methods exposed to the Toolpad runtime
export function createRpcServer(project: ToolpadProject) {
  return {
    introspectDataProvider: createMethod<typeof project.functionsManager.introspectDataProvider>(
      ({ params }) => {
        return project.functionsManager.introspectDataProvider(...params);
      },
    ),
    getDataProviderRecords: createMethod<typeof project.functionsManager.getDataProviderRecords>(
      ({ params }) => {
        return project.functionsManager.getDataProviderRecords(...params);
      },
    ),
    execQuery: createMethod<typeof project.dataManager.execQuery>(({ params }) => {
      return project.dataManager.execQuery(...params);
    }),
    getAuthProvider: createMethod<typeof project.authenticationManager.getAuthProvider>(
      ({ params }) => {
        return project.authenticationManager.getAuthProvider(...params);
      },
    ),
  } satisfies MethodResolvers;
}

export type ServerDefinition = ReturnType<typeof createRpcServer>;
