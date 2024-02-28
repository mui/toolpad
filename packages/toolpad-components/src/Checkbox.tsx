import { createComponent } from '@mui/toolpad-core';
import * as React from 'react';
import {
  FormControlLabel,
  FormGroup,
  Checkbox as MuiCheckbox,
  FormHelperText,
  FormControl,
  Typography as MuiTypography,
  Switch as MuiSwitch,
  SwitchProps,
} from '@mui/material';
import { errorFrom } from '@mui/toolpad-utils/errors';
import ErrorIcon from '@mui/icons-material/Error';
import type { CheckboxProps as MuiCheckBoxProps } from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import { SX_PROP_HELPER_TEXT } from './constants';
import {
  FormInputComponentProps,
  useFormInput,
  withComponentForm,
  FORM_INPUT_ARG_TYPES,
} from './Form';

interface ErrorDisplayProps {
  error: unknown;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  const errMessage = errorFrom(error).message;
  return (
    <MuiTypography sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      <ErrorIcon fontSize="small" color="error" />
      <span>{errMessage}</span>
    </MuiTypography>
  );
}
export type Props = Omit<FormControlLabelProps, 'control' | 'onChange'> &
  Omit<MuiCheckBoxProps, 'onChange'> & {
    onChange: (newValue: boolean) => void;
    label?: string;
    defaultValue: string;
    error?: unknown;
    fullWidth: boolean;
    mode: 'checkBox' | 'switch';
  } & Pick<FormInputComponentProps, 'name' | 'isRequired'> &
  SwitchProps;

function Checkbox({ ...rest }: Props) {
  rest.checked = rest.checked ?? false;
  const { onFormInputChange, renderFormInput, formInputError } = useFormInput<boolean>({
    name: rest.name,
    label: rest.label,
    onChange: rest.onChange,
    validationProps: { isRequired: rest.isRequired },
  });

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;
      onFormInputChange(newValue);
    },
    [onFormInputChange],
  );

  const renderedOptions = React.useMemo(() => {
    const props = {
      onChange: handleChange,
      required: rest.isRequired,
      size: rest.size,
      defaultChecked: rest.defaultChecked,
      disabled: rest.disabled,
      color: rest.color,
      sx: rest.sx,
      checked: rest.checked,
    };
    return (
      <FormControl error={Boolean(formInputError)} fullWidth={rest.fullWidth}>
        <FormGroup>
          <FormControlLabel
            label={rest.label}
            checked={rest.checked}
            labelPlacement={rest.labelPlacement}
            componentsProps={rest.componentsProps}
            control={
              rest.mode === 'checkBox' ? <MuiCheckbox {...props} /> : <MuiSwitch {...props} />
            }
          />
        </FormGroup>
        <FormHelperText>{formInputError?.message || ''}</FormHelperText>
      </FormControl>
    );
  }, [rest, formInputError, handleChange]);

  return renderFormInput(renderedOptions);
}

function Component(props: Props) {
  if (props.error) {
    return <ErrorDisplay error={props.error} />;
  }
  return <Checkbox {...props} />;
}

const FormWrappedCheckbox = withComponentForm(Component);
export default createComponent(FormWrappedCheckbox, {
  layoutDirection: 'both',
  loadingProp: 'checked',
  errorProp: 'error',
  argTypes: {
    mode: {
      helperText: 'Defines how the content is rendered. Either as plain CheckBox, Switch',
      type: 'string',
      enum: ['checkBox', 'switch'],
      enumLabels: {
        checkBox: 'CheckBox',
        switch: 'Switch',
      },
      default: 'checkBox',
      label: 'Mode',
      control: { type: 'ToggleButtons' },
    },
    label: {
      helperText: 'A text or an element to be used in an enclosing label element.',
      type: 'string',
      default: 'Label',
    },
    checked: {
      helperText: 'If true, the component is checked.',
      onChangeProp: 'onChange',
      type: 'boolean',
    },
    color: {
      helperText:
        'The color of the component. It supports both default and custom theme colors, which can be added as shown in the palette customization guide.',
      type: 'string',
      enum: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'],
      default: 'primary',
    },
    disabled: {
      helperText: 'If true, the component is disabled.',
      type: 'boolean',
      default: false,
    },

    size: {
      helperText:
        'The size of the component. small is equivalent to the dense checkbox, switch styling.',
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
      visible: ({ mode }: Props) => mode === 'checkBox',
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
