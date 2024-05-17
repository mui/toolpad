import * as React from 'react';
import { DialogProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// preview-start
function MyCustomDialog({ open, onClose }: DialogProps) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Custom dialog</DialogTitle>
      <DialogContent>I am a custom dialog</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}
// preview-end

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        onClick={async () => {
          // preview-start
          await dialogs.open(MyCustomDialog);
          // preview-end
        }}
      >
        Open custom
      </Button>
    </div>
  );
}

export default function CustomDialog() {
  return (
    <DialogProvider>
      <DemoContent />
    </DialogProvider>
  );
}
