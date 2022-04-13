import * as React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';
import { NodeId } from '../../../types';
import * as appDom from '../../../appDom';

export interface EditorCanvasHostProps {
  className?: string;
  onLoad?: (window: Window) => void;
  appId: string;
  pageNodeId: NodeId;
  // TODO: Remove these when we get rid of PageView
  // eslint-disable-next-line react/no-unused-prop-types
  editor?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  dom: appDom.AppDom;
}

const CanvasRoot = styled('div')({
  width: '100%',
  position: 'relative',
});

const CanvasFrame = styled('iframe')({
  border: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
});

export default function EditorCanvasHost({
  appId,
  className,
  pageNodeId,
  onLoad,
  dom,
}: EditorCanvasHostProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    frameRef.current?.contentWindow?.__TOOLPAD_BRIDGE__?.updateDom(dom);
  }, [dom]);

  return (
    <CanvasRoot className={className}>
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
      <CanvasFrame
        ref={frameRef}
        onLoad={() => onLoad?.(frameRef.current?.contentWindow!)}
        src={`/app/${appId}/preview/pages/${pageNodeId}`}
      />
    </CanvasRoot>
  );
}
