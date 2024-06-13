import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
} from '@mui/material';
import invariant from 'invariant';
import * as React from 'react';

export interface OpenDialogOptions<R> {
  /**
   * A function that is called before closing the dialog closes. The dialog
   * stays open as long as the returned promise is not resolved. Use this if
   * you want to perform an async action on close and show a loading state.
   *
   * @param result The result that the dialog will return after closing.
   * @returns A promise that resolves when the dialog can be closed.
   */
  onClose?: (result: R) => Promise<void>;
}

export interface AlertOptions extends OpenDialogOptions<void> {
  /**
   * A title for the dialog. Defaults to `'Alert'`.
   */
  title?: React.ReactNode;
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode;
}

export interface ConfirmOptions extends OpenDialogOptions<boolean> {
  /**
   * A title for the dialog. Defaults to `'Confirm'`.
   */
  title?: React.ReactNode;
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode;
  /**
   * Denotes the purpose of the dialog. This will affect the color of the
   * "Ok" button. Defaults to `undefined`.
   */
  severity?: 'error' | 'info' | 'success' | 'warning';
  /**
   * The text to show in the "Cancel" button. Defaults to `'Cancel'`.
   */
  cancelText?: React.ReactNode;
}

export interface PromptOptions extends OpenDialogOptions<string | null> {
  /**
   * A title for the dialog. Defaults to `'Prompt'`.
   */
  title?: React.ReactNode;
  /**
   * The text to show in the "Ok" button. Defaults to `'Ok'`.
   */
  okText?: React.ReactNode;
  /**
   * The text to show in the "Cancel" button. Defaults to `'Cancel'`.
   */
  cancelText?: React.ReactNode;
}

/**
 * The props that are passed to a dialog component.
 */
export interface DialogProps<P = undefined, R = void> {
  /**
   * The payload that was passed when the dialog was opened.
   */
  payload: P;
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * A function to call when the dialog should be closed. If the dialog has a return
   * value, it should be apssed as an argument to this function. You should use the promise
   * that is returned to show a loading state while the dialog is performing async actions
   * on close.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog can be fully closed.
   */
  onClose: (result: R) => Promise<void>;
}

export interface OpenAlertDialog {
  /**
   * Open an alert dialog. Returns a promise that resolves when the user
   * closes the dialog.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves when the dialog is closed.
   */
  (msg: React.ReactNode, options?: AlertOptions): Promise<void>;
}

export interface OpenConfirmDialog {
  /**
   * Open a confirmation dialog. Returns a promise that resolves to true if
   * the user confirms, false if the user cancels.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves to true if the user confirms, false if the user cancels.
   */
  (msg: React.ReactNode, options?: ConfirmOptions): Promise<boolean>;
}

export interface OpenPromptDialog {
  /**
   * Open a prompt dialog to request user input. Returns a promise that resolves to the input
   * if the user confirms, null if the user cancels.
   *
   * @param msg The message to show in the dialog.
   * @param options Additional options for the dialog.
   * @returns A promise that resolves to the user input if the user confirms, null if the user cancels.
   */
  (msg: React.ReactNode, options?: PromptOptions): Promise<string | null>;
}

type DialogComponent<P, R> = React.ComponentType<DialogProps<P, R>>;

export interface OpenDialog {
  /**
   * Open a dialog without payload.
   * @param Component The dialog component to open.
   * @param options Additional options for the dialog.
   */
  <P extends undefined, R>(
    Component: DialogComponent<P, R>,
    payload?: P,
    options?: OpenDialogOptions<R>,
  ): Promise<R>;
  /**
   * Open a dialog and pass a payload.
   * @param Component The dialog component to open.
   * @param payload The payload to pass to the dialog.
   * @param options Additional options for the dialog.
   */
  <P, R>(Component: DialogComponent<P, R>, payload: P, options?: OpenDialogOptions<R>): Promise<R>;
}

export interface CloseDialog {
  /**
   * Close a dialog and return a result.
   * @param dialog The dialog to close. The promise returned by `open`.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog is fully closed.
   */
  <R>(dialog: Promise<R>, result: R): Promise<R>;
}

export interface DialogHook {
  alert: OpenAlertDialog;
  confirm: OpenConfirmDialog;
  prompt: OpenPromptDialog;
  open: OpenDialog;
  close: CloseDialog;
}

interface DialogStackEntry<P, R> {
  key: string;
  open: boolean;
  promise: Promise<R>;
  Component: DialogComponent<P, R>;
  payload: P;
  onClose: (result: R) => Promise<void>;
  resolve: (result: R) => void;
}

const OpenDialogContext = React.createContext<OpenDialog>(async () => {
  throw new Error('No DialogProvider found');
});

const CloseDialogContext = React.createContext<CloseDialog>(async () => {
  throw new Error('No DialogProvider found');
});

export interface DialogProviderprops {
  children?: React.ReactNode;
  unmountAfter?: number;
}

export function DialogProvider(props: DialogProviderprops) {
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

  return (
    <OpenDialogContext.Provider value={requestDialog}>
      <CloseDialogContext.Provider value={closeDialog}>
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
      </CloseDialogContext.Provider>
    </OpenDialogContext.Provider>
  );
}

function useDialogLoadingButton(onClose: () => Promise<void>) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);
      await onClose();
    } finally {
      setLoading(false);
    }
  };
  return {
    onClick: handleClick,
    loading,
  };
}

export interface AlertDialogPayload extends AlertOptions {
  msg: React.ReactNode;
}

export interface AlertDialogProps extends DialogProps<AlertDialogPayload, void> {}

export function AlertDialog({ open, payload, onClose }: AlertDialogProps) {
  const okButtonProps = useDialogLoadingButton(() => onClose());
  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>{payload.title ?? 'Alert'}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <LoadingButton disabled={!open} {...okButtonProps}>
          {payload.okText ?? 'Ok'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export interface ConfirmDialogPayload extends ConfirmOptions {
  msg: React.ReactNode;
}

export interface ConfirmDialogProps extends DialogProps<ConfirmDialogPayload, boolean> {}

export function ConfirmDialog({ open, payload, onClose }: ConfirmDialogProps) {
  const cancelButtonProps = useDialogLoadingButton(() => onClose(false));
  const okButtonProps = useDialogLoadingButton(() => onClose(true));
  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>{payload.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <LoadingButton autoFocus disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? 'Cancel'}
        </LoadingButton>
        <LoadingButton color={payload.severity} disabled={!open} {...okButtonProps}>
          {payload.okText ?? 'Ok'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export interface PromptDialogPayload extends PromptOptions {
  msg: React.ReactNode;
}

export interface PromptDialogProps extends DialogProps<PromptDialogPayload, string | null> {}

export function PromptDialog({ open, payload, onClose }: PromptDialogProps) {
  const [input, setInput] = React.useState('');
  const cancelButtonProps = useDialogLoadingButton(() => onClose(null));

  const [loading, setLoading] = React.useState(false);

  const name = 'input';
  return (
    <Dialog
      maxWidth="xs"
      fullWidth
      open={open}
      onClose={() => onClose(null)}
      PaperProps={{
        component: 'form',
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          try {
            setLoading(true);
            const formData = new FormData(event.currentTarget);
            const value = formData.get(name) ?? '';
            invariant(typeof value === 'string', 'Value must come from a text input');
            await onClose(value);
          } finally {
            setLoading(false);
          }
        },
      }}
    >
      <DialogTitle>{payload.title ?? 'Confirm'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{payload.msg} </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          name={name}
          type="text"
          fullWidth
          variant="standard"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? 'Cancel'}
        </LoadingButton>
        <LoadingButton disabled={!open} loading={loading} type="submit">
          {payload.okText ?? 'Ok'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export function useDialogs(): DialogHook {
  const open = React.useContext(OpenDialogContext);

  const close = React.useContext(CloseDialogContext);

  const alert = React.useCallback<OpenAlertDialog>(
    async (msg, { onClose, ...options } = {}) =>
      open(AlertDialog, { ...options, msg }, { onClose }),
    [open],
  );

  const confirm = React.useCallback<OpenConfirmDialog>(
    async (msg, { onClose, ...options } = {}) =>
      open(ConfirmDialog, { ...options, msg }, { onClose }),
    [open],
  );

  const prompt = React.useCallback<OpenPromptDialog>(
    async (msg, { onClose, ...options } = {}) =>
      open(PromptDialog, { ...options, msg }, { onClose }),
    [open],
  );

  return React.useMemo(
    () => ({
      alert,
      confirm,
      prompt,
      open,
      close,
    }),
    [alert, close, confirm, open, prompt],
  );
}
