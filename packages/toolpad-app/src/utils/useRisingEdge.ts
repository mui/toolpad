import * as React from 'react';
import useEvent from './useEvent';

export default function useRisingEdge(value: boolean, handler: () => void) {
  const prevValue = React.useRef(value);
  const stableHandler = useEvent(handler);
  React.useEffect(() => {
    if (!prevValue.current && value) {
      stableHandler();
    }
    prevValue.current = value;
  }, [stableHandler, value]);
}
