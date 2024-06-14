import * as React from 'react';
import PropTypes from 'prop-types';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DialogContentText from '@mui/material/DialogContentText';

function MyCustomDialog({ open, onClose }) {
  const [result, setResult] = React.useState('Jon Snow');
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

MyCustomDialog.propTypes = {
  /**
   * A function to call when the dialog should be closed. If the dialog has a return
   * value, it should be passed as an argument to this function. You should use the promise
   * that is returned to show a loading state while the dialog is performing async actions
   * on close.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog can be fully closed.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Whether the dialog is open.
   */
  open: PropTypes.bool.isRequired,
};

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <Stack spacing={2}>
      <Button
        onClick={async () => {
          // preview-start
          const result = await dialogs.open(MyCustomDialog);
          await dialogs.alert(`Your name is "${result}"`);
          // preview-end
        }}
      >
        Open
      </Button>
    </Stack>
  );
}

export default function CustomDialogWithResult() {
  return (
    <DialogsProvider>
      <DemoContent />
    </DialogsProvider>
  );
}
