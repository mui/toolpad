import * as React from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';

export default function SystemDialogs() {
  const dialogs = useDialogs();
  return (
    <div>
      <Button
        onClick={() => {
          dialogs.alert('Hello World');
        }}
      >
        Alert
      </Button>
    </div>
  );
}
