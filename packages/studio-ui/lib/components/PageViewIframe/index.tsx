import * as React from 'react';
import { styled } from '@mui/material';
import { StudioPage } from '../../types';
import renderPageAsCode from '../../renderPageAsCode';

const classes = {
  iframe: 'StudioViewIframe',
};

const PageViewRoot = styled('div')({
  position: 'relative',
  [`& .${classes.iframe}`]: {
    border: 'none',
    width: '100%',
  },
});

export interface PageViewHandle {
  getRootElm: () => HTMLElement | null;
}

export interface PageViewProps {
  className?: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
  page: StudioPage;
}

export default React.forwardRef(function PageView(
  { className, page, onAfterRender }: PageViewProps,
  ref: React.ForwardedRef<PageViewHandle>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [sandboxReady, setSandboxReady] = React.useState(false);
  const [height, setHeight] = React.useState(0);

  const postMessageToFrame = React.useCallback((message) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return frameRef.current?.contentWindow?.document.getElementById('root') ?? null;
    },
  }));

  React.useEffect(() => {
    if (!frameRef.current) {
      return () => {};
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'studio-sandbox-ready') {
        setSandboxReady(true);
      } else if (event.data.type === 'studio-sandbox-resize') {
        setHeight(event.data.height);
      } else if (event.data.type === 'studio-sandbox-render') {
        onAfterRender?.();
      }
    };
    window.addEventListener('message', handleMessage);
    frameRef.current.src = '/api/sandbox';
    return () => window.removeEventListener('message', handleMessage);
  }, [onAfterRender]);

  React.useEffect(() => {
    if (!frameRef.current || !sandboxReady) {
      return;
    }
    const { code } = renderPageAsCode(page, {
      editor: true,
      inlineQueries: true,
      transforms: ['jsx', 'typescript'],
    });
    postMessageToFrame({
      type: 'studio-sandbox-accept',
      code,
    });
  }, [sandboxReady, page, postMessageToFrame]);

  return (
    <PageViewRoot className={className}>
      <iframe ref={frameRef} className={classes.iframe} title="sandbox" style={{ height }} />
    </PageViewRoot>
  );
});
