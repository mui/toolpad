import * as React from 'react';
import { styled } from '@mui/material';
import { rectContainsPoint } from '../../utils/geometry';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';

const classes = {
  iframe: 'StudioViewIframe',
};

const PageViewRoot = styled('div')({
  position: 'relative',
  [`& .${classes.iframe}`]: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
});

export function getViewCoordinates(
  viewElm: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = viewElm.getBoundingClientRect();
  if (rectContainsPoint(rect, clientX, clientY)) {
    return { x: clientX - rect.x, y: clientY - rect.y };
  }
  return null;
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [sandboxReady, setSandboxReady] = React.useState(false);

  React.useEffect(() => {
    if (!frameRef.current) {
      return () => {};
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.data.source === 'studio-sandbox-ready') {
        setSandboxReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    frameRef.current.src = '/api/sandbox';
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  React.useEffect(() => {
    if (!frameRef.current || !sandboxReady) {
      return;
    }
    const { code } = renderPageAsCode(page, {
      editor: true,
      transforms: ['jsx', 'typescript'],
    });
    frameRef.current.contentWindow?.postMessage(
      {
        code,
      },
      window.location.origin,
    );
  }, [sandboxReady, page]);

  return (
    <PageViewRoot ref={ref} className={className}>
      <iframe ref={frameRef} className={classes.iframe} title="sandbox" />
    </PageViewRoot>
  );
});
