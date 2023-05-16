import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  BoxProps,
} from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError, Controller } from 'react-hook-form';
import { FormContext, useFormInput, withComponentForm } from './Form.js';
import { SX_PROP_HELPER_TEXT } from './constants.js';

export type TextFieldProps = Omit<MuiTextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (newValue: string) => void;
  defaultValue: string;
  alignItems?: BoxProps['alignItems'];
  justifyContent?: BoxProps['justifyContent'];
  name: string;
  isRequired: boolean;
  minLength: number;
  maxLength: number;
  isInvalid: boolean;
};

function TextField({
  defaultValue,
  onChange,
  value,
  isRequired,
  minLength,
  maxLength,
  isInvalid,
  ...rest
}: TextFieldProps) {
  const nodeRuntime = useNode();

  const fieldName = rest.name || nodeRuntime?.nodeName;

  const fallbackName = React.useId();
  const nodeName = fieldName || fallbackName;

  const { form } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const validationProps = React.useMemo(
    () => ({ isRequired, minLength, maxLength, isInvalid }),
    [isInvalid, isRequired, maxLength, minLength],
  );

  const { onFormInputChange } = useFormInput<string>({
    name: nodeName,
    value,
    onChange,
    emptyValue: '',
    defaultValue,
    validationProps,
  });

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

  const textFieldElement = (
    <MuiTextField
      {...rest}
      value={value}
      onChange={handleChange}
      {...(form && {
        error: Boolean(fieldError),
        helperText: (fieldError as FieldError)?.message || '',
      })}
    />
  );

  const fieldDisplayName = rest.label || fieldName || 'Field';

  return form && nodeName ? (
    <Controller
      name={nodeName}
      control={form.control}
      rules={{
        required: isRequired ? `${fieldDisplayName} is required.` : false,
        minLength: minLength
          ? {
              value: minLength,
              message: `${fieldDisplayName} must have at least ${minLength} characters.`,
            }
          : undefined,
        maxLength: maxLength
          ? {
              value: maxLength,
              message: `${fieldDisplayName} must have no more than ${maxLength} characters.`,
            }
          : undefined,
        validate: () => !isInvalid || `${fieldDisplayName} is invalid.`,
      }}
      render={() => textFieldElement}
    />
  ) : (
    textFieldElement
  );
}

const FormWrappedTextField = withComponentForm(TextField);

export default createComponent(FormWrappedTextField, {
  helperText: 'The TextField component lets you input a text value.',
  layoutDirection: 'both',
  argTypes: {
    value: {
      helperText: 'The value that is controlled by this text input.',
      type: 'string',
      default: '',
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value for when the input is still empty.',
      type: 'string',
      default: '',
    },
    label: {
      helperText: 'A label that describes the content of the text field. e.g. "First name".',
      type: 'string',
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
      helperText: 'The size of the input. One of `small`, or `medium`.',
      type: 'string',
      enum: ['small', 'medium'],
      default: 'small',
    },
    fullWidth: {
      helperText: 'Whether the input should occupy all available horizontal space.',
      type: 'boolean',
    },
    disabled: {
      helperText: 'Whether the input is disabled.',
      type: 'boolean',
    },
    isRequired: {
      helperText: 'Whether the input is required to have a value.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    minLength: {
      helperText: 'Minimum value length.',
      type: 'number',
      minimum: 0,
      maximum: 512,
      default: 0,
      category: 'validation',
    },
    maxLength: {
      helperText: 'Maximum value length.',
      type: 'number',
      minimum: 0,
      maximum: 512,
      default: 0,
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the input value is invalid.',
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
