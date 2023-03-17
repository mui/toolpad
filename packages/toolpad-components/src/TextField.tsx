import * as React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  BoxProps,
} from '@mui/material';
import { createComponent, useNode } from '@mui/toolpad-core';
import { FieldError } from 'react-hook-form';
import * as _ from 'lodash-es';
import { SX_PROP_HELPER_TEXT } from './constants';
import { FormContext, withComponentForm } from './Form';

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

  const nodeName = rest.name || nodeRuntime?.nodeName;

  const { form, fieldValues } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

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
        onChange(defaultValue || '');
        form.setValue(nodeName, defaultValue || '');
      } else if (value !== fieldValues[nodeName]) {
        onChange(fieldValues[nodeName] || '');
      }
    }
  }, [defaultValue, fieldValues, form, isInitialForm, nodeName, onChange, value]);

  const validationProps = React.useMemo(
    () => ({ isRequired, minLength, maxLength, isInvalid }),
    [isInvalid, isRequired, maxLength, minLength],
  );
  const previousManualValidationPropsRef = React.useRef(validationProps);
  React.useEffect(() => {
    if (form && !_.isEqual(validationProps, previousManualValidationPropsRef.current)) {
      form.trigger();
      previousManualValidationPropsRef.current = validationProps;
    }
  }, [form, validationProps]);

  return (
    <MuiTextField
      {...rest}
      {...(form && nodeName
        ? {
            ...form.register(nodeName, {
              required: isRequired ? `${nodeName} is required.` : false,
              minLength: minLength
                ? {
                    value: minLength,
                    message: `${nodeName} must have at least ${minLength} characters.`,
                  }
                : undefined,
              maxLength: maxLength
                ? {
                    value: maxLength,
                    message: `${nodeName} must have no more than ${maxLength} characters.`,
                  }
                : undefined,
              validate: () => !isInvalid || `${nodeName} is invalid.`,
            }),
            error: Boolean(fieldError),
            helperText: (fieldError as FieldError)?.message || '',
          }
        : { value, onChange: handleChange })}
    />
  );
}

const FormWrappedTextField = withComponentForm(TextField);

export default createComponent(FormWrappedTextField, {
  helperText: 'The TextField component lets you input a text value.',
  layoutDirection: 'both',
  argTypes: {
    value: {
      helperText: 'The value that is controlled by this text input.',
      typeDef: { type: 'string', default: '' },
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value for when the inoput is still empty.',
      typeDef: { type: 'string', default: '' },
    },
    label: {
      helperText: 'A label that describes the content of the text field. e.g. "First name".',
      typeDef: { type: 'string' },
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'], default: 'outlined' },
    },
    size: {
      helperText: 'The size of the input. One of `small`, or `medium`.',
      typeDef: { type: 'string', enum: ['small', 'medium'], default: 'small' },
    },
    fullWidth: {
      helperText: 'Whether the input should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'Whether the input is disabled.',
      typeDef: { type: 'boolean' },
    },
    isRequired: {
      helperText: 'Whether the input is required to have a value.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    minLength: {
      helperText: 'Minimum value length.',
      typeDef: { type: 'number', minimum: 0, maximum: 512, default: 0 },
      category: 'validation',
    },
    maxLength: {
      helperText: 'Maximum value length.',
      typeDef: { type: 'number', minimum: 0, maximum: 512, default: 0 },
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the input value is invalid.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
