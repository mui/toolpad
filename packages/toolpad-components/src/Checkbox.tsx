import { createComponent } from '@mui/toolpad-core';
import * as React from 'react';
import {
  FormControlLabel,
  FormGroup,
  Checkbox as MuiCheckbox,
  FormHelperText,
  FormControl,
} from '@mui/material';
import type { CheckboxProps as MuiCheckBocProps } from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { SX_PROP_HELPER_TEXT } from './constants';
import {
  FormInputComponentProps,
  useFormInput,
  withComponentForm,
  FORM_INPUT_ARG_TYPES,
} from './Form';

export type CheckboxProps = Omit<FormControlLabelProps, 'control' | 'onChange'> &
  Omit<MuiCheckBocProps, 'onChange'> & {
    onChange: (newValue: boolean) => void;
    label?: string;
    defaultValue: string;
    fullWidth: boolean;
  } & Pick<FormInputComponentProps, 'name' | 'isRequired' | 'isInvalid'>;

function Checkbox({ ...rest }: CheckboxProps) {
  rest.checked = rest.checked ?? false;
  const { onFormInputChange, renderFormInput, formInputError } = useFormInput<boolean>({
    name: rest.name,
    label: rest.label,
    onChange: rest.onChange,
    validationProps: { isRequired: rest.isRequired, isInvalid: rest.isInvalid },
  });

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;
      onFormInputChange(newValue);
    },
    [onFormInputChange],
  );

  const renderedOptions = React.useMemo(
    () => (
      <FormControl error={Boolean(formInputError)} fullWidth={rest.fullWidth}>
        <FormGroup>
          <FormControlLabel
            label={rest.label}
            checked={rest.checked}
            labelPlacement={rest.labelPlacement}
            componentsProps={rest.componentsProps}
            control={
              <MuiCheckbox
                required={rest.isRequired}
                size={rest.size}
                onChange={handleChange}
                defaultChecked={rest.defaultChecked}
                disabled={rest.disabled}
                color={rest.color}
                sx={rest.sx}
              />
            }
          />
        </FormGroup>
        <FormHelperText>{formInputError?.message || ''}</FormHelperText>
      </FormControl>
    ),
    [rest, handleChange, formInputError],
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
      defaultValueProp: 'defaultChecked',
    },
    color: {
      helperText:
        'The color of the component. It supports both default and custom theme colors, which can be added as shown in the palette customization guide.',
      type: 'string',
      enum: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
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
    fullWidth: {
      helperText: 'Whether the select should occupy all available horizontal space.',
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
    ...FORM_INPUT_ARG_TYPES,
  },
});
