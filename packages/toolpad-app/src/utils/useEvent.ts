import * as React from 'react';

let dispatcher: any = null;

function getCurrentDispatcher() {
  // Only used to provide debug info during development.
  // eslint-disable-next-line no-underscore-dangle
  return (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher
    .current;
}

function useRenderTracker() {
  if (dispatcher === null) {
    dispatcher = getCurrentDispatcher();
  }
}

function isInRender() {
  return dispatcher !== null && dispatcher === getCurrentDispatcher();
}

/**
 * A Hook to define an event handler with an always-stable function identity.
 * In anticipation of a react native solution
 * See https://github.com/reactjs/rfcs/pull/220
 */
export default function useEvent<F extends (...args: any[]) => void>(handler: F): F {
  useRenderTracker();
  const ref = React.useRef(handler);
  React.useInsertionEffect(() => {
    ref.current = handler;
  });
  // @ts-expect-error
  return React.useCallback((...args) => {
    if (process.env.NODE_ENV !== 'production' && isInRender()) {
      console.error(`Functions returned by useEvent can't be called during a React render.`);
    }
    const fn = ref.current;
    fn(...args);
  }, []);
}
