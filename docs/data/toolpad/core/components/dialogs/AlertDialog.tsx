import * as React from 'react';
import { DialogProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';

function DemoContent() {
  const dialogs = useDialogs();
  return (
    // preview
    <div>
      <Button
        onClick={async () => {
          await dialogs.alert('Hello World');
        }}
      >
        Alert
      </Button>
    </div>
  );
}

export default function AlertDialog() {
  return (
    <DialogProvider>
      <DemoContent />
    </DialogProvider>
  );
}
