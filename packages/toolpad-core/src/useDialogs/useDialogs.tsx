'use client';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import DialogContentText from '@mui/material/DialogContentText';
import { useNonNullableContext } from '@toolpad/utils/react';
import invariant from 'invariant';
import * as React from 'react';
import { DialogsContext } from './DialogsContext';
import { useLocaleText, type LocaleText } from '../AppProvider/LocalizationProvider';

interface DialogsProviderLocaleText {
  alert: string;
  confirm: string;
  cancel: string;
  ok: string;
}

const defaultLocaleText: Pick<LocaleText, keyof DialogsProviderLocaleText> = {
  alert: 'Alert',
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'Ok',
};

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
   * value, it should be passed as an argument to this function. You should use the promise
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

export type DialogComponent<P, R> = React.ComponentType<DialogProps<P, R>>;

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
  const globalLocaleText = useLocaleText();
  const localeText = { ...defaultLocaleText, ...globalLocaleText };
  const okButtonProps = useDialogLoadingButton(() => onClose());
  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>{payload.title ?? localeText.alert}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <Button disabled={!open} {...okButtonProps}>
          {payload.okText ?? localeText.ok}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface ConfirmDialogPayload extends ConfirmOptions {
  msg: React.ReactNode;
}

export interface ConfirmDialogProps extends DialogProps<ConfirmDialogPayload, boolean> {}

export function ConfirmDialog({ open, payload, onClose }: ConfirmDialogProps) {
  const globalLocaleText = useLocaleText();
  const localeText = { ...defaultLocaleText, ...globalLocaleText };
  const cancelButtonProps = useDialogLoadingButton(() => onClose(false));
  const okButtonProps = useDialogLoadingButton(() => onClose(true));
  return (
    <Dialog maxWidth="xs" fullWidth open={open} onClose={() => onClose(false)}>
      <DialogTitle>{payload.title ?? localeText.confirm}</DialogTitle>
      <DialogContent>{payload.msg}</DialogContent>
      <DialogActions>
        <Button autoFocus disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? localeText.cancel}
        </Button>
        <Button color={payload.severity} disabled={!open} {...okButtonProps}>
          {payload.okText ?? localeText.ok}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface PromptDialogPayload extends PromptOptions {
  msg: React.ReactNode;
}

export interface PromptDialogProps extends DialogProps<PromptDialogPayload, string | null> {}

export function PromptDialog({ open, payload, onClose }: PromptDialogProps) {
  const globalLocaleText = useLocaleText();
  const localeText = { ...defaultLocaleText, ...globalLocaleText };
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
      <DialogTitle>{payload.title ?? localeText.confirm}</DialogTitle>
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
          onChange={(event) => setInput(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? localeText.cancel}
        </Button>
        <Button disabled={!open} loading={loading} type="submit">
          {payload.okText ?? localeText.ok}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function useDialogs(): DialogHook {
  const { open, close } = useNonNullableContext(DialogsContext);

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
