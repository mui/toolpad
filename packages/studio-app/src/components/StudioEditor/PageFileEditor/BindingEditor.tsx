import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { PropValueType } from '@mui/studio-core';
import { getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioNodeProp } from '../../../types';
import { useDom, useDomApi } from '../../DomProvider';

export interface BindingEditorContentProps<K> {
  nodeId: NodeId;
  prop: K;
}

interface AddExpressionEditorProps {
  node: studioDom.StudioNode;
  prop: string;
  propType: PropValueType;
}

function AddExpressionEditor({ node, prop, propType }: AddExpressionEditorProps) {
  const domApi = useDomApi();

  const argType = propType.type;

  const nodeProp: StudioNodeProp<any> = node.props[prop];
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

function getBindablePropsInScope(
  dom: studioDom.StudioDom,
  nodeId: NodeId,
  prop: string,
  propType: PropValueType,
): string[] {
  const node = studioDom.getNode(dom, nodeId);
  if (!studioDom.isElement(node) && !studioDom.isDerivedState(node)) {
    return [];
  }
  const page = studioDom.getPageAncestor(dom, node);
  if (!page) {
    return [];
  }

  const srcType = propType.type;

  const nodes = studioDom.getDescendants(dom, page);
  return nodes.flatMap((destNode) => {
    if (studioDom.isElement(destNode)) {
      const destDefinition = getStudioComponent(dom, destNode.component);

      return Object.entries(destDefinition.argTypes).flatMap(([destProp]) => {
        const destPropDefinition = destDefinition.argTypes[destProp];
        if (!destPropDefinition) {
          throw new Error(`Invariant: trying to bind an unknown property "${prop}"`);
        }
        const destType = destPropDefinition.typeDef.type;
        console.log(destProp);
        if (
          (destNode.id === node.id && destProp === prop) ||
          destType !== srcType ||
          !destPropDefinition.onChangeHandler
        ) {
          return [];
        }
        return [`${destNode.name}.${destProp}`];
      });
    }
    if (studioDom.isDerivedState(destNode)) {
      return [destNode.name];
    }
    return [];
  });
}

interface BindingEditorTabProps {
  node: studioDom.StudioNode;
  prop: string;
  propType: PropValueType;
}

function AddBindingEditor({ node: srcNode, prop: srcProp, propType }: BindingEditorTabProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const srcNodeId = srcNode.id;
  const srcType = propType.type;

  const bindableProps = React.useMemo(() => {
    return getBindablePropsInScope(dom, srcNodeId, srcProp, propType);
  }, [dom, srcNodeId, srcProp, propType]);

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

export interface BindingEditorProps<K extends string> {
  nodeId: NodeId;
  prop: K;
  propType: PropValueType;
}

export default function BindingEditor<P = any>({
  nodeId,
  prop,
  propType,
}: BindingEditorProps<keyof P & string>) {
  const dom = useDom();

  const [open, setOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const node = studioDom.getNode(dom, nodeId);
  const propValue: StudioNodeProp<any> = node.props[prop];

  const hasBinding = propValue?.type === 'binding';

  return (
    <React.Fragment>
      <IconButton size="small" onClick={handleOpen} color={hasBinding ? 'primary' : 'inherit'}>
        {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
      </IconButton>
      <Dialog onClose={handleClose} open={open} fullWidth>
        {hasBinding ? (
          <AddExpressionEditor node={node} prop={prop} propType={propType} />
        ) : (
          <AddBindingEditor node={node} prop={prop} propType={propType} />
        )}
      </Dialog>
    </React.Fragment>
  );
}
