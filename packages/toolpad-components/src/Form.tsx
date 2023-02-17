import * as React from 'react';
import { Container as MUIContainer, ContainerProps } from '@mui/material';
import { createComponent, FormValues, FormValuesType, SetFormField } from '@mui/toolpad-core';
import { SX_PROP_HELPER_TEXT } from './constants';

interface Props extends ContainerProps {
  onSubmit: (values: any) => void;
  submitLabel: string;
  value: FormValuesType;
  onChange: (value: FormValuesType) => void;
}

function Form({ children, onSubmit = () => {}, onChange, submitLabel, sx, value, ...rest }: Props) {
  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    onSubmit(value);
  };

  const formSetter = React.useCallback(
    (formValue: FormValuesType) => {
      return (fieldName: string, fieldValue: string) => {
        onChange({
          ...formValue,
          [fieldName]: fieldValue,
        });
      };
    },
    [onChange],
  );

  return (
    <MUIContainer disableGutters sx={sx} {...rest}>
      <FormValues.Provider value={value}>
        <SetFormField.Provider value={formSetter(value)}>
          <form onSubmit={handleSubmit}>{children}</form>
        </SetFormField.Provider>
      </FormValues.Provider>
    </MUIContainer>
  );
}

export default createComponent(Form, {
  argTypes: {
    children: {
      visible: false,
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    value: {
      visible: false,
      typeDef: { type: 'object', default: {} },
      onChangeProp: 'onChange',
      // TODO: why - Type 'string' is not assignable to type 'FormValuesType'.
      defaultValueProp: 'defaultValue',
    },
    defaultValue: {
      helperText: 'A default value for when the inoput is still empty.',
      typeDef: { type: 'object', default: {} },
    },
    onSubmit: {
      helperText: 'Add logic to be executed when the user submits the form.',
      typeDef: { type: 'event' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: {
        type: 'object',
        default: {
          padding: 1,
          border: 'solid 1px #007FFF',
        },
      },
    },
  },
});
