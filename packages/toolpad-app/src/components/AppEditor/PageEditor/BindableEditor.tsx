import { Alert, Stack } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/toolpad-core';
import propertyControls from '../../propertyControls';
import { BindingEditor } from '../BindingEditor';
import { NodeId, BindableAttrValue } from '../../../types';
import { WithControlledProp } from '../../../utils/types';
import { usePageEditorState } from './PageEditorProvider';

function getDefaultControl(typeDef: PropValueType): ArgControlSpec | null {
  switch (typeDef.type) {
    case 'string':
      return typeDef.enum ? { type: 'select' } : { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'object':
      return { type: 'json' };
    case 'array':
      return { type: 'json' };
    default:
      return null;
  }
}

export interface BindableEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  propNamespace: string | null;
  propName: string;
  nodeId: NodeId;
  argType: ArgTypeDefinition;
}

export default function BindableEditor<V>({
  propNamespace,
  propName,
  nodeId,
  argType,
  value,
  onChange,
}: BindableEditorProps<V>) {
  const handlePropConstChange = React.useCallback(
    (newValue: V) => onChange({ type: 'const', value: newValue }),
    [onChange],
  );

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isBindable = !argType.onChangeHandler;

  const controlSpec = argType.control ?? getDefaultControl(argType.typeDef);
  const control = controlSpec ? propertyControls[controlSpec.type] : null;

  const bindingId = `${nodeId}${propNamespace ? `.${propNamespace}` : ''}.${propName}`;
  const { viewState } = usePageEditorState();
  const liveBinding = viewState.bindings[bindingId];
  const globalScope = viewState.pageState;

  const initConstValue = React.useCallback(() => {
    if (value?.type === 'const') {
      return value.value;
    }

    return liveBinding?.value;
  }, [liveBinding, value]);

  const constValue = React.useMemo(initConstValue, [value, initConstValue]);

  const hasBinding = value && value.type !== 'const';

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
      {control ? (
        <React.Fragment>
          <control.Editor
            nodeId={nodeId}
            propName={propName}
            label={argType.label || propName}
            argType={argType}
            disabled={!!hasBinding}
            value={constValue}
            onChange={handlePropConstChange}
          />
          <BindingEditor<V>
            globalScope={globalScope}
            liveBinding={liveBinding}
            propType={argType.typeDef}
            value={value}
            onChange={onChange}
            disabled={!isBindable}
          />
        </React.Fragment>
      ) : (
        <Alert severity="warning">
          {`No control for property '${propName}' (type '${argType.typeDef.type}' ${
            argType.control ? `, control: '${argType.control.type}'` : ''
          })`}
        </Alert>
      )}
    </Stack>
  );
}
