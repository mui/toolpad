import * as React from 'react';
import * as appDom from '../appDom';
import { createProvidedContext } from '../utils/react';
import loadModule from './loadModule';

type SuspenseCacheEntry =
  | { state: 'pending'; promise: Promise<any> }
  | { state: 'loaded'; module: unknown; error?: Error };

const [useAppModules, AppModulesContextProvider] =
  createProvidedContext<Partial<Record<string, { module: unknown; error?: Error }>>>('AppModules');

const ModulesCacheContext = React.createContext(new Map<string, SuspenseCacheEntry>());

export interface AppModulesProviderProps {
  dom: appDom.AppDom;
  children?: React.ReactNode;
}

/**
 * Loads all custom modules used by dom. Suspends while loading.
 */
export function AppModulesProvider({ dom, children }: AppModulesProviderProps) {
  const moduleSpecs: [string, string | null][] = React.useMemo(() => {
    const root = appDom.getApp(dom);
    const { codeComponents = [], pages = [] } = appDom.getChildNodes(dom, root);
    return [
      ...codeComponents.map((component): [string, string | null] => [
        `codeComponents/${component.id}`,
        component.attributes.code.value,
      ]),
      ...pages.map((page): [string, string | null] => [
        `pages/${page.id}`,
        page.attributes.module?.value ?? null,
      ]),
    ];
  }, [dom]);

  const cache = React.useContext(ModulesCacheContext);
  const modules: Record<string, any> = {};
  const pending: Promise<void>[] = [];

  for (const [id, content] of moduleSpecs) {
    const cacheId = `// ${id}\n${content}`;
    const fromCache = cache.get(cacheId);

    if (content) {
      if (!fromCache) {
        const createPromise = loadModule(content, id).then(
          (module: unknown) => {
            cache.set(cacheId, {
              state: 'loaded',
              module,
            });
          },
          (error) => {
            cache.set(cacheId, {
              state: 'loaded',
              module: undefined,
              error,
            });
          },
        );
        cache.set(cacheId, {
          state: 'pending',
          promise: createPromise,
        });
        pending.push(createPromise);
      } else if (fromCache.state === 'pending') {
        pending.push(fromCache.promise);
      } else {
        modules[id] = fromCache;
      }
    }
  }

  if (pending.length > 0) {
    throw Promise.all(pending);
  }

  return <AppModulesContextProvider value={modules}>{children}</AppModulesContextProvider>;
}

export { useAppModules };
