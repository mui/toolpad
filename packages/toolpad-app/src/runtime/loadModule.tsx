import * as React from 'react';
import * as ReactDom from 'react-dom';
import { CompiledModule } from '../types';

async function resolveValues(input: Map<string, Promise<unknown>>): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

async function createRequire(urlImports: string[]) {
  // const [{ default: muiMaterialExports }, urlModules] = await Promise.all([
  //   import('./muiExports'),
  //   resolveValues(
  //     new Map(urlImports.map((url) => [url, import(/* webpackIgnore: true */ url)] as const)),
  //   ),
  // ]);

  const modules: Map<string, any> = new Map([
    // ['react', React],
    // ['react-dom', ReactDom],
    // ...muiMaterialExports,
    // ...urlModules,
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

export default async function loadModule(mod: CompiledModule): Promise<any> {
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
