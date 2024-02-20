import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
  toggleButtonClasses,
} from '@mui/material';
import * as React from 'react';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';

const PropControlToggleButtonGroup = styled(ToggleButtonGroup)({
  display: 'flex',
  [`& .${toggleButtonClasses.root}`]: {
    flex: 1,
  },
});

function SelectPropEditor({ label, propType, value, onChange, disabled }: EditorProps<string>) {
  const items = propType.type === 'string' ? propType.enum ?? [] : [];
  const handleChange = React.useCallback(
    (event: React.MouseEvent, newValue: string) => {
      onChange(newValue || undefined);
    },
    [onChange],
  );

  const enumLabels: Record<string, string> =
    propType.type === 'string' ? propType.enumLabels ?? {} : {};

  return (
    <PropertyControl propType={propType}>
      <Box sx={{ my: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <PropControlToggleButtonGroup
          color="primary"
          value={value}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
          disabled={disabled}
        >
          {items.map((item) => (
            <ToggleButton key={item} value={item}>
              {enumLabels[item] || item}
            </ToggleButton>
          ))}
        </PropControlToggleButtonGroup>
      </Box>
    </PropertyControl>
  );
}

export default SelectPropEditor;
