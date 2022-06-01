import { FieldError, FormState } from 'react-hook-form';

function errorMessage(error: FieldError) {
  if (error.message) {
    return error.message;
  }
  switch (error.type) {
    case 'required':
      return 'required';
    default:
      return 'invalid';
  }
}

export function validation<T>(
  formState: FormState<T>,
  field: keyof T,
): { error?: boolean; helperText?: string } {
  const error: FieldError = (formState.errors as any)[field];

  return {
    error: !!error,
    helperText: error ? errorMessage(error) : undefined,
  };
}
