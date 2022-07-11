import * as React from 'react';

interface DialogProps<D, R> {
  data?: D;
  open: boolean;
  onClose: (result?: R) => void;
}

interface UseDialog<D, R> {
  element: React.ReactNode;
  show: (props: D) => Promise<R | undefined>;
}

interface DialogState<D, R> {
  data: D;
  resolve: (result?: R) => void;
}

export default function useDialog<D = void, R = void>(
  Component: React.ComponentType<DialogProps<D, R>>,
): UseDialog<D, R> {
  const [state, setState] = React.useState<DialogState<D, R> | null>(null);

  const show = React.useCallback(async (data: D) => {
    return new Promise<R | undefined>((resolve) => {
      setState({
        data,
        resolve,
      });
    });
  }, []);

  const handleClose = React.useCallback(
    (result?: R) => {
      if (!state) {
        return;
      }
      const { resolve } = state;
      resolve(result);
      setState(null);
    },
    [state],
  );

  return { show, element: <Component open={!!state} onClose={handleClose} data={state?.data} /> };
}
