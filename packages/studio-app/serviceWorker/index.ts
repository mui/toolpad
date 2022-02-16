import { transform } from 'sucrase';

declare const self: ServiceWorkerGlobalScope;

const dependencies = new Map<string, Set<string>>();

// poor man's compiler for now
// TODO: This is a brittle mechanism, use a real parser for this
function findImportedModuleIDs(source: string): string[] {
  const importRegex = /^\s*import\s+(.*)\s+from\s+['"](.*)['"]\s*;?$/;
  return source
    .replace(/{\n/gm, '{')
    .replace(/,\n/gm, ',')
    .replace(/,}/gm, ' }')
    .replace(/ {2}/gm, ' ')
    .split('\n')
    .map((line) => {
      const result = importRegex.exec(line);

      return result ? result[2] : null;
    })
    .filter(Boolean);
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    Promise.resolve().then(async () => {
      const rawFilesCache = await caches.open('rawFiles');
      const { pathname, searchParams } = new URL(event.request.url);
      const rawFile = await rawFilesCache.match(pathname);

      if (!rawFile) {
        return fetch(event.request);
      }

      if (rawFile.headers.get('content-type') === 'application/javascript') {
        const content = await rawFile.text();

        let compiled = `
          if (window.__HMR) {
            import.meta.hot = window.__HMR.createHotContext(import.meta.url);
          }
      
          ${transform(content, { transforms: ['jsx', 'typescript'] }).code}
        `;

        let existingDeps = dependencies.get(pathname);
        if (!existingDeps) {
          existingDeps = new Set();
          dependencies.set(pathname, existingDeps);
        }

        const mtimeParam = searchParams.get('mtime');
        findImportedModuleIDs(content).forEach((id) => {
          if (id.startsWith('.')) {
            const { pathname: resolved } = new URL(id, event.request.url);
            existingDeps!.add(resolved);
            if (mtimeParam) {
              // invalidate dependencies
              // TODO: This is a brittle mechanism, use a real parser for this
              compiled = compiled.replaceAll(id, `${id}?=${mtimeParam}`);
            }
          }
        });

        return new Response(new Blob([compiled], { type: 'application/javascript' }), {
          status: 200,
        });
      }

      return rawFile;
    }),
  );
});

self.addEventListener('message', async (event) => {
  switch (event.data.type) {
    case 'getDependants': {
      const id: string = event.data.id;
      const dependants = new Set<string>();

      // eslint-disable-next-line no-restricted-syntax
      for (const [path, moduleDeps] of dependencies.entries()) {
        if (moduleDeps.has(id)) {
          dependants.add(path);
        }
      }

      event.ports[0].postMessage({ dependants: Array.from(dependants) });
      break;
    }
    default:
      break;
  }
});

export {};
