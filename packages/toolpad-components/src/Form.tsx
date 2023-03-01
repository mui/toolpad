import * as React from 'react';
import { Container, ContainerProps, Box, Button } from '@mui/material';
import { createComponent } from '@mui/toolpad-core';
import { useForm, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { SX_PROP_HELPER_TEXT } from './constants';

export const FormContext = React.createContext<ReturnType<typeof useForm> | null>(null);

interface FormProps extends ContainerProps {
  validationSchema: Yup.AnyObjectSchema;
  onSubmit: (data: FieldValues) => unknown | Promise<unknown>;
}

function Form({ children, onSubmit, validationSchema, sx, ...rest }: FormProps) {
  const form = useForm({
    resolver: yupResolver(validationSchema),
  });

  const handleSubmit = React.useCallback(
    (data: Record<string, unknown>) => {
      onSubmit(data);
    },
    [onSubmit],
  );

  return (
    <Container disableGutters sx={sx} {...rest}>
      <FormContext.Provider value={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {children}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', pt: 1 }}>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Box>
        </form>
      </FormContext.Provider>
    </Container>
  );
}

export default createComponent(Form, {
  argTypes: {
    children: {
      typeDef: { type: 'element' },
      control: { type: 'layoutSlot' },
    },
    validationSchema: {
      helperText: 'Form [Yup](https://www.npmjs.com/package/yup) validation schema.',
      typeDef: { type: 'object', default: Yup.object({}) },
    },
    onSubmit: {
      helperText: 'Add logic to be executed when the user submits the form.',
      typeDef: { type: 'event' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
