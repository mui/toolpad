import * as React from 'react';
import { Container as MUIContainer, ContainerProps, Button } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { useForm, FormProvider } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';

type FormValue = Record<string, string>;

interface Props extends ContainerProps {
  onSubmit: (values: any) => void;
  submitLabel: string;
  value: FormValue;
  onChange: (value: FormValue) => void;
  defaultValue: Record<string, any>;
}

function Form({
  children,
  onSubmit = () => {},
  onChange,
  submitLabel,
  sx,
  value,
  defaultValue,
  ...rest
}: Props) {
  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(value);
  };

  return (
    <MUIContainer disableGutters sx={sx} {...rest}>
      <form onSubmit={handleSubmit}>{children}</form>
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
