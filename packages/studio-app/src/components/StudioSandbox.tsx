import * as React from 'react';
import { styled } from '@mui/material';
import { ImportMap } from 'esinstall';
import { transform } from 'sucrase';

const StudioSandboxRoot = styled('iframe')({
  border: 'none',
  width: '100%',
});

interface SandboxFile {
  code: string;
  type?: 'application/javascript' | 'text/html';
}

type SandboxFiles = {
  [path in string]?: SandboxFile;
};

function isSameFile(file1: SandboxFile, file2: SandboxFile): boolean {
  return file1.code === file2.code && file1.type === file2.type;
}

export interface StudioSandboxProps {
  className?: string;
  base: string;
  importMap?: ImportMap;
  files: SandboxFiles;
  entry: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onUpdate?: () => void;
  onLoad?: (windiw: Window) => void;
}

export interface StudioSandboxHandle {
  getRootElm: () => HTMLElement | null;
}

async function addFiles(files: SandboxFiles, base: string) {
  const cache = await caches.open('rawFiles');
  await Promise.all(
    Object.entries(files).map(async ([path, file]) => {
      if (!file) {
        return;
      }
      let { code } = file;
      const { type = 'application/javascript' } = file;
      if (type === 'application/javascript') {
        // TODO: compilation belongs in the worker?
        const transformed = transform(code, {
          transforms: ['jsx', 'typescript'],
        });
        code = transformed.code;
      }
      await cache.put(
        base + path,
        new Response(new Blob([code], { type }), {
          status: 200,
        }),
      );
    }),
  );
}

interface CreatePageParams {
  importMap: string;
  preload: string;
  entry: string;
}

function createPage({ importMap, preload, entry }: CreatePageParams) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Studio Sandbox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html,
          body {
            margin: 0;
          }

          #root {
            overflow: auto;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>

        <script type="importmap">
          ${importMap}
        </script>

        ${preload}

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        <script type="module" src="/sandbox/index.js"></script>

        <script type="module" src="/editorRuntime/index.js"></script>

        <script type="module" src="${entry}"></script>
        </body>
    </html>
  `;
}

export default React.forwardRef(function StudioSandbox(
  {
    className,
    onUpdate,
    onLoad,
    files,
    entry,
    base,
    importMap = { imports: {} },
  }: StudioSandboxProps,
  ref: React.ForwardedRef<StudioSandboxHandle>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const mutationObserverRef = React.useRef<MutationObserver>();

  const resolvedEntry = base + entry;
  const serializedImportMap = JSON.stringify(importMap);
  const serializedPreload = Object.values(importMap.imports)
    .map((url) => `<link rel="modulepreload" href="${url}" />`)
    .join('\n');
  const prevFiles = React.useRef<SandboxFiles>(files);
  React.useEffect(() => {
    if (!frameRef.current) {
      return;
    }
    const init = async (iframe: HTMLIFrameElement) => {
      // TODO: probably just want to update if already exists?
      await navigator.serviceWorker.register(
        new URL('../../serviceWorker/index', import.meta.url),
        {
          type: 'module',
          scope: base,
        },
      );
      await addFiles(
        {
          ...prevFiles.current,
          '/': {
            code: createPage({
              importMap: serializedImportMap,
              preload: serializedPreload,
              entry: resolvedEntry,
            }),
            type: 'text/html',
          },
        },
        base,
      );

      iframe.src = `${base}/`;
    };
    init(frameRef.current);
    // TODO: cleanup service worker/cache? what if multiple sandboxes are initialized?
  }, [base, entry, serializedImportMap, serializedPreload, resolvedEntry]);

  React.useImperativeHandle(
    ref,
    () => ({
      getRootElm() {
        return frameRef.current?.contentWindow?.document.getElementById('root') ?? null;
      },
    }),
    [],
  );

  const handleFrameLoad = React.useCallback(() => {
    mutationObserverRef.current?.disconnect();

    const frameWindow = frameRef.current?.contentWindow;

    if (!frameWindow) {
      throw new Error(`Invariant: frameRef not correctly attached`);
    }

    mutationObserverRef.current = new MutationObserver(() => {
      // TODO: debounce?
      onUpdate?.();
    });

    mutationObserverRef.current.observe(frameRef.current.contentWindow.document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    onLoad?.(frameWindow);
    onUpdate?.();
  }, [onUpdate, onLoad]);

  React.useEffect(
    () => () => {
      // make sure to clean up the Observers
      mutationObserverRef.current?.disconnect();
    },
    [],
  );

  React.useEffect(() => {
    const initCache = async () => {
      const updates = Object.entries(files).filter(([path, content]) => {
        if (!content) {
          return false;
        }
        if (!path.startsWith('/')) {
          throw new Error(`invalid file name "${path}"`);
        }
        const currentFile = prevFiles.current[path];
        return !currentFile || !isSameFile(currentFile, content);
      });
      prevFiles.current = files;

      if (updates.length > 0) {
        await addFiles(Object.fromEntries(updates), base);
        updates.forEach(([path]) => {
          const url = base + path;
          frameRef.current?.contentWindow?.postMessage({ type: 'update', url });
        });
      }
    };
    initCache();
  }, [files, base]);

  return (
    <StudioSandboxRoot
      ref={frameRef}
      className={className}
      title="sandbox"
      onLoad={handleFrameLoad}
    />
  );
});
