import React from 'react';

interface UseEditorUnsavedChangesConfirmInput {
  hasUnsavedChanges: boolean;
  onClose: (...args: unknown[]) => void | Promise<void>;
}

interface UseEditorUnsavedChangesConfirmPayload {
  handleCloseWithoutCheck: (...args: unknown[]) => void | Promise<void>;
  handleCloseWithCheck: (...args: unknown[]) => void | Promise<void>;
}

export default function useEditorUnsavedChangesConfirm({
  hasUnsavedChanges,
  onClose,
}: UseEditorUnsavedChangesConfirmInput): UseEditorUnsavedChangesConfirmPayload {
  const handleClose = React.useCallback(
    (skipUnsavedChangesCheck: boolean) => () => {
      if (hasUnsavedChanges && !skipUnsavedChangesCheck) {
        // eslint-disable-next-line no-alert
        const ok = window.confirm(
          'You have unsaved changes. Are you sure you want to navigate away?\nAll changes will be discarded.',
        );

        if (!ok) {
          return;
        }
      }

      onClose();
    },
    [hasUnsavedChanges, onClose],
  );

  const handleCloseWithoutCheck = React.useMemo(() => handleClose(true), [handleClose]);
  const handleCloseWithCheck = React.useMemo(() => handleClose(false), [handleClose]);

  return { handleCloseWithoutCheck, handleCloseWithCheck };
}
