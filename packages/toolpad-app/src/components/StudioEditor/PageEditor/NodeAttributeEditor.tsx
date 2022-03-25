import * as React from 'react';
import { ArgTypeDefinition } from '../../../../../toolpad-core/dist';
import * as studioDom from '../../../studioDom';
import { useDomApi } from '../../DomLoader';
import { StudioBindable } from '../../../types';
import BindableEditor from './BindableEditor';

export interface NodeAttributeEditorProps {
  node: studioDom.StudioNode;
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
    (newValue: StudioBindable<unknown> | null) => {
      domApi.setNodeNamespacedProp(node, namespace as any, name, newValue);
    },
    [domApi, node, namespace, name],
  );

  const propValue: StudioBindable<unknown> | null = (node as any)[namespace]?.[name] ?? null;

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
