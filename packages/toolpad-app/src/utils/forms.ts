import {
  DeepRequired,
  FieldError,
  FieldErrorsImpl,
  FieldPath,
  FieldValues,
  FormState,
  Merge,
} from 'react-hook-form';

function errorMessage<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  error: FieldError | Merge<FieldError, FieldErrorsImpl<DeepRequired<TFieldValues>[TFieldName]>>,
): string {
  if (error.message) {
    return String(error.message);
  }
  switch (error.type) {
    case 'required':
      return 'required';
    default:
      return 'invalid';
  }
}

/**
 * Translates `react-hook-form` `formState` into error/helpText properties for UI components.
 */
export function validation<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(formState: FormState<TFieldValues>, field: TFieldName): { error?: boolean; helperText?: string } {
  const error = formState.errors[field];

  return {
    error: !!error,
    helperText: error ? errorMessage(error) : undefined,
  };
}

/**
 * Reads `react-hook-form` `formState` and checks whether the state can and needs to be saved.
 */
export function isSaveDisabled<TFieldValues extends FieldValues>(
  formState: FormState<TFieldValues>,
): boolean {
  // Always destructure formState to trigger underlying react-hook-form Proxy object
  const { isValid, isDirty } = formState;
  return !isValid || !isDirty;
}
