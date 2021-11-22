import * as React from 'react';
import { styled } from '@mui/system';
import { Rectangle } from './utils/geometry';

const PinholeOverlayRoot = styled('div')({
  pointerEvents: 'none !important' as 'none',
  position: 'relative',
  '> div': {
    pointerEvents: 'initial !important',
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    background: '#000',
    opacity: 0.03,
  },
});

export interface PinholeOverlayprops {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  pinhole?: Rectangle | null;
}

export function PinholeOverlay({ className, onClick, pinhole }: PinholeOverlayprops) {
  const left = React.useRef<HTMLDivElement>(null);
  const topLeft = React.useRef<HTMLDivElement>(null);
  const top = React.useRef<HTMLDivElement>(null);
  const topRight = React.useRef<HTMLDivElement>(null);
  const right = React.useRef<HTMLDivElement>(null);
  const bottomRight = React.useRef<HTMLDivElement>(null);
  const bottom = React.useRef<HTMLDivElement>(null);
  const bottomLeft = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (left.current) {
      left.current.style.top = pinhole ? `${pinhole.y}px` : '0';
      left.current.style.width = pinhole ? `${pinhole.x}px` : 'unset';
      left.current.style.height = pinhole ? `${pinhole.height}px` : 'unset';
    }
    if (topLeft.current) {
      topLeft.current.style.width = pinhole ? `${pinhole.x}px` : 'unset';
      topLeft.current.style.height = pinhole ? `${pinhole.y}px` : 'unset';
    }
    if (top.current) {
      top.current.style.left = pinhole ? `${pinhole.x}px` : '0';
      top.current.style.width = pinhole ? `${pinhole.width}px` : 'unset';
      top.current.style.height = pinhole ? `${pinhole.y}px` : 'unset';
    }
    if (topRight.current) {
      topRight.current.style.left = pinhole ? `${pinhole.x + pinhole.width}px` : '0';
      topRight.current.style.height = pinhole ? `${pinhole.y}px` : 'unset';
    }
    if (right.current) {
      right.current.style.top = pinhole ? `${pinhole.y}px` : '0';
      right.current.style.left = pinhole ? `${pinhole.x + pinhole.width}px` : '0';
      right.current.style.height = pinhole ? `${pinhole.height}px` : 'unset';
    }
    if (bottomRight.current) {
      bottomRight.current.style.left = pinhole ? `${pinhole.x + pinhole.width}px` : '0';
      bottomRight.current.style.top = pinhole ? `${pinhole.y + pinhole.height}px` : 'unset';
    }
    if (bottom.current) {
      bottom.current.style.left = pinhole ? `${pinhole.x}px` : '0';
      bottom.current.style.width = pinhole ? `${pinhole.width}px` : 'unset';
      bottom.current.style.top = pinhole ? `${pinhole.y + pinhole.height}px` : 'unset';
    }
    if (bottomLeft.current) {
      bottomLeft.current.style.width = pinhole ? `${pinhole.x}px` : '0';
      bottomLeft.current.style.top = pinhole ? `${pinhole.y + pinhole.height}px` : 'unset';
    }
  }, [pinhole]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick(event);
      }
    },
    [onClick],
  );

  // We key the elements so that React doesn't reuse between pinhole off or on
  return (
    <PinholeOverlayRoot className={className}>
      {pinhole ? (
        <React.Fragment>
          <div key="left" ref={left} onClick={handleClick} />
          <div key="topLeft" ref={topLeft} onClick={handleClick} />
          <div key="top" ref={top} onClick={handleClick} />
          <div key="topRight" ref={topRight} onClick={handleClick} />
          <div key="right" ref={right} onClick={handleClick} />
          <div key="bottomRight" ref={bottomRight} onClick={handleClick} />
          <div key="bottom" ref={bottom} onClick={handleClick} />
          <div key="bottomLeft" ref={bottomLeft} onClick={handleClick} />
        </React.Fragment>
      ) : (
        <div key="full" onClick={handleClick} />
      )}
    </PinholeOverlayRoot>
  );
}
