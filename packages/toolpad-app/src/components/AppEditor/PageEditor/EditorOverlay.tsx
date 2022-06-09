import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as ReactDOM from 'react-dom';
import { Maybe } from '../../../utils/types';

interface OverlayProps {
  children?: React.ReactNode;
  container: HTMLDivElement;
}

function Overlay(props: OverlayProps) {
  const { children, container } = props;

  const cache = React.useMemo(
    () =>
      createCache({
        key: `toolpad-editor-overlay`,
        prepend: true,
        container,
      }),
    [container],
  );

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export interface EditorOverlayProps {
  rootElm?: Maybe<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Responsible for creating the portal that will render the overlay inside of the editor
 * iframe.
 */
export default function EditorOverlay({ rootElm, children }: EditorOverlayProps) {
  const [overlayContainer, setOverlayContainer] = React.useState<HTMLDivElement>();

  React.useEffect(() => {
    if (rootElm) {
      const doc = rootElm.ownerDocument;
      const container = doc.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.right = '0';
      container.style.bottom = '0';
      container.style.pointerEvents = 'none';
      rootElm.appendChild(container);
      setOverlayContainer(container);
    }
    return () => {};
  }, [rootElm]);

  return overlayContainer
    ? ReactDOM.createPortal(
        <Overlay container={overlayContainer}>{children}</Overlay>,
        overlayContainer,
      )
    : null;
}
