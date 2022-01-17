import * as React from 'react';
import Portal from '@mui/material/Portal';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

interface OverlayProps {
  children?: React.ReactNode;
  container: HTMLDivElement;
}

function Overlay(props: OverlayProps) {
  const { children, container } = props;

  const cache = React.useMemo(
    () =>
      createCache({
        key: `studio-editor-overlay`,
        prepend: true,
        container,
      }),
    [container],
  );

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export interface EditorOverlayProps {
  container?: HTMLElement;
  children?: React.ReactNode;
}

/**
 * Responsible for creating the portal that will render the overlay inside of the editor
 * iframe.
 */
export default function EditorOverlay({ container, children }: EditorOverlayProps) {
  const overlayHostRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    const doc = container?.ownerDocument.defaultView?.document;
    if (doc) {
      const overlayHost = doc.createElement('div');
      overlayHost.style.position = 'absolute';
      overlayHost.style.left = '0';
      overlayHost.style.top = '0';
      overlayHost.style.right = '0';
      overlayHost.style.bottom = '0';
      overlayHost.style.pointerEvents = 'none';
      doc.body.appendChild(overlayHost);
      overlayHostRef.current = overlayHost;
    }
  }, [container]);

  return (
    overlayHostRef.current && (
      <Portal container={overlayHostRef.current}>
        <Overlay container={overlayHostRef.current}>{children}</Overlay>
      </Portal>
    )
  );
}
