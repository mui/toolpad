import * as React from 'react';
import { ArgTypeDefinition, BindableAttrValue, ComponentProps } from '@mui/toolpad-core';
import { Alert } from '@mui/material';
import * as appDom from '../../../appDom';
import { useDomApi } from '../../DomLoader';
import BindableEditor from './BindableEditor';
import { usePageEditorState } from './PageEditorProvider';
import { getDefaultControl } from '../../propertyControls';

export interface NodeAttributeEditorProps {
  node: appDom.AppDomNode;
  namespace?: string;
  name: string;
  argType: ArgTypeDefinition;
  props?: ComponentProps;
}

export default function NodeAttributeEditor({
  node,
  namespace = 'attributes',
  name,
  argType,
  props,
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
  const propType = argType.typeDef;
  const Control = getDefaultControl(argType, props);

  // NOTE: Doesn't make much sense to bind controlled props. In the future we might opt
  // to make them bindable to other controlled props only
  const isDisabled = !!argType.onChangeHandler;

  const isBindable = !isDisabled && namespace !== 'layout';

  return Control ? (
    <BindableEditor
      liveBinding={liveBinding}
      globalScope={globalScope}
      label={argType.label || name}
      bindable={isBindable}
      disabled={isDisabled}
      propType={propType}
      renderControl={(params) => <Control nodeId={node.id} {...params} propType={propType} />}
      value={propValue}
      onChange={handlePropChange}
    />
  ) : (
    <Alert severity="warning">
      {`No control for '${name}' (type '${propType.type}' ${
        argType.control ? `, control: '${argType.control.type}'` : ''
      })`}
    </Alert>
  );
}
