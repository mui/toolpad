import * as React from 'react';
import { CompiledModule } from '../types';
import { createProvidedContext } from '../utils/react';
import loadModule from './loadModule';

type SuspenseCacheEntry =
  | { state: 'pending'; promise: Promise<any> }
  | { state: 'loaded'; module: unknown; error?: Error };

const [useAppModules, AppModulesContextProvider] =
  createProvidedContext<Partial<Record<string, { module: unknown; error?: Error }>>>('AppModules');

const ModulesCacheContext = React.createContext(new Map<string, SuspenseCacheEntry>());

export interface AppModulesProviderProps {
  children?: React.ReactNode;
  modules: Record<string, CompiledModule>;
}

/**
 * Loads all custom modules used by dom. Suspends while loading.
 */
export function AppModulesProvider({
  children,
  modules: compiledModules,
}: AppModulesProviderProps) {
  const cache = React.useContext(ModulesCacheContext);
  const loadedModules: Record<string, any> = {};
  const pending: Promise<void>[] = [];

  for (const [id, mod] of Object.entries(compiledModules)) {
    if (!mod.error) {
      const cacheId = `// ${id}\n${mod.code}`;
      const fromCache = cache.get(cacheId);

      if (!fromCache) {
        const createPromise = loadModule(mod).then(
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
        loadedModules[id] = fromCache;
      }
    }
  }

  if (pending.length > 0) {
    throw Promise.all(pending);
  }

  return <AppModulesContextProvider value={loadedModules}>{children}</AppModulesContextProvider>;
}

export { useAppModules };
