import { Alert, Stack } from '@mui/material';
import * as React from 'react';
import { ArgTypeDefinition, ArgControlSpec, PropValueType } from '@mui/studio-core';
import studioPropControls from '../../propertyControls';
import * as studioDom from '../../../studioDom';
import { useDomApi } from '../../DomProvider';
import { BindingEditor } from './BindingEditor';

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
    case 'dataQuery':
      return { type: 'dataQuery' };
    default:
      return null;
  }
}

export interface ComponentPropEditorProps<P, K extends keyof P> {
  name: K;
  node: studioDom.StudioElementNode<P>;
  argType: ArgTypeDefinition;
  actualValue: unknown;
}

export default function ComponentPropEditor<P, K extends keyof P & string>({
  name,
  node,
  argType,
  actualValue,
}: ComponentPropEditorProps<P, K>) {
  const domApi = useDomApi();

  const handlePropChange = React.useCallback(
    (newValue) => {
      domApi.setNodePropValue<P>(node.id, name, newValue);
    },
    [domApi, node.id, name],
  );

  const handlePropConstChange = React.useCallback(
    (value: any) => handlePropChange({ type: 'const', value }),
    [handlePropChange],
  );

  const controlSpec = argType.control ?? getDefaultControl(argType.typeDef);
  const control = controlSpec ? studioPropControls[controlSpec.type] : null;

  const propValue = node.props[name] ?? null;

  const initPropValue = React.useCallback(() => {
    if (propValue?.type === 'const') {
      return propValue.value;
    }

    return actualValue;
  }, [actualValue, propValue]);

  const [value, setValue] = React.useState(initPropValue);

  React.useEffect(() => {
    setValue(initPropValue());
    return () => {};
  }, [propValue, initPropValue]);

  const hasBinding = propValue?.type === 'boundExpression' || propValue?.type === 'binding';

  return (
    <Stack direction="row" alignItems="flex-start">
      {control ? (
        <React.Fragment>
          <control.Editor
            name={name}
            argType={argType}
            disabled={hasBinding}
            value={value}
            onChange={handlePropConstChange}
          />
          <BindingEditor
            nodeId={node.id}
            prop={name}
            propType={argType.typeDef}
            value={propValue}
            onChange={handlePropChange}
          />
        </React.Fragment>
      ) : (
        <Alert severity="warning">
          {`No control for property '${name}' (type '${argType.typeDef.type}' ${
            argType.control ? `, control: '${argType.control.type}'` : ''
          })`}
        </Alert>
      )}
    </Stack>
  );
}
