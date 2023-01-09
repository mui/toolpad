import { Typography } from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';

function FilePropEditor({ value = [] }: EditorProps<any[]>) {
  const files = Array.from(value);
  const hasSelectedFiles = files?.length > 0;

  if (!hasSelectedFiles) {
    return (
      <Typography variant="body2" noWrap>
        No files chosen
      </Typography>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Typography variant="body2" paragraph sx={{ mb: 1, fontWeight: 700 }}>
        Files:
      </Typography>
      {files.map(({ name }) => (
        <Typography variant="body2" noWrap key={name} sx={{ mb: 0.5 }}>
          {name}
        </Typography>
      ))}
    </div>
  );
}

export default FilePropEditor;
