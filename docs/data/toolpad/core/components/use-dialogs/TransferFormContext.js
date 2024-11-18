import * as React from 'react';

// Create context with initial value
export const FormContext = React.createContext(null);

// Custom hook to use the form context
export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
