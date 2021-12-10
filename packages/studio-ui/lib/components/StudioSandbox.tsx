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
  onAfterRender?: () => void;
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
  entry: string;
  importMap: string;
}

function createPage({ entry, importMap }: CreatePageParams) {
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

        <!-- ES Module Shims: Import maps polyfill for modules browsers without import maps support (all except Chrome 89+) -->
        <script async src="/web_modules/es-module-shims.js" type="module"></script>

        <script type="module" src="/compiled/sandbox/index.js"></script>
        <script type="module" src="${entry}"></script>
      </body>
    </html>
  `;
}

export default React.forwardRef(function StudioSandbox(
  { className, onAfterRender, files, entry, base, importMap = { imports: {} } }: StudioSandboxProps,
  ref: React.ForwardedRef<StudioSandboxHandle>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(0);
  const resizeObserverRef = React.useRef<ResizeObserver>();
  const mutationObserverRef = React.useRef<MutationObserver>();

  const serializedImportMap = JSON.stringify(importMap);
  const prevFiles = React.useRef<SandboxFiles>(files);
  React.useEffect(() => {
    if (!frameRef.current) {
      return;
    }
    const init = async (iframe: HTMLIFrameElement) => {
      // TODO: probably just want to update if already exists?
      await navigator.serviceWorker.register('/compiled/serviceWorker/index.js', {
        // Not supported in FF and Safari
        // type: 'module',
        scope: base,
      });
      await addFiles(
        {
          ...prevFiles.current,
          '/': {
            code: createPage({ entry: base + entry, importMap: serializedImportMap }),
            type: 'text/html',
          },
        },
        base,
      );
      iframe.src = `${base}/`;
    };
    init(frameRef.current);
    // TODO: cleanup service worker/cache? what if multiple sandboxes are initialized?
  }, [base, entry, serializedImportMap]);

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return frameRef.current?.contentWindow?.document.getElementById('root') ?? null;
    },
  }));

  const handleFrameLoad = React.useCallback(() => {
    resizeObserverRef.current?.disconnect();
    mutationObserverRef.current?.disconnect();

    if (!frameRef.current?.contentWindow) {
      throw new Error(`Invariant: frameRef not correctly attached`);
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      const [documentEntry] = entries;
      setHeight(documentEntry.contentRect.height);
    });

    resizeObserverRef.current.observe(frameRef.current.contentWindow.document.body);

    mutationObserverRef.current = new MutationObserver(() => {
      // TODO: debounce?
      onAfterRender?.();
    });

    mutationObserverRef.current.observe(frameRef.current.contentWindow.document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }, [onAfterRender]);

  React.useEffect(
    () => () => {
      // make sure to clean up the ResizeObserver
      resizeObserverRef.current?.disconnect();
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
      style={{ height }}
      onLoad={handleFrameLoad}
    />
  );
});
