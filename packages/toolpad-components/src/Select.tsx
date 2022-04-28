// TODO: Remove after https://github.com/DefinitelyTyped/DefinitelyTyped/pull/56210 lands
/// <reference types="react/next" />
import * as React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
} from '@mui/material';
import { ComponentConfig } from '@mui/toolpad-core';

export interface Selectoption {
  value: string;
  label?: string;
}

export interface SelectProps extends MuiSelectProps {
  options: (string | Selectoption)[];
}

export default function Select({ sx, label, options, ...props }: SelectProps) {
  const labelId = React.useId();
  return (
    <FormControl size="small" sx={{ minWidth: 120, ...sx }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect labelId={labelId} label={label} {...props}>
        {options.map((option) => {
          const parsedOption: Selectoption =
            typeof option === 'string' ? { value: option } : option;
          return (
            <MenuItem key={parsedOption.value} value={parsedOption.value}>
              {parsedOption.label ?? parsedOption.value}
            </MenuItem>
          );
        }) ?? null}
      </MuiSelect>
    </FormControl>
  );
}

Select.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  label: '',
  // eslint-disable-next-line react/default-props-match-prop-types
  variant: 'outlined',
  // eslint-disable-next-line react/default-props-match-prop-types
  size: 'small',
  // eslint-disable-next-line react/default-props-match-prop-types
  value: '',
  options: [],
};

export const config: ComponentConfig<SelectProps> = {
  argTypes: {
    label: {
      typeDef: { type: 'string' },
    },
    disabled: {
      typeDef: { type: 'boolean' },
    },
    variant: {
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'] },
    },
    size: {
      typeDef: { type: 'string', enum: ['small', 'normal'] },
    },
    value: {
      typeDef: { type: 'string' },
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
      onChangeHandler: {
        params: ['event'],
        valueGetter: 'event.target.value',
      },
    },
    options: {
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json' },
      control: { type: 'json' },
    },
    sx: {
      typeDef: { type: 'object' },
    },
  },
};
