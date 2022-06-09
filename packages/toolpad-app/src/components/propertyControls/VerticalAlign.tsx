import * as React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AlignverticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import type { EditorProps } from '../../types';

function VerticalAlignPropEditor({
  label,
  value = 'start',
  onChange,
  disabled,
}: EditorProps<string>) {
  const VerticalAlign = (event: React.MouseEvent<HTMLElement>, newVerticalAlign: string | null) => {
    if (newVerticalAlign) {
      onChange(newVerticalAlign);
    }
  };

  return (
    <Box>
      <Typography>{label}:</Typography>
      <ToggleButtonGroup
        exclusive
        disabled={disabled}
        value={value}
        onChange={VerticalAlign}
        aria-label="VerticalAlign"
      >
        <ToggleButton value="start" aria-label="start">
          <AlignverticalTopIcon />
        </ToggleButton>
        <ToggleButton value="center" aria-label="center">
          <AlignVerticalCenterIcon />
        </ToggleButton>
        <ToggleButton value="end" aria-label="end">
          <AlignVerticalBottomIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export default VerticalAlignPropEditor;
