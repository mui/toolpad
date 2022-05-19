async function resolveValues(input: Map<string, Promise<unknown>>): Promise<Map<string, unknown>> {
  const resolved = await Promise.all(input.values());
  return new Map(Array.from(input.keys(), (key, i) => [key, resolved[i]]));
}

export default async function createRequire(urlImports: string[]) {
  const modules = await resolveValues(
    new Map<string, any>([
      ['react', import('react')],
      ['react-dom', import('react-dom')],
      ['@mui/toolpad-core', import(`@mui/toolpad-core`)],
      ['@mui/material', import('@mui/material')],
      ['@mui/x-data-grid-pro', import('@mui/x-data-grid-pro')],
      ['@mui/x-date-pickers', import('@mui/x-date-pickers')],
      ['@mui/icons-material', import('@mui/icons-material')],
      ['@mui/material/Button', import('@mui/material/Button')],
      // ... TODO: All @mui/material imports
      ...urlImports.map((url) => [url, import(/* webpackIgnore: true */ url)] as const),
    ]),
  );

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
