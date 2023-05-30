import * as React from 'react';
import { TextFieldProps, MenuItem, TextField } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError, Controller } from 'react-hook-form';
import { FormContext, useFormInput, withComponentForm } from './Form.js';
import { SX_PROP_HELPER_TEXT } from './constants.js';

export interface SelectOption {
  value: string;
  label?: string;
}

export type SelectProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (newValue: string) => void;
  defaultValue: string;
  options: (string | SelectOption)[];
  name: string;
  isRequired: boolean;
  isInvalid: boolean;
};

function Select({
  options,
  value,
  onChange,
  fullWidth,
  sx,
  defaultValue,
  isRequired,
  isInvalid,
  ...rest
}: SelectProps) {
  const nodeRuntime = useNode();

  const fieldName = rest.name || nodeRuntime?.nodeName;

  const fallbackName = React.useId();
  const nodeName = fieldName || fallbackName;

  const { form } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const validationProps = React.useMemo(() => ({ isRequired, isInvalid }), [isInvalid, isRequired]);

  const { onFormInputChange } = useFormInput<string>({
    name: nodeName,
    value,
    onChange,
    defaultValue,
    validationProps,
  });

  const id = React.useId();

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (form) {
        onFormInputChange(newValue);
      } else {
        onChange(newValue);
      }
    },
    [form, onChange, onFormInputChange],
  );

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

  const selectElement = (
    <TextField
      {...rest}
      value={value}
      onChange={handleChange}
      select
      fullWidth
      sx={{ ...(!fullWidth && !value ? { width: 120 } : {}), ...sx }}
      {...(form && {
        error: Boolean(fieldError),
        helperText: (fieldError as FieldError)?.message || '',
      })}
    >
      {renderedOptions}
    </TextField>
  );

  const fieldDisplayName = rest.label || fieldName || 'Field';

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={{
        required: isRequired ? `${fieldDisplayName} is required.` : false,
        validate: () => !isInvalid || `${fieldDisplayName} is invalid.`,
      }}
      render={() => selectElement}
    />
  ) : (
    selectElement
  );
}

const FormWrappedSelect = withComponentForm(Select);

export default createComponent(FormWrappedSelect, {
  helperText: 'The Select component lets you select a value from a set of options.',
  layoutDirection: 'both',
  loadingPropSource: ['value', 'options'],
  loadingProp: 'disabled',
  argTypes: {
    options: {
      helperText: 'The available options to select from.',
      type: 'array',
      schema: '/schemas/SelectOptions.json',
      default: [],
      control: { type: 'SelectOptions' },
    },
    value: {
      helperText: 'The currently selected value.',
      type: 'string',
      default: '',
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value.',
      type: 'string',
      default: '',
    },
    label: {
      helperText: 'A label that describes the option that can be selected. e.g. "Country".',
      type: 'string',
      default: '',
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      type: 'string',
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      type: 'string',
      enum: ['outlined', 'filled', 'standard'],
      default: 'outlined',
    },
    size: {
      helperText: 'The size of the select. One of `small`, or `medium`.',
      type: 'string',
      enum: ['small', 'medium'],
      default: 'small',
    },
    fullWidth: {
      helperText: 'Whether the select should occupy all available horizontal space.',
      type: 'boolean',
    },
    disabled: {
      helperText: 'Whether the select is disabled.',
      type: 'boolean',
    },
    isRequired: {
      helperText: 'Whether the select is required to have a value.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the select value is invalid.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
