import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  TextField,
} from '@mui/material';
import React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { PropValueType } from '@mui/studio-core';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioNodeProp } from '../../../types';
import { useDom, useDomApi } from '../../DomProvider';
import { WithControlledProp } from '../../../utils/types';

export interface BindingEditorContentProps<K> {
  nodeId: NodeId;
  prop: K;
}

interface BoundExpressionEditorProps extends WithControlledProp<StudioNodeProp<unknown> | null> {
  propType: PropValueType;
}

function BoundExpressionEditor({ propType, value, onChange }: BoundExpressionEditorProps) {
  const argType = propType.type;

  const initialValue = value?.type === 'boundExpression' ? value.value : '';
  const [input, setInput] = React.useState(initialValue);
  const format = argType === 'string' ? 'stringLiteral' : 'default';

  const handleBind = React.useCallback(() => {
    onChange({ type: 'boundExpression', value: input, format });
  }, [onChange, input, format]);

  return (
    <React.Fragment>
      <DialogTitle>Bind a property</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        Type: {argType}
        <TextField value={input} onChange={(event) => setInput(event.target.value)} />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onChange(null)}>Remove</Button>
        <Button disabled={!input} color="primary" onClick={handleBind}>
          Update binding
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
    if (studioDom.isDerivedState(destNode) && destNode.returnType.type === srcType) {
      return [destNode.name];
    }
    return [];
  });
}

interface BindingEditorTabProps extends WithControlledProp<StudioNodeProp<unknown> | null> {
  node: studioDom.StudioNode;
  prop: string;
  propType: PropValueType;
}

function AddBindingEditor({
  node: srcNode,
  prop: srcProp,
  propType,
  value,
  onChange,
}: BindingEditorTabProps) {
  const dom = useDom();

  const srcNodeId = srcNode.id;
  const srcType = propType.type;

  const bindableProps = React.useMemo(() => {
    return getBindablePropsInScope(dom, srcNodeId, srcProp, propType);
  }, [dom, srcNodeId, srcProp, propType]);

  const [selection, setSelection] = React.useState<string | null>(
    value?.type === 'binding' ? value.value : null,
  );
  React.useEffect(() => setSelection(value?.type === 'binding' ? value.value : null), [value]);

  const handleSelect = (bindableProp: string) => () => setSelection(bindableProp);

  const handleBind = React.useCallback(() => {
    onChange(selection ? { type: 'binding', value: selection } : null);
  }, [onChange, selection]);

  return (
    <React.Fragment>
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

export interface BindingEditor2Props<K extends string>
  extends WithControlledProp<StudioNodeProp<unknown> | null> {
  nodeId: NodeId;
  prop: K;
  propType: PropValueType;
}

export function BindingEditor2<P = any>({
  nodeId,
  prop,
  propType,
  value,
  onChange,
}: BindingEditor2Props<keyof P & string>) {
  const dom = useDom();
  const node = studioDom.getNode(dom, nodeId);

  const [bindingType, setBindingType] = React.useState<'binding' | 'boundExpression'>(
    value?.type === 'boundExpression' ? 'boundExpression' : 'binding',
  );
  React.useEffect(
    () => setBindingType(value?.type === 'boundExpression' ? 'boundExpression' : 'binding'),
    [value?.type],
  );

  return (
    <TabContext value={bindingType}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(event, newValue) => setBindingType(newValue)}>
          <Tab label="Binding" value="binding" />
          <Tab label="Expression" value="boundExpression" />
        </TabList>
      </Box>
      <TabPanel value="binding">
        <AddBindingEditor
          node={node}
          prop={prop}
          propType={propType}
          value={value}
          onChange={onChange}
        />
      </TabPanel>
      <TabPanel value="boundExpression">
        <BoundExpressionEditor propType={propType} value={value} onChange={onChange} />
      </TabPanel>
    </TabContext>
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
  const domApi = useDomApi();

  const [open, setOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const node = studioDom.getNode(dom, nodeId);
  const propValue: StudioNodeProp<unknown> | null =
    (node as studioDom.StudioNodeBase<P>).props[prop] ?? null;

  const hasBinding = propValue?.type === 'boundExpression' || propValue?.type === 'binding';

  const handleBind = React.useCallback(
    (newValue) => {
      domApi.setNodePropValue<P>(nodeId, prop, newValue);
    },
    [domApi, nodeId, prop],
  );

  return (
    <React.Fragment>
      <IconButton size="small" onClick={handleOpen} color={hasBinding ? 'primary' : 'inherit'}>
        {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
      </IconButton>
      <Dialog onClose={handleClose} open={open} fullWidth>
        <BindingEditor2
          nodeId={nodeId}
          prop={prop}
          propType={propType}
          value={propValue}
          onChange={handleBind}
        />
      </Dialog>
    </React.Fragment>
  );
}
