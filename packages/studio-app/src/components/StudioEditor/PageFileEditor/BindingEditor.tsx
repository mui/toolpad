import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
} from '@mui/material';
import React from 'react';
import { getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBoundProp, StudioNodeProp, StudioNodeProps } from '../../../types';
import { ExactEntriesOf } from '../../../utils/types';
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
  const initialValue = nodeProp?.type === 'expression' ? nodeProp.value : '';
  const [input, setInput] = React.useState(initialValue);

  const handleBind = React.useCallback(() => {
    domApi.setNodeExpressionPropValue(node.id, prop, input);
  }, [domApi, node.id, prop, input]);

  return (
    <React.Fragment>
      <DialogTitle>Bind a property</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        Type: {argType}
        <TextField value={input} onChange={(event) => setInput(event.target.value)} />
      </DialogContent>

      <DialogActions>
        <Button disabled={!input} color="primary" onClick={handleBind}>
          Bind Property
        </Button>
      </DialogActions>
    </React.Fragment>
  );
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
    const page = studioDom.getElementPage(dom, srcNode);
    if (!page) {
      return [];
    }
    const nodes = studioDom.getDescendants(dom, page);
    return nodes.flatMap((destNode) => {
      const destDefinition = getStudioComponent(dom, destNode.component);

      return Object.entries(destDefinition.argTypes).flatMap(([destProp]) => {
        const destPropDefinition = destDefinition.argTypes[destProp];
        if (!destPropDefinition) {
          throw new Error(`Invariant: trying to bind an unknown property "${srcProp}"`);
        }
        const destType = destPropDefinition.typeDef.type;
        if ((destNode.id === srcNodeId && destProp === srcProp) || destType !== srcType) {
          return [];
        }
        return [
          {
            nodeId: destNode.id,
            nodeName: destNode.name,
            propName: destProp,
          },
        ];
      });
    });
  }, [dom, srcNode, srcNodeId, srcProp, srcType]);

  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  const handleSelect = (index: number) => () => setSelectedIdx(index);

  const handleBind = React.useCallback(() => {
    if (typeof selectedIdx === 'number') {
      const selection = bindableProps[selectedIdx];
      domApi.addBinding(
        srcNodeId,
        srcProp,
        selection.nodeId,
        selection.propName,
        srcPropDefinition.defaultValue,
      );
    }
  }, [domApi, srcNodeId, srcProp, bindableProps, selectedIdx, srcPropDefinition]);

  return (
    <React.Fragment>
      <DialogTitle>Bind a property</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div>Type: {srcType}</div>
        <List sx={{ flex: 1, overflow: 'scroll' }}>
          {bindableProps.map((bindableProp, i) => (
            <ListItemButton
              key={`item-${bindableProp.nodeId}-${bindableProp.propName}`}
              onClick={handleSelect(i)}
              selected={i === selectedIdx}
            >
              <ListItemText primary={`${bindableProp.nodeName}.${bindableProp.propName}`} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button disabled={typeof selectedIdx !== 'number'} color="primary" onClick={handleBind}>
          Bind Property
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

interface RemoveBindingEditorProps<P, K extends keyof P & string> {
  node: studioDom.StudioElementNode<P>;
  prop: K;
  propValue: StudioBoundProp;
}

function RemoveBindingEditor<P, K extends keyof P & string>({
  node,
  prop,
  propValue,
}: RemoveBindingEditorProps<P, K>) {
  const dom = useDom();
  const domApi = useDomApi();

  const nodeId = node.id;
  const stateKey = propValue.state;

  const handleRemoveClick = React.useCallback(() => {
    domApi.removeBinding(nodeId, prop);
  }, [domApi, nodeId, prop]);

  const boundProps = React.useMemo(() => {
    const page = studioDom.getElementPage(dom, node);
    if (!page) {
      return [];
    }
    const nodes = studioDom.getDescendants(dom, page);
    return nodes.flatMap((pageNode) =>
      (Object.entries(pageNode.props) as ExactEntriesOf<StudioNodeProps<any>>).flatMap(
        ([nodeProp, nodePropValue]) => {
          if (nodePropValue?.type === 'binding' && nodePropValue.state === stateKey) {
            return [{ node: pageNode, prop: nodeProp }];
          }
          return [];
        },
      ),
    );
  }, [dom, node, stateKey]);

  return (
    <React.Fragment>
      <DialogTitle>Current binding</DialogTitle>
      <DialogContent>
        <Stack direction="row" gap={1}>
          {boundProps.map((boundProp) => (
            <Chip
              key={`${boundProp.node.id}.${String(boundProp.prop)}`}
              label={`${boundProp.node.name}.${String(boundProp.prop)}`}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleRemoveClick}>
          Unbind
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

const EXPERIMENTAL_BINDING = true;

export function BindingEditorContent<P, K extends keyof P & string>({
  nodeId,
  prop,
}: BindingEditorContentProps<K>) {
  const dom = useDom();

  const node = studioDom.getNode(dom, nodeId);
  studioDom.assertIsElement<P>(node);
  const propValue: StudioNodeProp<P[K]> | undefined = node.props[prop];
  const hasBinding = propValue?.type === 'binding';

  // eslint-disable-next-line no-nested-ternary
  return hasBinding ? (
    <RemoveBindingEditor node={node} prop={prop} propValue={propValue} />
  ) : EXPERIMENTAL_BINDING ? (
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
