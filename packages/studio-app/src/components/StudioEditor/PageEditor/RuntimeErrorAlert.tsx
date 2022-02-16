import * as React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { RuntimeError } from '@mui/studio-core';

export interface RuntimeErrorAlertProps {
  error: RuntimeError;
}

export default function RuntimeErrorAlert({ error }: RuntimeErrorAlertProps) {
  return (
    <Alert severity="error" sx={{ overflow: 'auto' }}>
      <AlertTitle>Error</AlertTitle>
      <pre>{error.stack}</pre>
    </Alert>
  );
}
