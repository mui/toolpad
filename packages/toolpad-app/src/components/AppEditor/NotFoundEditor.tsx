import { Box, Alert } from '@mui/material';
import * as React from 'react';

export interface NotFoundEditorProps {
  className?: string;
  message: string;
}
export default function NotFoundEditor({ className, message }: NotFoundEditorProps) {
  return (
    <Box className={className} sx={{ p: 3 }}>
      <Alert severity="warning">{message}</Alert>
    </Box>
  );
}
