import * as React from 'react';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';

function DemoContent() {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        onClick={async () => {
          // preview-start
          const confirmed = await dialogs.confirm('Are you sure?', {
            okText: 'Yes',
            cancelText: 'No',
          });
          if (confirmed) {
            await dialogs.alert("Then let's do it!");
          } else {
            await dialogs.alert('Ok, forget about it!');
          }
          // preview-end
        }}
      >
        Confirm
      </Button>
    </div>
  );
}

export default function ConfirmDialog() {
  return (
    <DialogsProvider>
      <DemoContent />
    </DialogsProvider>
  );
}
