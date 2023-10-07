import { Box } from '@mui/material';

import * as React from 'react';
import PagePanel from './PagePanel';

export interface ToolpadShellProps {
  children: React.ReactNode;
}

export default function AppEditorShell({ children }: ToolpadShellProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <PagePanel
        sx={{
          width: 250,
          borderRight: 1,
          borderColor: 'divider',
        }}
      />
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
