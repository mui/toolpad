import * as React from 'react';
import { TextFieldProps, MenuItem, TextField } from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError, Controller } from 'react-hook-form';
import * as _ from 'lodash-es';
import { SX_PROP_HELPER_TEXT } from './constants';
import { FormContext, withComponentForm } from './Form';

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

  const nodeName = rest.name || nodeRuntime?.nodeName;

  const { form, fieldValues } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const id = React.useId();

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (form && nodeName) {
        form.setValue(nodeName, newValue);
      } else {
        onChange(newValue);
      }
    },
    [form, nodeName, onChange],
  );

  const previousDefaultValueRef = React.useRef(defaultValue);
  React.useEffect(() => {
    if (form && nodeName && defaultValue !== previousDefaultValueRef.current) {
      if (form && nodeName) {
        form.setValue(nodeName, defaultValue);
      }
      previousDefaultValueRef.current = defaultValue;
    }
  }, [form, nodeName, onChange, defaultValue]);

  const isInitialForm = Object.keys(fieldValues).length === 0;

  React.useEffect(() => {
    if (form && nodeName) {
      if (!fieldValues[nodeName] && defaultValue && isInitialForm) {
        onChange(defaultValue);
        form.setValue(nodeName, defaultValue);
      } else if (value !== fieldValues[nodeName]) {
        onChange(fieldValues[nodeName]);
      }
    }
  }, [defaultValue, fieldValues, form, isInitialForm, nodeName, onChange, value]);

  const validationProps = React.useMemo(() => ({ isRequired, isInvalid }), [isInvalid, isRequired]);
  const previousManualValidationPropsRef = React.useRef(validationProps);
  React.useEffect(() => {
    if (form && !_.isEqual(validationProps, previousManualValidationPropsRef.current)) {
      form.trigger();
      previousManualValidationPropsRef.current = validationProps;
    }
  }, [form, validationProps]);

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

  const selectProps = {
    ...rest,
    value,
    onChange: handleChange,
    defaultValue,
    select: true,
    sx: { ...(!fullWidth && !value ? { width: 120 } : {}), ...sx },
    fullWidth: true,
    ...(form && {
      error: Boolean(fieldError),
      helperText: (fieldError as FieldError)?.message || '',
    }),
  };

  const selectElement = <TextField {...selectProps}>{renderedOptions}</TextField>;

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={{
        required: isRequired ? `${nodeName} is required.` : false,
        validate: () => !isInvalid || `${nodeName} is invalid.`,
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
    isRequired: {
      helperText: 'Whether the select is required to have a value.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the select value is invalid.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
