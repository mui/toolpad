import * as React from 'react';
import { BindableAttrValue, PropValueType } from '@mui/toolpad-core';
import { WithControlledProp } from '../../../utils/types';
import { ActionEditor } from './ActionEditor';
import { BindingEditorDialog, BindingEditorDialogProps } from './BindingEditorDialog';

export interface PropBindingEditorDialogProps<V>
  extends Omit<BindingEditorDialogProps<V>, 'renderPropBindingEditor'> {}

export function PropBindingEditorDialog<V>(props: PropBindingEditorDialogProps<V>) {
  const renderPropBindingEditor = React.useCallback(
    (propType: PropValueType, controlProps: WithControlledProp<BindableAttrValue<V> | null>) => {
      if (propType?.type === 'event') {
        return <ActionEditor {...(controlProps || {})} />;
      }
      return null;
    },
    [],
  );

  return <BindingEditorDialog {...props} renderPropBindingEditor={renderPropBindingEditor} />;
}
