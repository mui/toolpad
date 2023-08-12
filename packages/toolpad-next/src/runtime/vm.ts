import * as sucrase from 'sucrase';
import * as path from 'path-browserify';

export interface ModuleInstance {
  exports: unknown;
}

export async function evaluate(
  files: Map<string, { code: string }>,
  entry: string,
  dependencies = new Map<string, ModuleInstance>(),
) {
  const cache = new Map<string, ModuleInstance>(dependencies);
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  const resolveId = (importee: string, importer: string) => {
    if (importee.startsWith('.') || importee.startsWith('/')) {
      const resolved = path.resolve(path.dirname(importer), importee);
      if (files.has(resolved)) {
        return path.resolve(path.dirname(importer), importee);
      }

      for (const ext of extensions) {
        const resolvedWithExt = resolved + ext;
        if (files.has(resolvedWithExt)) {
          return resolvedWithExt;
        }
      }
    } else if (dependencies.has(importee)) {
      return importee;
    }

    throw new Error(`Could not resolve "${importee}" from "${importer}"`);
  };

  const createRequireFn = (importer: string) => (importee: string) => {
    const resolved = resolveId(importee, importer);

    const cached = cache.get(resolved);

    if (cached) {
      return cached.exports;
    }

    const mod = files.get(resolved);

    if (!mod) {
      throw new Error(`Can't find a module for "${importee}"`);
    }

    const compiled = sucrase.transform(mod.code, {
      transforms: ['imports', 'typescript', 'jsx'],
    });

    const fn = new Function('module', 'exports', 'require', compiled.code);
    const exportsObj: unknown = {};
    const moduleObj = { exports: exportsObj };
    const requireFn = createRequireFn(resolved);
    fn(moduleObj, exportsObj, requireFn);

    cache.set(resolved, moduleObj);

    return moduleObj.exports;
  };

  const requireEntry = createRequireFn('/');

  return requireEntry(entry);
}
