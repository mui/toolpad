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
          const confirmed = await dialogs.confirm('Are you sure?');
          if (confirmed) {
            await dialogs.alert("Then let's do it!");
          } else {
            await dialogs.alert('Cancelled!');
          }
        }}
      >
        Confirm
      </Button>
    </div>
  );
}

export default function ConfirmDialog() {
  return (
    <DialogProvider>
      <DemoContent />
    </DialogProvider>
  );
}
