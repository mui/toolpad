import * as React from 'react';
import { styled, useForkRef } from '@mui/material';
import { ImportMap } from 'esinstall';
import { transform } from 'sucrase';
import renderPageHtml from '../renderPageHtml';
import { omit, take } from '../utils/immutability';

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
  frameRef?: React.RefObject<HTMLIFrameElement>;
  // Callback for when the view has loaded. Make sure this value is stable
  onLoad?: (windiw: Window) => void;
}

function resolvePathname(relative: string, base: string) {
  const absolute = new URL(base, 'https://x');
  const { pathname, search, hash } = new URL(relative, absolute);
  return pathname + search + hash;
}

export default function StudioSandbox({
  className,
  onLoad,
  files,
  entry,
  base,
  frameRef: frameRefProp,
  importMap = { imports: {} },
}: StudioSandboxProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const handleFrameRef = useForkRef(frameRefProp, frameRef);

  const [frameSrc, setFrameSrc] = React.useState<string>();

  const [transformErrors, setTransformErrors] = React.useState<Record<string, string>>({});

  if (!base.endsWith('/')) {
    throw new Error(`Invariant: "${base}" is an invalid bas url`);
  }

  const addFiles = React.useCallback(
    async (newFiles: SandboxFiles, hotUpdate?: boolean) => {
      const cache = await caches.open('rawFiles');
      await Promise.all(
        Object.entries(newFiles).map(async ([path, file]) => {
          if (!file) {
            return;
          }

          const resolvedPath = resolvePathname(path, base);

          try {
            let { code } = file;
            const { type = 'application/javascript' } = file;
            if (type === 'application/javascript') {
              // TODO: compilation belongs in a worker?
              const transformed = transform(code, {
                transforms: ['jsx', 'typescript'],
              });
              code = transformed.code;
            }

            // TODO: Building on top of cache feels a bit hacky, should we build it on top of indexeddb?
            await cache.put(
              resolvedPath,
              new Response(new Blob([code], { type }), {
                status: 200,
              }),
            );

            if (hotUpdate) {
              frameRef.current?.contentWindow?.postMessage({
                type: 'update',
                url: resolvedPath,
              });
            }

            setTransformErrors((errors) => omit(errors, path));
          } catch (err: any) {
            setTransformErrors((errors) => ({ ...errors, [path]: err.message }));
          }
        }),
      );
    },
    [base],
  );

  const { code: pageCode } = renderPageHtml({
    editor: true,
    importMap,
    entry: resolvePathname(entry, base),
  });

  const prevFiles = React.useRef<SandboxFiles>(files);
  React.useEffect(() => {
    const init = async () => {
      // TODO: probably just want to update if already exists?
      await navigator.serviceWorker.register(
        new URL('../../serviceWorker/index', import.meta.url),
        {
          type: 'module',
          scope: base,
        },
      );
      await caches.delete('rawFiles');
      await addFiles({
        ...prevFiles.current,
        [base]: {
          code: pageCode,
          type: 'text/html',
        },
      });

      setFrameSrc(base);
    };
    init();
    // TODO: cleanup service worker/cache? what if multiple sandboxes are initialized?
  }, [base, entry, pageCode, addFiles]);

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
      // Make sure we drop errors for removed files
      setTransformErrors((errors) => take(errors, ...Object.keys(files)));

      const updates = Object.entries(files).filter(([path, content]) => {
        if (!content) {
          return false;
        }
        const currentFile = prevFiles.current[path];
        return !currentFile || !isSameFile(currentFile, content);
      });
      prevFiles.current = files;

      if (updates.length > 0) {
        await addFiles(Object.fromEntries(updates), true);
      }
    };
    initCache();
  }, [files, base, addFiles]);

  const error = Object.values(transformErrors)[0];

  return error ? (
    <div className={className}>{error}</div>
  ) : (
    <StudioSandboxRoot
      ref={handleFrameRef}
      src={frameSrc}
      className={className}
      title="sandbox"
      onLoad={handleFrameLoad}
    />
  );
}
