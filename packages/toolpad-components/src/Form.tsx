import * as React from 'react';
import { Container, ContainerProps, Box, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';
import { useForm, FieldValues, RegisterOptions } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';

type FormValidationRules = Record<
  string,
  Pick<
    RegisterOptions<FieldValues>,
    'required' | 'min' | 'max' | 'maxLength' | 'minLength' | 'pattern'
  >
>;

export const FormContext = React.createContext<{
  form: ReturnType<typeof useForm> | null;
  fieldValues: FieldValues;
  validationRules: FormValidationRules;
}>({
  form: null,
  fieldValues: {},
  validationRules: {},
});

interface FormProps extends ContainerProps {
  value: FieldValues;
  onChange: (newValue: FieldValues) => void;
  validationRules: FormValidationRules;
  onSubmit: (data?: FieldValues) => unknown | Promise<unknown>;
  hasResetButton: boolean;
}

function Form({
  children,
  value,
  onChange,
  onSubmit = () => {},
  validationRules,
  hasResetButton,
  sx,
  ...rest
}: FormProps) {
  const form = useForm();
  const { isSubmitSuccessful } = form.formState;

  const handleSubmit = React.useCallback(async () => {
    await onSubmit();
  }, [onSubmit]);

  // Reset form in effect as suggested in https://react-hook-form.com/api/useform/reset/
  React.useEffect(() => {
    form.reset();
  }, [form, isSubmitSuccessful]);

  // Set initial form values
  React.useEffect(() => {
    onChange(form.getValues());
  }, [form, onChange]);

  React.useEffect(() => {
    const formSubscription = form.watch((newValue) => {
      onChange(newValue);
    });
    return () => formSubscription.unsubscribe();
  }, [form, onChange]);

  const handleReset = React.useCallback(() => {
    form.reset();
  }, [form]);

  React.useEffect(() => {
    form.trigger();
  }, [form, validationRules]);

  const formContextValue = React.useMemo(
    () => ({ form, fieldValues: value, validationRules }),
    // form never changes so also use formState as dependency to update context when form state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, form.formState, validationRules, value],
  );

  return (
    <Container disableGutters sx={sx} {...rest}>
      <FormContext.Provider value={formContextValue}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {children}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', pt: 1 }}>
            <Stack direction="row" spacing={1}>
              {hasResetButton ? (
                <LoadingButton variant="contained" onClick={handleReset}>
                  Reset
                </LoadingButton>
              ) : null}
              <LoadingButton
                type="submit"
                variant="contained"
                loading={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Submitting…' : 'Submit'}
              </LoadingButton>
            </Stack>
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
    hasResetButton: {
      helperText: 'Show button to reset form values.',
      typeDef: { type: 'boolean', default: false },
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
