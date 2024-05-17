import * as React from 'react';
import PropTypes from 'prop-types';
import { DialogProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function MyCustomDialog({ open, onClose }) {
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

MyCustomDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

function DemoContent() {
  const dialogs = useDialogs();
  return (
    // preview
    <div>
      <Button
        onClick={async () => {
          await dialogs.open(MyCustomDialog);
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
