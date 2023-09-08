import * as React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AlignverticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import AlignVerticalCenterIcon from '@mui/icons-material/AlignVerticalCenter';
import AlignVerticalBottomIcon from '@mui/icons-material/AlignVerticalBottom';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

function VerticalAlignPropEditor({
  propType,
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
    <PropertyControl propType={propType}>
      <div>
        {label ? <Typography variant="body2">{label}:</Typography> : null}
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
      </div>
    </PropertyControl>
  );
}

export default VerticalAlignPropEditor;
