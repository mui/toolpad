import * as React from 'react';
import { Container, ContainerProps, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';
import { useForm, FieldValues, RegisterOptions } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';

type FormValidationRules = Record<
  string,
  Pick<RegisterOptions<FieldValues>, 'required' | 'min' | 'max' | 'maxLength' | 'minLength'>
>;

export const FormContext = React.createContext<{
  form: ReturnType<typeof useForm> | null;
  validationRules: FormValidationRules;
}>({
  form: null,
  validationRules: {},
});

interface FormProps extends ContainerProps {
  value: FieldValues;
  onChange: (newValue: FieldValues) => void;
  validationRules: FormValidationRules;
  onSubmit: (data?: FieldValues) => unknown | Promise<unknown>;
}

function Form({ children, onChange, onSubmit, validationRules, sx, ...rest }: FormProps) {
  const form = useForm();

  const handleSubmit = React.useCallback(async () => {
    await onSubmit();
  }, [onSubmit]);

  // Set initial form values
  React.useEffect(() => {
    onChange(form.getValues());
  }, [form, onChange]);

  React.useEffect(() => {
    const formSubscription = form.watch((value) => {
      onChange(value);
    });
    return () => formSubscription.unsubscribe();
  }, [form, onChange]);

  const formContextValue = React.useMemo(
    () => ({ form, validationRules }),
    [form, validationRules],
  );

  return (
    <Container disableGutters sx={sx} {...rest}>
      <FormContext.Provider value={formContextValue}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {children}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', pt: 1 }}>
            <LoadingButton type="submit" variant="contained">
              Submit
            </LoadingButton>
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
    value: {
      helperText: 'The value that is controlled by this text input.',
      typeDef: { type: 'object', default: {} },
      onChangeProp: 'onChange',
    },
    validationRules: {
      helperText: 'Validation rules for form fields.',
      typeDef: { type: 'object', default: {} },
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
