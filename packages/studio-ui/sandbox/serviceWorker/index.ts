const global: ServiceWorkerGlobalScope = globalThis as any;

const dependencies = new Map<string, Set<string>>();

global.addEventListener('install', (event) => {
  event.waitUntil(global.skipWaiting());
});

global.addEventListener('activate', (event) => {
  event.waitUntil(global.clients.claim());
});

global.addEventListener('fetch', (event) => {
  event.respondWith(
    Promise.resolve().then(async () => {
      const rawFilesCache = await caches.open('rawFiles');
      const { pathname } = new URL(event.request.url);
      const rawFile = await rawFilesCache.match(pathname);

      if (!rawFile) {
        return fetch(event.request);
      }

      const content = await rawFile.text();

      const compiled = `
        if (window.__HMR) {
          import.meta.hot = window.__HMR.createHotContext(import.meta.url);
        }
    
        ${content}
      `;

      let existingDeps = dependencies.get(pathname);
      if (!existingDeps) {
        existingDeps = new Set();
        dependencies.set(pathname, existingDeps);
      }

      if (pathname.endsWith('/index.js')) {
        const { pathname: resolved } = new URL('./page.js', event.request.url);
        existingDeps.add(resolved);
      }

      return new Response(new Blob([compiled], { type: 'application/javascript' }), {
        status: 200,
      });
    }),
  );
});

global.addEventListener('message', async (event) => {
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
