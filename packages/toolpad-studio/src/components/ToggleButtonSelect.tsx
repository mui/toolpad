import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material';

const PropControlToggleButtonGroup = styled(
  ToggleButtonGroup,
  {},
)(({ fullWidth }) => ({
  display: 'flex',
  [`& .${toggleButtonClasses.root}`]: fullWidth
    ? {
        flex: 1,
      }
    : {},
}));

export interface ToggleButtonSelectProps<T extends string = string> {
  label?: string;
  options?: (T | { value: T; label?: string })[];
  value?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

function ToggleButtonSelect<T extends string = string>({
  options,
  label,
  value,
  onChange,
  disabled,
  fullWidth,
}: ToggleButtonSelectProps<T>) {
  const handleChange = React.useCallback(
    (event: React.MouseEvent, newValue: T) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <PropControlToggleButtonGroup
        color="primary"
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {options?.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = (typeof option === 'string' ? option : option.label) || optionValue;
          return (
            <ToggleButton key={optionValue} value={optionValue}>
              {optionLabel}
            </ToggleButton>
          );
        })}
      </PropControlToggleButtonGroup>
    </FormControl>
  );
}

export default ToggleButtonSelect;
