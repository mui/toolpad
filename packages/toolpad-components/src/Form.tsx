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
  const methods = useForm({
    defaultValues: defaultValue,
    resolver: (values) => {
      onChange(values);

      return {};
    },
    mode: 'onChange',
  });

  // const values = methods.getValues();

  // React.useEffect(() => {
  //   onChange(values);
  //   console.log('new', values);
  // }, [values]);

  return (
    <MUIContainer disableGutters sx={sx} {...rest}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {children}

          <MUIContainer
            disableGutters
            sx={{
              borderTop: 'solid 1px',
              display: 'flex',
              justifyContent: 'end',
              width: '100%',
              mt: 1,
              pt: 1,
            }}
          >
            <Button type="submit" variant="contained">
              {submitLabel}
            </Button>
          </MUIContainer>
        </form>
      </FormProvider>
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
      helperText: 'The value that is controlled by this text input.',
      typeDef: { type: 'object' },
      onChangeProp: 'onChange',
      defaultValue: {},
    },
    defaultValue: {
      helperText: 'Set initial valus of form fields.',
      typeDef: { type: 'object' },
      defaultValue: {},
    },
    submitLabel: {
      label: 'Submit label',
      helperText: 'Submit button label.',
      typeDef: { type: 'string' },
      defaultValue: 'Submit',
    },
    onSubmit: {
      helperText: 'Add logic to be executed when the user submits the form.',
      typeDef: { type: 'event' },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
      defaultValue: { padding: 1 },
    },
  },
});
