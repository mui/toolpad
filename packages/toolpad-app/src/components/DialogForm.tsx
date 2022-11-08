import * as React from 'react';
import { styled } from '@mui/material';

const StyledDialogForm = styled('form')({
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

export interface DialogFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export default function DialogForm({ children, onKeyDown = () => {}, ...rest }: DialogFormProps) {
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const modifierKey = (event.metaKey || event.ctrlKey) && !event.shiftKey;

      if (event.key === 'Enter' && modifierKey) {
        const submitButton: HTMLButtonElement | null =
          event.currentTarget.querySelector('[type="submit"]');

        if (submitButton) {
          submitButton.click();
        }
      }

      onKeyDown(event);
    },
    [onKeyDown],
  );

  return (
    <StyledDialogForm onKeyDown={handleKeyDown} {...rest}>
      {children}
    </StyledDialogForm>
  );
}
