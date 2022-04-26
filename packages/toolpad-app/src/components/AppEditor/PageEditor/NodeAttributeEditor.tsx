import * as React from 'react';
import { ArgTypeDefinition, BindableAttrValue } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { useDomApi } from '../../DomLoader';
import BindableEditor from './BindableEditor';

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

  return (
    <BindableEditor
      propNamespace={namespace}
      propName={name}
      argType={argType}
      nodeId={node.id}
      value={propValue}
      onChange={handlePropChange}
    />
  );
}
