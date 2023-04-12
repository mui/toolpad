import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import { BindableAttrValue, PropValueType } from '@mui/toolpad-core';

import { tryFormatExpression } from '../../../utils/prettier';
import useShortcut from '../../../utils/useShortcut';
import useUnsavedChangesConfirm from '../../hooks/useUnsavedChangesConfirm';
import { WithControlledProp } from '../../../utils/types';
import { JsBindingEditor, useBindingEditorContext } from '.';

export interface BindingEditorDialogProps<V>
  extends WithControlledProp<BindableAttrValue<V> | null> {
  open: boolean;
  onClose: () => void;
  renderPropBindingEditor?: (
    propType: PropValueType,
    controlProps: WithControlledProp<BindableAttrValue<V> | null>,
  ) => JSX.Element | null;
}

export function BindingEditorDialog<V>({
  value,
  onChange,
  open,
  onClose,
  renderPropBindingEditor,
}: BindingEditorDialogProps<V>) {
  const { propType, label } = useBindingEditorContext();

  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    if (open) {
      setInput(value);
    }
  }, [open, value]);

  const committedInput = React.useRef<BindableAttrValue<V> | null>(input);

  const handleSave = React.useCallback(() => {
    let newValue = input;

    if (input?.type === 'jsExpression') {
      newValue = {
        ...input,
        value: tryFormatExpression(input.value),
      };
    }

    committedInput.current = newValue;
    onChange(newValue);
  }, [onChange, input]);

  const hasUnsavedChanges = input
    ? input.type !== committedInput.current?.type || input.value !== committedInput.current?.value
    : false;

  const { handleCloseWithUnsavedChanges } = useUnsavedChangesConfirm({
    hasUnsavedChanges,
    onClose,
  });

  const handleCommit = React.useCallback(() => {
    handleSave();
    onClose();
  }, [onClose, handleSave]);

  const handleRemove = React.useCallback(() => {
    onChange(null);
    onClose();
  }, [onClose, onChange]);

  useShortcut({ key: 's', metaKey: true, disabled: !open }, handleSave);

  const propBindingEditor =
    renderPropBindingEditor &&
    propType &&
    renderPropBindingEditor(propType, {
      value: input,
      onChange: (newValue) => setInput(newValue),
    });

  return (
    <Dialog
      onClose={handleCloseWithUnsavedChanges}
      open={open}
      fullWidth
      scroll="body"
      maxWidth="lg"
    >
      <DialogTitle>Bind property &quot;{label}&quot;</DialogTitle>
      <DialogContent>
        {propBindingEditor || (
          <JsBindingEditor
            value={input?.type === 'jsExpression' ? input : null}
            onChange={(newValue) => setInput(newValue)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          {hasUnsavedChanges ? 'Cancel' : 'Close'}
        </Button>
        <Button color="inherit" disabled={!value} onClick={handleRemove}>
          Remove binding
        </Button>
        <Button disabled={!hasUnsavedChanges} color="primary" onClick={handleCommit}>
          Update binding
        </Button>
      </DialogActions>
    </Dialog>
  );
}
