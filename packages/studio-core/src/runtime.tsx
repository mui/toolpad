import * as React from 'react';
import { DATA_PROP_NODE_ID } from './constants';

export interface WrappedStudioNodeProps {
  children: React.ReactElement;
  id: string;
}

export const WrappedStudioNode = React.forwardRef(function WrappedStudioNode(
  { children, id }: WrappedStudioNodeProps,
  ref,
) {
  const newRef = React.useCallback(
    (elm) => {
      if (elm) {
        elm.setAttribute(DATA_PROP_NODE_ID, id);
      }
      if (typeof ref === 'function') {
        ref(elm);
      } else if (ref) {
        ref.current = elm;
      }
    },
    [id, ref],
  );
  return React.cloneElement(children, {
    ref: newRef,
  });
});
