import * as React from 'react';
import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { RowsSpec } from '../../shared/schemas';

const DATA_KIND_OPTIONS = [
  {
    value: 'property',
    label: 'Property',
  },
  {
    value: 'fetch',
    label: 'Fetch from REST API',
  },
];

export interface RowsEditorProps {
  value: RowsSpec;
  onChange: (value: RowsSpec) => void;
}

export default function RowsEditor({ value, onChange }: RowsEditorProps) {
  return (
    <Stack direction="row">
      <Box sx={{ flex: 1 }}>
        <TextField
          select
          value={value.kind ?? 'property'}
          onChange={(event) =>
            onChange({
              kind: event.target.value as RowsSpec['kind'],
            })
          }
        >
          {DATA_KIND_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ flex: 1 }}>right</Box>
    </Stack>
  );
}
