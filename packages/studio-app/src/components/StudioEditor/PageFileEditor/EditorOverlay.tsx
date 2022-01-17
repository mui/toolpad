import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom';

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
  window?: Window;
  children?: React.ReactNode;
}

/**
 * Responsible for creating the portal that will render the overlay inside of the editor
 * iframe.
 */
export default function EditorOverlay({ window, children }: EditorOverlayProps) {
  const [overlayContainer, setOverlayContainer] = React.useState<HTMLDivElement>();

  React.useEffect(() => {
    if (window) {
      const container = window.document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.pointerEvents = 'none';
      window.document.body.appendChild(container);
      setOverlayContainer(container);
    }
    return () => {};
  }, [window]);

  return overlayContainer
    ? ReactDOM.createPortal(
        <Overlay container={overlayContainer}>{children}</Overlay>,
        overlayContainer,
      )
    : null;
}
