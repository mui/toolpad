import * as React from 'react';
import { ScopedCssBaseline, Box, GlobalStyles, Portal } from '@mui/material';

interface ResizeHandleProps {
  onResize?: (height: number) => void;
  onCommitResize?: (height: number) => void;
}

function ResizeHandle({ onResize, onCommitResize }: ResizeHandleProps) {
  const prevSize = React.useRef<number | null>(null);
  const [resizing, setResizing] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (prevSize.current !== null) {
        onResize?.(event.clientY - prevSize.current);
        prevSize.current = event.clientY;
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (prevSize.current !== null) {
        onCommitResize?.(event.clientY - prevSize.current);
        prevSize.current = null;
      }
      setResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize, onCommitResize]);

  return (
    <Box
      sx={{
        my: '-4px',
        width: '100%',
        height: '9px',
        cursor: 'ns-resize',
        pointerEvents: 'auto',
      }}
      onMouseDown={(event) => {
        setResizing(true);
        prevSize.current = event.clientY;
      }}
    >
      <GlobalStyles
        styles={{
          body: resizing
            ? {
                userSelect: 'none',
                cursor: 'ns-resize',
                pointerEvents: 'none',
              }
            : {},
        }}
      />
    </Box>
  );
}

export interface DevtoolHostProps {
  children?: React.ReactNode;
}

/**
 * Pure presentational component that defines the surface we use to render the devtools in
 */
export default function DevtoolHost({ children }: DevtoolHostProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(() => window.innerHeight / 2);

  const handleResize = (y: number) => {
    setHeight((prevHeight) => prevHeight - y);
  };

  return (
    <Portal>
      <ScopedCssBaseline>
        <Box
          ref={rootRef}
          className="mui-fixed"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            zIndex: 1300,
          }}
        >
          <GlobalStyles styles={{ body: { marginBottom: `${height}px` } }} />
          <ResizeHandle onResize={handleResize} />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              marginRight: '-1px',
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            {children}
          </Box>
        </Box>
      </ScopedCssBaseline>
    </Portal>
  );
}
