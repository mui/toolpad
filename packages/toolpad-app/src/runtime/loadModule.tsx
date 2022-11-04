import { transform, TransformResult } from 'sucrase';
import { codeFrameColumns } from '@babel/code-frame';
import { findImports, isAbsoluteUrl } from '../utils/strings';
import { errorFrom } from '../utils/errors';
import muiMaterialExports from './muiExports';
import muiIcons from './iconsMaterialStub';

async function resolveValues(input: Map<string, Promise<unknown>>): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

async function createRequire(urlImports: string[]) {
  const modules = await resolveValues(
    new Map<string, Promise<any>>([
      // These import('...') are passed static strings so that webpack knows how to resolve them at build time.
      // Don't change
      ['react', import('react')],
      ['dayjs', import('dayjs')],
      ['react-dom', import('react-dom')],
      ['@mui/toolpad-core', import(`@mui/toolpad-core`)],

      ...muiMaterialExports,

      ...urlImports.map((url) => [url, import(/* webpackIgnore: true */ url)] as const),
    ]),
  );

  const require = (moduleId: string): unknown => {
    let esModule = modules.get(moduleId);

    if (!esModule) {
      if (moduleId === '@mui/icons-material') {
        return muiIcons;
      }

      // Custom solution for icons
      const iconMatch = /^@mui\/icons-material\/(.*)$/.exec(moduleId);
      if (iconMatch) {
        const iconName = iconMatch[1];
        esModule = { default: (muiIcons as any)[iconName] };
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
