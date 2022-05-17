import { Alert, Stack } from '@mui/material';
import * as React from 'react';
import {
  BindableAttrValue,
  ArgTypeDefinition,
  ArgControlSpec,
  PropValueType,
  LiveBinding,
} from '@mui/toolpad-core';
import propertyControls from '../../propertyControls';
import { BindingEditor } from '../BindingEditor';
import { NodeId } from '../../../types';
import { WithControlledProp } from '../../../utils/types';

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
    case 'function':
      return { type: 'function' };
    default:
      return null;
  }
}

export interface BindableEditorProps<V> extends WithControlledProp<BindableAttrValue<V> | null> {
  label: string;
  nodeId?: NodeId;
  server?: boolean;
  argType: ArgTypeDefinition;
  liveBinding?: LiveBinding;
  globalScope?: Record<string, unknown>;
}

export default function BindableEditor<V>({
  label: labelProp,
  nodeId,
  argType,
  value,
  server,
  onChange,
  liveBinding,
  globalScope = {},
}: BindableEditorProps<V>) {
  const handlePropConstChange = React.useCallback(
    (newValue: V) => onChange({ type: 'const', value: newValue }),
    [onChange],
  );

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isBindable = !argType.onChangeHandler;

  const controlSpec = argType.control ?? getDefaultControl(argType.typeDef);
  const Control = controlSpec ? propertyControls[controlSpec.type] : null;

  const initConstValue = React.useCallback(() => {
    if (value?.type === 'const') {
      return value.value;
    }

    return liveBinding?.value;
  }, [liveBinding, value]);

  const constValue = React.useMemo(initConstValue, [value, initConstValue]);

  const hasBinding = value && value.type !== 'const';

  const label = argType.label || labelProp || '';

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {Control ? (
        <React.Fragment>
          <Control
            nodeId={nodeId}
            label={label}
            argType={argType}
            disabled={!!hasBinding}
            value={constValue}
            onChange={handlePropConstChange}
          />
          <BindingEditor<V>
            globalScope={globalScope}
            label={label}
            server={server}
            propType={argType.typeDef}
            value={value}
            onChange={onChange}
            disabled={!isBindable}
            liveBinding={liveBinding}
          />
        </React.Fragment>
      ) : (
        <Alert severity="warning">
          {`No control for '${label}' (type '${argType.typeDef.type}' ${
            argType.control ? `, control: '${argType.control.type}'` : ''
          })`}
        </Alert>
      )}
    </Stack>
  );
}
