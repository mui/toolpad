import * as React from 'react';
import {
  BindableAttrValue,
  JsRuntime,
  LiveBinding,
  PropValueType,
  ScopeMeta,
} from '@mui/toolpad-core';
import { WithControlledProp } from '../../../utils/types';
import { ActionEditor } from './ActionEditor';
import { BindingEditorDialog, BindingEditorDialogProps } from './BindingEditorDialog';

export interface PropBindingEditorDialogProps<V>
  extends Omit<BindingEditorDialogProps<V>, 'renderPropBindingEditor'> {
  globalScope: Record<string, unknown>;
  globalScopeMeta: ScopeMeta;
  jsRuntime: JsRuntime;
  liveBinding?: LiveBinding;
}

export function PropBindingEditorDialog<V>({
  globalScope,
  globalScopeMeta,
  jsRuntime,
  liveBinding,
  ...rest
}: PropBindingEditorDialogProps<V>) {
  const renderPropBindingEditor = React.useCallback(
    (propType: PropValueType, controlProps: WithControlledProp<BindableAttrValue<V> | null>) => {
      if (propType?.type === 'event') {
        return (
          <ActionEditor
            {...(controlProps || {})}
            globalScope={globalScope}
            globalScopeMeta={globalScopeMeta}
            jsRuntime={jsRuntime}
            liveBinding={liveBinding}
          />
        );
      }
      return null;
    },
    [globalScope, globalScopeMeta, jsRuntime, liveBinding],
  );

  return <BindingEditorDialog {...rest} renderPropBindingEditor={renderPropBindingEditor} />;
}
