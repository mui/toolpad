import * as React from 'react';
import { styled } from '@mui/material';
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
    opacity: 0.0,
  },
});

export interface PinholeOverlayprops {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  pinhole?: Rectangle | null;
}

const PinholeOverlay = React.forwardRef(function PinholeOverlay(
  { className, onClick, pinhole }: PinholeOverlayprops,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
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
    <PinholeOverlayRoot ref={ref} className={className}>
      {pinhole ? (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div key="full" onClick={handleClick} />
      ) : null}
    </PinholeOverlayRoot>
  );
});

export { PinholeOverlay };
