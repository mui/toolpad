import * as React from 'react';
import * as ReactIs from 'react-is';
import { transform } from 'sucrase';

async function resolveValues(input: Map<string, Promise<unknown>>): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

async function createRequire() {
  const modules = await resolveValues(
    new Map<string, any>([
      ['react', import('react')],
      ['react-dom', import('react-dom')],
      ['@mui/toolpad-core', import(`@mui/toolpad-core`)],
      ['@mui/material', import('@mui/material')],
      ['@mui/material/Button', import('@mui/material/Button')],
      ['@mui/material/CheckBox', import('@mui/material/CheckBox')],
      // ... (TODO)
    ]),
  );

  console.log(modules);

  const require = (moduleId: string): unknown => {
    const module = modules.get(moduleId);
    if (module && typeof module === 'object') {
      // ESM interop
      return { ...module, __esModule: true };
    }
    throw new Error(`Can't resolve module "${moduleId}"`);
  };

  return require;
}

export default async function createCodeComponent(src: string): Promise<React.ComponentType> {
  const compiled = transform(src, {
    transforms: ['jsx', 'typescript', 'imports'],
  });

  const require = await createRequire();

  const exports: any = {};

  const globals = {
    exports,
    module: { exports },
    require,
  };

  const instantiateModuleCode = `
    (${Object.keys(globals).join(', ')}) => {
      ${compiled.code}
    }
  `;

  // eslint-disable-next-line no-eval
  const instantiateModule = (0, eval)(instantiateModuleCode);

  instantiateModule(...Object.values(globals));

  const Component: unknown = exports.default;

  if (!ReactIs.isValidElementType(Component) || typeof Component === 'string') {
    throw new Error(`No React Component exported.`);
  }

  return Component;
}
