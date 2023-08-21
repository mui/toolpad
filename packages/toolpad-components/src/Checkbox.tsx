import { createComponent } from '@mui/toolpad-core';
import * as React from 'react';
import {
  FormControlLabel,
  FormGroup,
  Checkbox as MuiCheckbox,
  TextField,
  TextFieldProps,
} from '@mui/material';
import type { CheckboxProps } from '@mui/material/Checkbox';
import { pink } from '@mui/material/colors';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { SX_PROP_HELPER_TEXT } from './constants';
import { FormInputComponentProps, useFormInput, withComponentForm } from './Form';

export type FormControlLabelOptions = { onChange: (newValue: string) => void } & Omit<
  FormControlLabelProps,
  'control'
> &
  Omit<CheckboxProps, 'onChange'> &
  Pick<FormInputComponentProps, 'name' | 'isRequired' | 'isInvalid'>;

function Checkbox({ ...rest }: FormControlLabelOptions) {
  rest.checked = rest.checked ?? false;
  const { onFormInputChange, renderFormInput, formInputError } = useFormInput<boolean>({
    name: 'Checkbox',
    label: 'Checkbox',
    onChange: rest.onChange,
    validationProps: { isRequired: rest.isRequired, isInvalid: rest.isInvalid },
  });

  console.log(rest);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;
      onFormInputChange(newValue);
    },
    [onFormInputChange],
  );

  const renderedOptions = React.useMemo(
    () => (
      <FormControlLabel
        label={rest.label}
        checked={rest.checked}
        control={
          <MuiCheckbox
            disableRipple
            onChange={handleChange}
            sx={{
              color: pink[800],
              '&.Mui-checked': {
                color: pink[600],
              },
            }}
          />
        }
      />
    ),
    [rest],
  );

  return renderFormInput(renderedOptions);
}

const FormWrappedCheckbox = withComponentForm(Checkbox);
export default createComponent(FormWrappedCheckbox, {
  layoutDirection: 'both',
  loadingProp: 'checked',
  argTypes: {
    label: {
      helperText: 'A text or an element to be used in an enclosing label element.',
      type: 'string',
      default: 'Checkbox',
    },
    checked: {
      helperText: 'If true, the component is checked.',
      onChangeProp: 'onChange',
      type: 'boolean',
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value.',
      type: 'boolean',
      default: false,
    },
    color: {
      helperText:
        'The color of the component. It supports both default and custom theme colors, which can be added as shown in the palette customization guide.',
      type: 'string',
      enum: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning', 'string'],
      default: 'primary',
    },
    defaultChecked: {
      helperText: 'The default checked state. Use when the component is not controlled.',
      type: 'boolean',
    },
    disabled: {
      helperText: 'If true, the component is disabled.',
      type: 'boolean',
      default: false,
    },
    disableRipple: {
      helperText: 'If true, the ripple effect is disabled.',
      type: 'boolean',
      default: false,
    },
    required: {
      helperText: 'If true, the input element is required.',
      type: 'boolean',
      default: false,
    },
    size: {
      helperText: 'The size of the component. small is equivalent to the dense checkbox styling.',
      type: 'string',
      enum: ['medium', 'small', 'string'],
      default: 'medium',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
    disableTypography: {
      helperText:
        'If true, the label is rendered as it is passed without an additional typography node.',
      type: 'boolean',
    },
    componentsProps: {
      helperText: 'The props used for each slot inside.',
      type: 'object',
    },
    labelPlacement: {
      helperText: 'The position of the label.',
      type: 'string',
      enum: ['bottom', 'end', 'start', 'top'],
      default: 'end',
    },
  },
});
