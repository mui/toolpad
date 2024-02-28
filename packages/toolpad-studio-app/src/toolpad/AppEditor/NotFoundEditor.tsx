import { Box, Alert, AlertColor } from '@mui/material';
import * as React from 'react';

export interface NotFoundEditorProps {
  className?: string;
  message: string;
  severity?: AlertColor;
}
export default function NotFoundEditor({ className, message, severity }: NotFoundEditorProps) {
  return (
    <Box className={className} sx={{ p: 3 }}>
      <Alert severity={severity ?? 'warning'}>{message}</Alert>
    </Box>
  );
}
