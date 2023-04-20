import {
  ToolpadComponents,
  ToolpadComponent,
  TOOLPAD_COMPONENT,
  createComponent,
  createToolpadComponentThatThrows,
} from '@mui/toolpad-core';
import { resolveValues } from '@mui/toolpad-utils/promises';
import * as ReactIs from 'react-is';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { mapValues } from '@mui/toolpad-utils/collections';
import { errorFrom } from '@mui/toolpad-utils/errors';
import { RuntimeState, CompiledModule } from '../types';
import { ToolpadComponentDefinitions, getToolpadComponents } from '../toolpadComponents';

async function resolveMapValues(
  input: Map<string, Promise<unknown>>,
): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

async function createRequire(urlImports: string[]) {
  const [{ default: muiMaterialExports }, urlModules] = await Promise.all([
    import('./muiExports'),
    resolveMapValues(
      new Map(urlImports.map((url) => [url, import(/* webpackIgnore: true */ url)] as const)),
    ),
  ]);

  const modules: Map<string, any> = new Map([
    ['react', React],
    ['react-dom', ReactDom],
    ...muiMaterialExports,
    ...urlModules,
  ]);

  const require = (moduleId: string): unknown => {
    let esModule = modules.get(moduleId);

    if (!esModule) {
      // Custom solution for icons
      const iconMatch = /^@mui\/icons-material\/(.*)$/.exec(moduleId);
      if (iconMatch) {
        const iconName = iconMatch[1];
        const iconsModule = modules.get('@mui/icons-material');
        esModule = { default: (iconsModule as any)[iconName] };
      }
    }

    if (esModule && typeof esModule === 'object') {
      // ESM interop
      return { ...esModule, __esModule: true };
    }

    throw new Error(`Can't resolve module "${moduleId}"`);
  };

  return require;
}

async function loadModule(mod: CompiledModule): Promise<any> {
  if (mod.error) {
    throw mod.error;
  }

  const require = await createRequire(mod.urlImports);

  const exports: any = {};

  const globals = {
    exports,
    module: { exports },
    require,
  };

  const instantiateModuleCode = `
    (${Object.keys(globals).join(', ')}) => {
      ${mod.code}
    }
  `;

  // eslint-disable-next-line no-eval
  const instantiateModule = (0, eval)(instantiateModuleCode);

  instantiateModule(...Object.values(globals));

  return exports;
}

function ensureToolpadComponent<P extends object>(Component: unknown): ToolpadComponent<P> {
  if (!ReactIs.isValidElementType(Component) || typeof Component === 'string') {
    return createComponent(() => {
      throw new Error(`No React Component.`);
    });
  }

  if ((Component as any)[TOOLPAD_COMPONENT]) {
    return Component as ToolpadComponent<P>;
  }

  return createComponent(Component);
}

export interface LoadedModule {
  module?: unknown;
  error?: Error;
}

interface InitComponentsConfig {
  catalog: ToolpadComponentDefinitions;
  modules: Partial<Record<string, LoadedModule>>;
}

function initComponents({
  catalog,
  modules,
}: InitComponentsConfig): Record<string, ToolpadComponent> {
  const result: Record<string, ToolpadComponent<any>> = {};

  for (const [id, componentDef] of Object.entries(catalog)) {
    if (componentDef) {
      if (componentDef?.codeComponentId) {
        const componentId = componentDef.codeComponentId;
        const moduleEntry = modules[`codeComponents/${componentId}`];
        if (moduleEntry) {
          result[id] = moduleEntry.error
            ? createToolpadComponentThatThrows(moduleEntry.error)
            : ensureToolpadComponent((moduleEntry.module as any)?.default);
        }
      }
    }

    if (!result[id]) {
      result[id] = createToolpadComponentThatThrows(new Error(`Can't find component for "${id}"`));
    }
  }

  return result;
}

export default async function loadComponents({
  dom,
  modules,
}: RuntimeState): Promise<ToolpadComponents> {
  const loadedModules = await resolveValues(
    mapValues(modules, async (mod) => {
      try {
        return { module: await loadModule(mod) };
      } catch (error) {
        return { error: errorFrom(error) };
      }
    }),
  );

  const catalog = getToolpadComponents(dom);
  return initComponents({ catalog, modules: loadedModules });
}
