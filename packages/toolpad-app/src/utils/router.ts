import * as React from 'react';
import type { Blocker, History, Transition } from 'history';
import {
  Navigator as BaseNavigator,
  UNSAFE_NavigationContext as NavigationContext,
} from 'react-router-dom';

/**
 * Based on the code from https://github.com/remix-run/react-router/issues/8139
 */

interface Navigator extends BaseNavigator {
  block: History['block'];
}

type NavigationContextWithBlock = React.ContextType<typeof NavigationContext> & {
  navigator: Navigator;
};

/**
 * Blocks all navigation attempts. This is useful for preventing the page from
 * changing until some condition is met, like saving form data.
 *
 * In anticipation of this functionality being brought back to react-router
 * See https://github.com/remix-run/react-router/commit/256cad70d3fd4500b1abcfea66f3ee622fb90874
 */
export function useBlocker(blocker: Blocker, when = true) {
  const { navigator } = React.useContext(NavigationContext) as NavigationContextWithBlock;

  const refUnBlock = React.useRef<() => void>();
  const blockerRef = React.useRef(blocker);

  React.useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  React.useEffect(() => {
    if (!when) {
      refUnBlock.current?.();
      refUnBlock.current = undefined;
      return;
    }

    if (!refUnBlock.current) {
      refUnBlock.current = navigator.block((tx: Transition) => {
        const autoUnblockingTx = {
          ...tx,
          retry() {
            refUnBlock.current?.(); // need to unblock so retry succeeds
            tx.retry();
          },
        };

        blockerRef.current(autoUnblockingTx);
      });
    }
  }, [navigator, when]);
}

/**
 * @source https://github.com/remix-run/react-router/issues/8139#issuecomment-1021457943
 */
export function usePrompt(
  message: string | ((location: Transition['location'], action: Transition['action']) => string),
  when = true,
) {
  const blocker = React.useCallback(
    (tx: Transition) => {
      let response;
      if (typeof message === 'function') {
        response = message(tx.location, tx.action);
        if (typeof response === 'string') {
          // eslint-disable-next-line no-alert
          response = window.confirm(response);
        }
      } else {
        // eslint-disable-next-line no-alert
        response = window.confirm(message);
      }
      if (response) {
        tx.retry();
      }
    },
    [message],
  );
  return useBlocker(blocker, when);
}
