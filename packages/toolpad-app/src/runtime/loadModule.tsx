import { transform, TransformResult } from 'sucrase';
import { codeFrameColumns } from '@babel/code-frame';
import { findImports, isAbsoluteUrl } from '../utils/strings';
import { errorFrom } from '../utils/errors';

async function resolveValues(input: Map<string, Promise<unknown>>): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

async function createRequire(urlImports: string[]) {
  const [{ default: muiMaterialExports }, urlModules] = await Promise.all([
    import('./muiExports'),
    resolveValues(
      new Map(urlImports.map((url) => [url, import(/* webpackIgnore: true */ url)] as const)),
    ),
  ]);

  const modules: Map<string, any> = new Map([...muiMaterialExports, ...urlModules]);

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

export default async function loadModule(src: string): Promise<any> {
  const imports = findImports(src).filter((maybeUrl) => isAbsoluteUrl(maybeUrl));

  let compiled: TransformResult;

  try {
    compiled = transform(src, {
      transforms: ['jsx', 'typescript', 'imports'],
    });
  } catch (rawError) {
    const err = errorFrom(rawError);
    if ((err as any).loc) {
      err.message = [err.message, codeFrameColumns(src, { start: (err as any).loc })].join('\n\n');
    }
    throw err;
  }

  const require = await createRequire(imports);

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

  return exports;
}
