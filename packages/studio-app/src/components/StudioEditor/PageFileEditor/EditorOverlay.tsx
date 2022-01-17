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
  document?: Document;
  children?: React.ReactNode;
}

/**
 * Responsible for creating the portal that will render the overlay inside of the editor
 * iframe.
 */
export default function EditorOverlay({ document, children }: EditorOverlayProps) {
  const overlayContainerRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    if (document) {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
      overlayContainerRef.current = container;
    }
  }, [document]);

  return overlayContainerRef.current ? (
    <Portal container={overlayContainerRef.current}>
      <Overlay container={overlayContainerRef.current}>{children}</Overlay>
    </Portal>
  ) : null;
}
