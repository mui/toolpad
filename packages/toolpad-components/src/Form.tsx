import * as React from 'react';
import { Container, ContainerProps, Box, Stack, BoxProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArgTypeDefinitions, createComponent, useNode } from '@mui/toolpad-core';
import { useForm, FieldValues, ValidationMode, FieldError, Controller } from 'react-hook-form';
import * as _ from 'lodash-es';
import { SX_PROP_HELPER_TEXT } from './constants.js';

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
  formControlsFullWidth?: boolean;
  submitButtonText?: string;
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
          <form onSubmit={form.handleSubmit(handleSubmit)} onReset={handleReset}>
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
                    type="reset"
                    color="secondary"
                    variant="contained"
                    sx={{ flex: formControlsFullWidth ? 1 : '0 1 auto' }}
                  >
                    Reset
                  </LoadingButton>
                ) : null}
                <LoadingButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  loading={form.formState.isSubmitting}
                  sx={{ flex: formControlsFullWidth ? 1 : '0 1 auto' }}
                >
                  {submitButtonText}
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

export default createComponent(Form, {
  argTypes: {
    children: {
      type: 'element',
      control: { type: 'layoutSlot' },
    },
    value: {
      helperText: 'The value that is controlled by this text input.',
      type: 'object',
      default: {},
      onChangeProp: 'onChange',
    },
    onSubmit: {
      helperText: 'Add logic to be executed when the user submits the form.',
      type: 'event',
    },
    formControlsAlign: {
      type: 'string',
      enum: ['start', 'center', 'end'],
      default: 'end',
      label: 'Form controls alignment',
      control: { type: 'HorizontalAlign' },
    },
    formControlsFullWidth: {
      helperText: 'Whether the form controls should occupy all available horizontal space.',
      type: 'boolean',
      default: false,
    },
    submitButtonText: {
      helperText: 'Submit button text.',
      type: 'string',
      default: 'Submit',
    },
    hasResetButton: {
      helperText: 'Show button to reset form values.',
      type: 'boolean',
      default: false,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});

export interface FormInputComponentProps {
  name: string;
  isRequired: boolean;
  minLength: number;
  maxLength: number;
  isInvalid: boolean;
}

interface FormInputProps<V> {
  name: string;
  label?: string;
  value?: V;
  onChange: (newValue: V) => void;
  emptyValue?: V;
  defaultValue?: V;
  validationProps: Partial<
    Pick<FormInputComponentProps, 'isRequired' | 'minLength' | 'maxLength' | 'isInvalid'>
  >;
  children: JSX.Element;
}

function FormInput<V>({
  name,
  label,
  value,
  onChange,
  emptyValue,
  defaultValue,
  validationProps,
  children,
}: FormInputProps<V>) {
  const { isRequired, minLength, maxLength, isInvalid } = validationProps;

  const { form, fieldValues } = React.useContext(FormContext);

  const formInputDisplayName = label || name || 'Field';

  const previousDefaultValueRef = React.useRef(defaultValue);
  React.useEffect(() => {
    if (form && defaultValue !== previousDefaultValueRef.current) {
      onChange(defaultValue as V);
      form.setValue(name, defaultValue);
      previousDefaultValueRef.current = defaultValue;
    }
  }, [form, onChange, defaultValue, name]);

  const isInitialForm = Object.keys(fieldValues).length === 0;

  React.useEffect(() => {
    if (form) {
      if (!fieldValues[name] && defaultValue && isInitialForm) {
        onChange((defaultValue || emptyValue) as V);
        form.setValue(name, defaultValue || emptyValue);
      } else if (value !== fieldValues[name]) {
        onChange(fieldValues[name] || emptyValue);
      }
    }
  }, [defaultValue, emptyValue, fieldValues, form, isInitialForm, name, onChange, value]);

  const previousInputNameRef = React.useRef<typeof name>(name);
  React.useEffect(() => {
    const previousInputName = previousInputNameRef.current;

    if (form && previousInputName !== name) {
      form.unregister(previousInputName);
      previousInputNameRef.current = name;
    }
  }, [form, name]);

  const previousManualValidationPropsRef = React.useRef(validationProps);
  React.useEffect(() => {
    if (
      form &&
      !_.isEqual(validationProps, previousManualValidationPropsRef.current) &&
      form.formState.dirtyFields[name]
    ) {
      form.trigger(name);
      previousManualValidationPropsRef.current = validationProps;
    }
  }, [form, name, validationProps]);

  return form ? (
    <Controller
      name={name}
      control={form.control}
      rules={{
        required: isRequired ? `${formInputDisplayName} is required.` : false,
        ...(minLength && {
          minLength: {
            value: minLength,
            message: `${formInputDisplayName} must have at least ${minLength} characters.`,
          },
        }),
        ...(maxLength && {
          maxLength: {
            value: maxLength,
            message: `${formInputDisplayName} must have no more than ${maxLength} characters.`,
          },
        }),
        validate: () => !isInvalid || `${formInputDisplayName} is invalid.`,
      }}
      render={() => children}
    />
  ) : (
    children
  );
}

interface UseFormInputPayload<V> {
  onFormInputChange: (newValue: V) => void;
  formInputError?: FieldError;
  renderFormInput: (element: JSX.Element) => JSX.Element;
}

export function useFormInput<V>(
  input: Omit<FormInputProps<V>, 'children'>,
): UseFormInputPayload<V> {
  const { form } = React.useContext(FormContext);

  const nodeRuntime = useNode();
  const fieldName = input.name || nodeRuntime?.nodeName;
  const fallbackName = React.useId();

  const formInputName = fieldName || fallbackName;

  const [componentFormValue, setComponentFormValue] = React.useState({});

  const formInputError = formInputName
    ? (form?.formState.errors[formInputName] as FieldError)
    : undefined;

  const handleFormInputChange = React.useCallback(
    (newValue: V) => {
      if (form) {
        form.setValue(formInputName, newValue, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      input.onChange(newValue);
    },
    [form, formInputName, input],
  );

  const renderFormInput = React.useCallback(
    (element: JSX.Element) => {
      const formInputElement = (
        <FormInput {...input} name={formInputName}>
          {element}
        </FormInput>
      );

      return form ? (
        formInputElement
      ) : (
        <Form
          value={componentFormValue}
          onChange={setComponentFormValue}
          mode="onBlur"
          hasChrome={false}
        >
          {formInputElement}
        </Form>
      );
    },
    [componentFormValue, form, formInputName, input],
  );

  return {
    onFormInputChange: handleFormInputChange,
    formInputError,
    renderFormInput,
  };
}

export const FORM_INPUT_ARG_TYPES: ArgTypeDefinitions<
  Pick<FormInputComponentProps, 'name' | 'isRequired' | 'minLength' | 'maxLength' | 'isInvalid'>
> = {
  name: {
    helperText: 'Name of this input. Used as a reference in form data.',
    type: 'string',
  },
  isRequired: {
    helperText: 'Whether the input is required to have a value.',
    type: 'boolean',
    default: false,
    category: 'validation',
  },
  minLength: {
    helperText: 'Minimum value length.',
    type: 'number',
    minimum: 0,
    maximum: 512,
    default: 0,
    category: 'validation',
  },
  maxLength: {
    helperText: 'Maximum value length.',
    type: 'number',
    minimum: 0,
    maximum: 512,
    default: 0,
    category: 'validation',
  },
  isInvalid: {
    helperText: 'Whether the input value is invalid.',
    type: 'boolean',
    default: false,
    category: 'validation',
  },
};
