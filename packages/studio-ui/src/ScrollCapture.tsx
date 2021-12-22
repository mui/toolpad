import * as React from 'react';

export interface ScrollCaptureProps {
  className?: string;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  size?: { width: number; height: number };
  children?: React.ReactNode;
}

export function ScrollCapture({ className, onScroll, size }: ScrollCaptureProps) {
  return (
    <div className={className} style={{ overflow: 'auto' }} onScroll={onScroll}>
      {size ? <div style={size} /> : null}
    </div>
  );
}
