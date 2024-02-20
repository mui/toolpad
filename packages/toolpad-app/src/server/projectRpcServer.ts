import { createMethod, MethodResolvers } from './rpc';
import type { ToolpadProject } from './localMode';

// Methods exposing the actions on the Toolpad project
export function createRpcServer(project: ToolpadProject) {
  return {
    dataSourceFetchPrivate: createMethod<typeof project.dataManager.dataSourceFetchPrivate>(
      ({ params }) => {
        return project.dataManager.dataSourceFetchPrivate(...params);
      },
    ),
    execQuery: createMethod<typeof project.dataManager.execDataNodeQuery>(({ params }) => {
      return project.dataManager.execDataNodeQuery(...params);
    }),
    loadDom: createMethod<typeof project.loadDom>(({ params }) => {
      return project.loadDom(...params);
    }),
    getVersionInfo: createMethod<typeof project.getVersionInfo>(({ params }) => {
      return project.getVersionInfo(...params);
    }),
    introspect: createMethod<typeof project.functionsManager.introspect>(({ params }) => {
      return project.functionsManager.introspect(...params);
    }),
    getPrettierConfig: createMethod<typeof project.getPrettierConfig>(({ params }) => {
      return project.getPrettierConfig(...params);
    }),
    saveDom: createMethod<typeof project.saveDom>(({ params }) => {
      return project.saveDom(...params);
    }),
    applyDomDiff: createMethod<typeof project.applyDomDiff>(({ params }) => {
      return project.applyDomDiff(...params);
    }),
    openCodeEditor: createMethod<typeof project.openCodeEditor>(({ params }) => {
      return project.openCodeEditor(...params);
    }),
    createComponent: createMethod<typeof project.createComponent>(({ params }) => {
      return project.createComponent(...params);
    }),
    deletePage: createMethod<typeof project.deletePage>(({ params }) => {
      return project.deletePage(...params);
    }),
    dataSourceExecPrivate: createMethod<typeof project.dataManager.dataSourceExecPrivate>(
      ({ params }) => {
        return project.dataManager.dataSourceExecPrivate(...params);
      },
    ),
    createDataProvider: createMethod<typeof project.createDataProvider>(({ params }) => {
      return project.createDataProvider(...params);
    }),
    getRuntimeConfig: createMethod<typeof project.getRuntimeConfig>(({ params }) => {
      return project.getRuntimeConfig(...params);
    }),
    getComponents: createMethod<typeof project.getComponentsManifest>(({ params }) => {
      return project.getComponentsManifest(...params);
    }),
  } satisfies MethodResolvers;
}

export type ServerDefinition = ReturnType<typeof createRpcServer>;
