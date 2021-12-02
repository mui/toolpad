import * as React from 'react';
import { styled } from '@mui/material';

const StudioSandboxRoot = styled('iframe')({
  border: 'none',
  width: '100%',
});

export interface StudioSandboxProps {
  className?: string;
  code: string;
  // Callback for when the view has rendered. Make sure this value is stable
  onAfterRender?: () => void;
}

export interface StudioSandboxHandle {
  getRootElm: () => HTMLElement | null;
}

export default React.forwardRef(function StudioSandbox(
  { className, code, onAfterRender }: StudioSandboxProps,
  ref: React.ForwardedRef<StudioSandboxHandle>,
) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [sandboxReady, setSandboxReady] = React.useState(false);
  const [height, setHeight] = React.useState(0);

  React.useImperativeHandle(ref, () => ({
    getRootElm() {
      return frameRef.current?.contentWindow?.document.getElementById('root') ?? null;
    },
  }));

  const postMessageToFrame = React.useCallback((message) => {
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

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
    postMessageToFrame({
      type: 'studio-sandbox-accept',
      code,
    });
  }, [sandboxReady, code, postMessageToFrame]);

  return (
    <StudioSandboxRoot ref={frameRef} className={className} title="sandbox" style={{ height }} />
  );
});
