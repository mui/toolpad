import * as React from 'react';
import { DialogProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DialogContentText from '@mui/material/DialogContentText';

function MyCustomDialog({ open, onClose }) {
  const [result, setResult] = React.useState('John Snow');
  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Dialog with payload</DialogTitle>
      <DialogContent>
        <DialogContentText>What is your name?</DialogContentText>
        <TextField
          label="Name"
          fullWidth
          value={result}
          onChange={(event) => setResult(event.currentTarget.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(result)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  return (
    // preview
    <Stack spacing={2}>
      <Button
        onClick={async () => {
          const result = await dialogs.open(MyCustomDialog);
          await dialogs.alert(`Your name is "${result}"`);
        }}
      >
        Open
      </Button>
    </Stack>
  );
}

export default function CustomDialogWithResult() {
  return (
    <DialogProvider>
      <DemoContent />
    </DialogProvider>
  );
}
