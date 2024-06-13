import * as React from 'react';
import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function MyCustomDialog({ payload, open, onClose }: DialogProps<number>) {
  const dialogs = useDialogs();
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Dialog {payload}</DialogTitle>
      <DialogContent>
        <Button
          onClick={async () => {
            // preview-start
            await dialogs.open(MyCustomDialog, payload + 1);
            // preview-end
          }}
        >
          Stack another one
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        onClick={async () => {
          await dialogs.open(MyCustomDialog, 1);
        }}
      >
        Open the first one
      </Button>
    </div>
  );
}

export default function StackedDialog() {
  return (
    <DialogsProvider>
      <DemoContent />
    </DialogsProvider>
  );
}
