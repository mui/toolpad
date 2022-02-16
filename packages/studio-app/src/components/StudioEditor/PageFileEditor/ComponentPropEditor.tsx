import { Alert, Stack } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/studio-core';
import studioPropControls from '../../propertyControls';
import * as studioDom from '../../../studioDom';
import { useDomApi } from '../../DomLoader';
import { BindingEditor } from './BindingEditor';
import { NodeId, StudioBindable } from '../../../types';
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

export interface BindableEditorProps<V> extends WithControlledProp<StudioBindable<V> | null> {
  propNamespace: string | null;
  propName: string;
  nodeId: NodeId;
  argType: ArgTypeDefinition;
}

export function BindableEditor<V>({
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
  const control = controlSpec ? studioPropControls[controlSpec.type] : null;

  const bindingId = `${nodeId}${propNamespace ? `.${propNamespace}` : ''}.${propName}`;
  const { viewState } = usePageEditorState();
  const liveBinding = viewState.bindings[bindingId];

  const initConstValue = React.useCallback(() => {
    if (value?.type === 'const') {
      return value.value;
    }

    return liveBinding?.value;
  }, [liveBinding, value]);

  const [constValue, setConstValue] = React.useState(initConstValue);

  React.useEffect(() => {
    setConstValue(initConstValue());
    return () => {};
  }, [value, initConstValue]);

  const hasBinding = value && value.type !== 'const';

  return (
    <Stack direction="row" alignItems="flex-start">
      {control ? (
        <React.Fragment>
          <control.Editor
            nodeId={nodeId}
            propName={propName}
            argType={argType}
            disabled={!!hasBinding}
            value={constValue}
            onChange={handlePropConstChange}
          />
          <BindingEditor<V>
            bindingId={`${nodeId}${propNamespace ? `.${propNamespace}` : ''}.${propName}`}
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

export interface ComponentPropEditorProps<P, K extends keyof P> {
  node: studioDom.StudioElementNode<P>;
  propName: K;
  argType: ArgTypeDefinition;
}

export default function ComponentPropEditor<P, K extends keyof P & string>({
  node,
  propName,
  argType,
}: ComponentPropEditorProps<P, K>) {
  const domApi = useDomApi();
  const propNamespace = 'props';

  const handlePropChange = React.useCallback(
    (newValue: StudioBindable<P[K]> | null) => {
      domApi.setNodeNamespacedProp(node, propNamespace, propName, newValue);
    },
    [domApi, node, propName],
  );

  const propValue = node.props[propName] ?? null;

  return (
    <BindableEditor
      propNamespace={propNamespace}
      propName={propName}
      argType={argType}
      nodeId={node.id}
      value={propValue}
      onChange={handlePropChange}
    />
  );
}
