import * as React from 'react';
import { TextFieldProps, MenuItem, TextField } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';
import { FormContext } from './Form';

export interface SelectOption {
  value: string;
  label?: string;
}

export type SelectProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (newValue: string) => void;
  options: (string | SelectOption)[];
  name: string;
};

function Select({ options, value, onChange, fullWidth, sx, defaultValue, ...rest }: SelectProps) {
  const nodeRuntime = useNode();

  const nodeName = rest.name || nodeRuntime?.nodeName;

  const { form, fieldValues, validationRules } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  const id = React.useId();

  const isInitialForm = Object.keys(fieldValues).length === 0;

  React.useEffect(() => {
    if (form && nodeName) {
      if (!fieldValues[nodeName] && defaultValue && isInitialForm) {
        form.setValue(nodeName, defaultValue);
      } else {
        onChange(fieldValues[nodeName]);
      }
    }
  }, [defaultValue, fieldValues, form, isInitialForm, nodeName, onChange]);

  const renderedOptions = React.useMemo(
    () =>
      options.map((option, i) => {
        const parsedOption: SelectOption =
          option && typeof option === 'object' ? option : { value: String(option) };
        return (
          <MenuItem key={parsedOption.value ?? `${id}::${i}`} value={parsedOption.value}>
            {String(parsedOption.label ?? parsedOption.value)}
          </MenuItem>
        );
      }),
    [id, options],
  );

  return (
    <TextField
      {...rest}
      value={value}
      onChange={handleChange}
      defaultValue={defaultValue}
      select
      sx={{ ...(!fullWidth && !value ? { width: 120 } : {}), ...sx }}
      fullWidth
      {...(form &&
        nodeName && {
          ...form.register(nodeName, validationRules[nodeName]),
          error: Boolean(fieldError),
          helperText: (fieldError as FieldError)?.message || '',
        })}
    >
      {renderedOptions}
    </TextField>
  );
}

export default createComponent(Select, {
  helperText: 'The Select component lets you select a value from a set of options.',
  layoutDirection: 'both',
  loadingPropSource: ['value', 'options'],
  loadingProp: 'disabled',
  argTypes: {
    options: {
      helperText: 'The available options to select from.',
      typeDef: { type: 'array', schema: '/schemas/SelectOptions.json', default: [] },
      control: { type: 'SelectOptions' },
    },
    value: {
      helperText: 'The currently selected value.',
      typeDef: { type: 'string', default: '' },
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value.',
      typeDef: { type: 'string', default: '' },
    },
    label: {
      helperText: 'A label that describes the option that can be selected. e.g. "Country".',
      typeDef: { type: 'string', default: '' },
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      typeDef: {
        type: 'string',
        enum: ['outlined', 'filled', 'standard'],
        default: 'outlined',
      },
    },
    size: {
      helperText: 'The size of the select. One of `small`, or `medium`.',
      typeDef: { type: 'string', enum: ['small', 'medium'], default: 'small' },
    },
    fullWidth: {
      helperText: 'Whether the select should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the select is disabled.',
      typeDef: { type: 'boolean' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
