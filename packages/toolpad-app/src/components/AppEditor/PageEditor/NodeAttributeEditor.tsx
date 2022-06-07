import * as React from 'react';
import {
  ArgControlSpec,
  ArgTypeDefinition,
  BindableAttrValue,
  PropValueType,
} from '@mui/toolpad-core';
import { Alert } from '@mui/material';
import * as appDom from '../../../appDom';
import { useDomApi } from '../../DomLoader';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import propertyControls from '../../propertyControls';

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

export interface NodeAttributeEditorProps {
  node: appDom.AppDomNode;
  namespace?: string;
  name: string;
  argType: ArgTypeDefinition;
}

export default function NodeAttributeEditor({
  node,
  namespace = 'attributes',
  name,
  argType,
}: NodeAttributeEditorProps) {
  const domApi = useDomApi();

  const handlePropChange = React.useCallback(
    (newValue: BindableAttrValue<unknown> | null) => {
      domApi.setNodeNamespacedProp(node, namespace as any, name, newValue);
    },
    [domApi, node, namespace, name],
  );

  const propValue: BindableAttrValue<unknown> | null = (node as any)[namespace]?.[name] ?? null;

  const bindingId = `${node.id}${namespace ? `.${namespace}` : ''}.${name}`;
  const { bindings, pageState } = usePageEditorState();
  const liveBinding = bindings[bindingId];
  const globalScope = pageState;

  const controlSpec = argType.control ?? getDefaultControl(argType.typeDef);
  const Control = controlSpec ? propertyControls[controlSpec.type] : null;

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isBindable = !argType.onChangeHandler;

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={globalScope}
      label={argType.label || name}
      disabled={!isBindable}
      propType={argType.typeDef}
      renderControl={(params) => <Control nodeId={node.id} argType={argType} {...params} />}
      value={propValue}
      onChange={handlePropChange}
    />
  ) : (
    <Alert severity="warning">
      {`No control for '${name}' (type '${argType.typeDef.type}' ${
        argType.control ? `, control: '${argType.control.type}'` : ''
      })`}
    </Alert>
  );
}
