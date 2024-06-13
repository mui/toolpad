import * as React from 'react';
import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

function MyCustomDialog({ payload, open, onClose }: DialogProps<string>) {
  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Dialog with payload</DialogTitle>
      <DialogContent>The payload is &quot;{payload}&quot;</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close me</Button>
      </DialogActions>
    </Dialog>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  const [payload, setPayload] = React.useState('Some payload');
  return (
    <Stack spacing={2}>
      <TextField
        label="Payload"
        value={payload}
        onChange={(event) => setPayload(event.currentTarget.value)}
      />
      <Button
        onClick={async () => {
          // preview-start
          await dialogs.open(MyCustomDialog, payload);
          // preview-end
        }}
      >
        Open
      </Button>
    </Stack>
  );
}

export default function CustomDialogWithPayload() {
  return (
    <DialogsProvider>
      <DemoContent />
    </DialogsProvider>
  );
}
