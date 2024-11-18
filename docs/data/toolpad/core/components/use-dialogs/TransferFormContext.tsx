import * as React from 'react';

export interface TransferFormData {
  amount: string;
  accountNumber: string;
  // USA specific
  routingNumber?: string;
  accountType?: 'checking' | 'savings';
  // India specific
  ifscCode?: string;
}

// Create context with initial value
export const FormContext = React.createContext<{
  formData: TransferFormData;
  setFormData: (data: TransferFormData) => void;
} | null>(null);

// Custom hook to use the form context
export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
