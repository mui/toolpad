import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ButtonProps,
  TextField,
} from '@mui/material';
import * as React from 'react';

const SystemDialog = Dialog;
const SystemDialogTitle = DialogTitle;
const SystemDialogContent = DialogContent;
const SystemDialogActions = DialogActions;
const SystemDialogCancelButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} color="inherit" variant="text" {...props}>
    cancel
  </Button>
));
const SystemDialogOkButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} {...props}>
    ok
  </Button>
));

export interface ConfirmDialogProps {
  open: boolean;
  onClose: (result: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  cancelButton?: React.ReactNode;
  okButton?: React.ReactNode;
  severity?: 'error' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  children,
  cancelButton = 'cancel',
  okButton = 'ok',
  severity,
}: ConfirmDialogProps) {
  const handleCancel = React.useCallback(() => onClose(false), [onClose]);

  const handleOk = React.useCallback(() => onClose(true), [onClose]);

  return (
    <SystemDialog open={open} onClose={handleCancel}>
      <SystemDialogTitle>{title ?? 'Confirm'}</SystemDialogTitle>
      <SystemDialogContent>{children}</SystemDialogContent>
      <SystemDialogActions>
        <SystemDialogCancelButton onClick={handleCancel}>{cancelButton}</SystemDialogCancelButton>
        <SystemDialogOkButton color={severity} onClick={handleOk}>
          {okButton}
        </SystemDialogOkButton>
      </SystemDialogActions>
    </SystemDialog>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  okButton?: React.ReactNode;
}

export function AlertDialog({ open, onClose, title, children, okButton = 'ok' }: AlertDialogProps) {
  const handleOk = React.useCallback(() => onClose(), [onClose]);

  return (
    <SystemDialog open={open} onClose={handleOk}>
      <SystemDialogTitle>{title ?? 'Alert'}</SystemDialogTitle>
      <SystemDialogContent>{children}</SystemDialogContent>
      <SystemDialogActions>
        <SystemDialogOkButton onClick={handleOk}>{okButton}</SystemDialogOkButton>
      </SystemDialogActions>
    </SystemDialog>
  );
}

export interface PromptDialogProps {
  open: boolean;
  onClose: (result: string | null) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  cancelButton?: React.ReactNode;
  okButton?: React.ReactNode;
}

export function PromptDialog({
  open,
  onClose,
  title,
  children,
  cancelButton = 'cancel',
  okButton = 'ok',
}: PromptDialogProps) {
  const [input, setInput] = React.useState('');

  const handleCancel = React.useCallback(() => onClose(null), [onClose]);

  const handleOk = React.useCallback(() => onClose(input), [input, onClose]);

  const handleInput = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setInput(event.target.value),
    [],
  );

  return (
    <SystemDialog open={open} onClose={handleCancel}>
      <SystemDialogTitle>{title ?? 'Prompt'}</SystemDialogTitle>
      <SystemDialogContent>
        {children}
        <TextField fullWidth value={input} onChange={handleInput} />
      </SystemDialogContent>
      <SystemDialogActions>
        <SystemDialogCancelButton onClick={handleCancel}>{cancelButton}</SystemDialogCancelButton>
        <SystemDialogOkButton onClick={handleOk}>{okButton}</SystemDialogOkButton>
      </SystemDialogActions>
    </SystemDialog>
  );
}
