'use client';
import invariant from 'invariant';
import * as React from 'react';
import { DialogsContext } from './DialogsContext';
import type { DialogComponent, OpenDialog, OpenDialogOptions } from './useDialogs';

interface DialogStackEntry<P, R> {
  key: string;
  open: boolean;
  promise: Promise<R>;
  Component: DialogComponent<P, R>;
  payload: P;
  onClose: (result: R) => Promise<void>;
  resolve: (result: R) => void;
}

export interface DialogProviderProps {
  children?: React.ReactNode;
  unmountAfter?: number;
}

/**
 * Provider for Dialog stacks. The subtree of this component can use the `useDialogs` hook to
 * access the dialogs API. The dialogs are rendered in the order they are requested.
 *
 * Demos:
 *
 * - [useDialogs](https://mui.com/toolpad/core/react-use-dialogs/)
 *
 * API:
 *
 * - [DialogsProvider API](https://mui.com/toolpad/core/api/dialogs-provider)
 */
function DialogsProvider(props: DialogProviderProps) {
  const { children, unmountAfter = 1000 } = props;
  const [stack, setStack] = React.useState<DialogStackEntry<any, any>[]>([]);
  const keyPrefix = React.useId();
  const nextId = React.useRef(0);

  const requestDialog = React.useCallback<OpenDialog>(
    function open<P, R>(
      Component: DialogComponent<P, R>,
      payload: P,
      options: OpenDialogOptions<R> = {},
    ) {
      const { onClose = async () => {} } = options;
      let resolve: ((result: R) => void) | undefined;
      const promise = new Promise<R>((resolveImpl) => {
        resolve = resolveImpl;
      });
      invariant(resolve, 'resolve not set');

      const key = `${keyPrefix}-${nextId.current}`;
      nextId.current += 1;

      const newEntry: DialogStackEntry<P, R> = {
        key,
        open: true,
        promise,
        Component,
        payload,
        onClose,
        resolve,
      };

      setStack((prevStack) => [...prevStack, newEntry]);
      return promise;
    },
    [keyPrefix],
  );

  const closeDialogUi = React.useCallback(
    function closeDialogUi<R>(dialog: Promise<R>) {
      setStack((prevStack) =>
        prevStack.map((entry) => (entry.promise === dialog ? { ...entry, open: false } : entry)),
      );
      setTimeout(() => {
        // wait for closing animation
        setStack((prevStack) => prevStack.filter((entry) => entry.promise !== dialog));
      }, unmountAfter);
    },
    [unmountAfter],
  );

  const closeDialog = React.useCallback(
    async function closeDialog<R>(dialog: Promise<R>, result: R) {
      const entryToClose = stack.find((entry) => entry.promise === dialog);
      invariant(entryToClose, 'dialog not found');
      await entryToClose.onClose(result);
      entryToClose.resolve(result);
      closeDialogUi(dialog);
      return dialog;
    },
    [stack, closeDialogUi],
  );

  const contextValue = React.useMemo(
    () => ({ open: requestDialog, close: closeDialog }),
    [requestDialog, closeDialog],
  );

  return (
    <DialogsContext.Provider value={contextValue}>
      {children}
      {stack.map(({ key, open, Component, payload, promise }) => (
        <Component
          key={key}
          payload={payload}
          open={open}
          onClose={async (result) => {
            await closeDialog(promise, result);
          }}
        />
      ))}
    </DialogsContext.Provider>
  );
}

export { DialogsProvider };
