import * as React from 'react';
import { Container, ContainerProps, Box, Stack, BoxProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createComponent } from '@mui/toolpad-core';
import { useForm, FieldValues, ValidationMode } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';

export const FormContext = React.createContext<{
  form: ReturnType<typeof useForm> | null;
  fieldValues: FieldValues;
}>({
  form: null,
  fieldValues: {},
});

interface FormProps extends ContainerProps {
  value: FieldValues;
  onChange: (newValue: FieldValues) => void;
  onSubmit?: (data?: FieldValues) => unknown | Promise<unknown>;
  formControlsAlign?: BoxProps['justifyContent'];
  formControlsFullWidth: boolean;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
  hasResetButton?: boolean;
  mode?: keyof ValidationMode | undefined;
  hasChrome?: boolean;
}

function Form({
  children,
  value,
  onChange,
  onSubmit = () => {},
  hasResetButton = false,
  formControlsAlign = 'end',
  formControlsFullWidth,
  submitButtonText = 'Submit',
  submitButtonLoadingText = 'Submitting…',
  mode = 'onSubmit',
  hasChrome = true,
  sx,
  ...rest
}: FormProps) {
  const form = useForm({ mode });
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

  const formContextValue = React.useMemo(
    () => ({ form, fieldValues: value }),
    // form never changes so also use formState as dependency to update context when form state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, form.formState, value],
  );

  return (
    <FormContext.Provider value={formContextValue}>
      {hasChrome ? (
        <Container disableGutters sx={sx} {...rest}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {children}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: formControlsAlign,
                pt: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ flex: formControlsFullWidth ? 1 : '0 1 auto' }}
              >
                {hasResetButton ? (
                  <LoadingButton
                    variant="contained"
                    onClick={handleReset}
                    sx={{ flex: formControlsFullWidth ? 1 : '0 1 auto' }}
                  >
                    Reset
                  </LoadingButton>
                ) : null}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={form.formState.isSubmitting}
                  sx={{ flex: formControlsFullWidth ? 1 : '0 1 auto' }}
                >
                  {form.formState.isSubmitting ? submitButtonLoadingText : submitButtonText}
                </LoadingButton>
              </Stack>
            </Box>
          </form>
        </Container>
      ) : (
        children
      )}
    </FormContext.Provider>
  );
}

export function withComponentForm<P extends Record<string, any>>(
  InputComponent: React.ComponentType<P>,
) {
  return function ComponentWithForm(props: P) {
    const { form } = React.useContext(FormContext);

    const [componentFormValue, setComponentFormValue] = React.useState({});

    const inputElement = <InputComponent {...props} />;

    return form ? (
      inputElement
    ) : (
      <Form
        value={componentFormValue}
        onChange={setComponentFormValue}
        mode="onBlur"
        hasChrome={false}
      >
        {inputElement}
      </Form>
    );
  };
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
    onSubmit: {
      helperText: 'Add logic to be executed when the user submits the form.',
      typeDef: { type: 'event' },
    },
    formControlsAlign: {
      typeDef: {
        type: 'string',
        enum: ['start', 'center', 'end'],
        default: 'end',
      },
      label: 'Form controls alignment',
      control: { type: 'HorizontalAlign' },
    },
    formControlsFullWidth: {
      helperText: 'Whether the form controls should occupy all available horizontal space.',
      typeDef: { type: 'boolean', default: false },
    },
    submitButtonText: {
      helperText: 'Submit button text.',
      typeDef: { type: 'string', default: 'Submit' },
    },
    submitButtonLoadingText: {
      helperText: 'Submit button text while submitting form.',
      typeDef: { type: 'string', default: 'Submitting…' },
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
