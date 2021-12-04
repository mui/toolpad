import * as React from 'react';
import { styled } from '@mui/material';

const StudioSandboxRoot = styled('iframe')({
  border: 'none',
  width: '100%',
});

interface SandboxFiles {
  [path: string]: string;
}

export interface StudioSandboxProps {
  className?: string;
  code: string;
  files: SandboxFiles;
  entry: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
}

const basePath = '/sandbox/serviceWorker/app';

export interface StudioSandboxHandle {
  getRootElm: () => HTMLElement | null;
}

if (typeof window !== 'undefined') {
  navigator.serviceWorker
    .register('/sandbox/serviceWorker/index.js', {
      type: 'module',
      scope: '/api/sandbox',
    })
    .then((registration) => {
      console.log(`Service Worker Registered, scope: "${registration.scope}"`);
    });
}

export default React.forwardRef(function StudioSandbox(
  { className, onAfterRender, files, entry }: StudioSandboxProps,
  ref: React.ForwardedRef<StudioSandboxHandle>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(0);
  const resizeObserverRef = React.useRef<ResizeObserver>();
  const mutationObserverRef = React.useRef<MutationObserver>();

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

  const prevPages = React.useRef<SandboxFiles>({});
  React.useEffect(() => {
    const initCache = async () => {
      const updates = Object.entries(files).filter(([path, content]) => {
        if (!path.startsWith('/')) {
          throw new Error(`invalid file name "${path}"`);
        }
        return prevPages.current[path] !== content;
      });
      prevPages.current = files;

      const cache = await caches.open('app');

      if (updates.length > 0) {
        await Promise.all(
          updates.map(([path, content]) =>
            cache.put(
              basePath + path,
              new Response(new Blob([content], { type: 'application/javascript' }), {
                status: 200,
              }),
            ),
          ),
        );
        updates.forEach(([path]) => {
          const url = basePath + path;
          frameRef.current?.contentWindow?.postMessage({ type: 'update', url });
        });
      }
    };
    initCache();
  }, [files]);

  return (
    <StudioSandboxRoot
      ref={frameRef}
      src={`/api/sandbox?entry=${encodeURIComponent(basePath + entry)}`}
      className={className}
      title="sandbox"
      style={{ height }}
      onLoad={handleFrameLoad}
    />
  );
});
