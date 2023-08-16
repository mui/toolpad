import { createComponent } from '@mui/toolpad-core';
import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiCheckbox from '@mui/material/Checkbox';
import type { CheckboxProps } from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { SX_PROP_HELPER_TEXT } from './constants';

export type FormControlLabelOptions = Omit<FormControlLabelProps, 'control'> & CheckboxProps;

function Checkbox({ disableRipple, ...rest }: FormControlLabelOptions) {
  return (
    <FormGroup>
      <FormControlLabel control={<MuiCheckbox disableRipple />} {...rest} />
    </FormGroup>
  );
}
export default createComponent(Checkbox, {
  layoutDirection: 'both',
  loadingProp: 'checked',
  argTypes: {
    onChange: {
      helperText: 'Add logic to be executed when the user clicks the button.',
      type: 'event',
    },
    label: {
      helperText: 'A text or an element to be used in an enclosing label element.',
      type: 'string',
      default: 'Checkbox',
    },
    checked: {
      helperText: 'If true, the component is checked.',
      type: 'boolean',
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
