import * as React from 'react';
import { styled } from '@mui/material';
import { ImportMap } from 'esinstall';
import { transform } from 'sucrase';
import renderPageHtml from '../renderPageHtml';

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
  // Callback for when the view has loaded. Make sure this value is stable
  onLoad?: (windiw: Window) => void;
}

function resolvePathname(relative: string, base: string) {
  const absolute = new URL(base, 'https://x');
  const { pathname, search, hash } = new URL(relative, absolute);
  return pathname + search + hash;
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
        resolvePathname(path, base),
        new Response(new Blob([code], { type }), {
          status: 200,
        }),
      );
    }),
  );
}

export default function StudioSandbox({
  className,
  onLoad,
  files,
  entry,
  base,
  importMap = { imports: {} },
}: StudioSandboxProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  if (!base.endsWith('/')) {
    throw new Error(`Invariant: "${base}" is an invalid bas url`);
  }

  const { code: pageCode } = renderPageHtml({
    editor: true,
    importMap,
    entry: resolvePathname(entry, base),
  });

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
          [base]: {
            code: pageCode,
            type: 'text/html',
          },
        },
        base,
      );

      iframe.src = base;
    };
    init(frameRef.current);
    // TODO: cleanup service worker/cache? what if multiple sandboxes are initialized?
  }, [base, entry, pageCode]);

  const handleFrameLoad = React.useCallback<React.ReactEventHandler<HTMLIFrameElement>>(
    (event) => {
      const frameWindow = event.currentTarget.contentWindow;
      if (!frameWindow) {
        throw new Error(`Invariant: Missing frame window`);
      }
      onLoad?.(frameWindow);
    },
    [onLoad],
  );

  React.useEffect(() => {
    const initCache = async () => {
      const updates = Object.entries(files).filter(([path, content]) => {
        if (!content) {
          return false;
        }
        const currentFile = prevFiles.current[path];
        return !currentFile || !isSameFile(currentFile, content);
      });
      prevFiles.current = files;

      if (updates.length > 0) {
        await addFiles(Object.fromEntries(updates), base);
        updates.forEach(([path]) => {
          const url = resolvePathname(path, base);
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
}
