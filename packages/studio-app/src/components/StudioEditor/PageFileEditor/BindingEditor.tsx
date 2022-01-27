import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import React from 'react';
import { getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioNodeProp } from '../../../types';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorApi, usePageEditorState } from './PageEditorProvider';

export interface BindingEditorContentProps<K> {
  nodeId: NodeId;
  prop: K;
}

interface AddExpressionEditorProps<P, K extends keyof P & string> {
  node: studioDom.StudioElementNode<P>;
  prop: K;
}

function AddExpressionEditor<P, K extends keyof P & string>({
  node,
  prop,
}: AddExpressionEditorProps<P, K>) {
  const dom = useDom();
  const domApi = useDomApi();

  const definition = getStudioComponent(dom, node.component);
  const propDefinition = definition.argTypes[prop];

  if (!propDefinition) {
    throw new Error(`Invariant: trying to bind an unknown property "${prop}"`);
  }
  const argType = propDefinition.typeDef.type;

  const nodeProp = node.props[prop];
  const initialValue = nodeProp?.type === 'binding' ? nodeProp.value : '';
  const [input, setInput] = React.useState(initialValue);
  const format = argType === 'string' ? 'stringLiteral' : 'default';

  const handleBind = React.useCallback(() => {
    domApi.setNodeExpressionPropValue(node.id, prop, input, format);
  }, [domApi, node.id, prop, input, format]);

  const handleRemove = React.useCallback(() => {
    domApi.removeBinding(node.id, prop);
  }, [domApi, node.id, prop]);

  return (
    <React.Fragment>
      <DialogTitle>Bind a property</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        Type: {argType}
        <TextField value={input} onChange={(event) => setInput(event.target.value)} />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleRemove}>Remove</Button>
        <Button disabled={!input} color="primary" onClick={handleBind}>
          Update
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

function getBindablePropsInScope(dom: studioDom.StudioDom, nodeId: NodeId, prop: string) {
  const node = studioDom.getNode(dom, nodeId);
  if (!studioDom.isElement(node)) {
    return [];
  }
  const page = studioDom.getElementPage(dom, node);
  if (!page) {
    return [];
  }

  const srcDefinition = getStudioComponent(dom, node.component);
  const srcPropDefinition = srcDefinition.argTypes[prop];

  if (!srcPropDefinition) {
    throw new Error(`Invariant: trying to bind an unknown property "${prop}"`);
  }
  const srcType = srcPropDefinition.typeDef.type;

  const nodes = studioDom.getDescendants(dom, page);
  return nodes.flatMap((destNode) => {
    const destDefinition = getStudioComponent(dom, destNode.component);

    return Object.entries(destDefinition.argTypes).flatMap(([destProp]) => {
      const destPropDefinition = destDefinition.argTypes[destProp];
      if (!destPropDefinition) {
        throw new Error(`Invariant: trying to bind an unknown property "${prop}"`);
      }
      const destType = destPropDefinition.typeDef.type;
      if ((destNode.id === node.id && destProp === prop) || destType !== srcType) {
        return [];
      }
      return [`${destNode.name}.${destProp}`];
    });
  });
}

interface BindingEditorTabProps<P, K extends keyof P & string> {
  node: studioDom.StudioElementNode<P>;
  prop: K;
}

function AddBindingEditor<P, K extends keyof P & string>({
  node: srcNode,
  prop: srcProp,
}: BindingEditorTabProps<P, K>) {
  const dom = useDom();
  const domApi = useDomApi();

  const srcNodeId = srcNode.id;
  const srcDefinition = getStudioComponent(dom, srcNode.component);
  const srcPropDefinition = srcDefinition.argTypes[srcProp];

  if (!srcPropDefinition) {
    throw new Error(`Invariant: trying to bind an unknown property "${srcProp}"`);
  }
  const srcType = srcPropDefinition.typeDef.type;

  const bindableProps = React.useMemo(() => {
    return getBindablePropsInScope(dom, srcNodeId, srcProp);
  }, [dom, srcNodeId, srcProp]);

  const [selection, setSelection] = React.useState<string | null>(null);

  const handleSelect = (bindableProp: string) => () => setSelection(bindableProp);
  const format = srcType === 'string' ? 'stringLiteral' : 'default';

  const handleBind = React.useCallback(() => {
    domApi.setNodeExpressionPropValue(srcNodeId, srcProp, `{{${selection}}}`, format);
  }, [domApi, srcNodeId, srcProp, selection, format]);

  return (
    <React.Fragment>
      <DialogTitle>Bind a property</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div>Type: {srcType}</div>
        <List sx={{ flex: 1, overflow: 'scroll' }}>
          {bindableProps.map((bindableProp) => (
            <ListItemButton
              key={`item-${bindableProp}`}
              onClick={handleSelect(bindableProp)}
              selected={selection === bindableProp}
            >
              <ListItemText primary={bindableProp} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button disabled={!selection} color="primary" onClick={handleBind}>
          Add binding
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

export function BindingEditorContent<P, K extends keyof P & string>({
  nodeId,
  prop,
}: BindingEditorContentProps<K>) {
  const dom = useDom();

  const node = studioDom.getNode(dom, nodeId);
  studioDom.assertIsElement<P>(node);
  const propValue: StudioNodeProp<P[K]> | undefined = node.props[prop];
  const hasBinding = propValue?.type === 'binding';

  return hasBinding ? (
    <AddExpressionEditor node={node} prop={prop} />
  ) : (
    <AddBindingEditor node={node} prop={prop} />
  );
}

export default function BindingEditor() {
  const state = usePageEditorState();
  const api = usePageEditorApi();
  const handleClose = React.useCallback(() => api.closeBindingEditor(), [api]);
  const bindingEditorProps = useLatest(state.bindingEditor);
  return (
    <Dialog onClose={handleClose} open={!!state.bindingEditor} fullWidth>
      {bindingEditorProps ? <BindingEditorContent<any, any> {...bindingEditorProps} /> : null}
    </Dialog>
  );
}
