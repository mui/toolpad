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
import { NodeId, StudioBindable } from '../../../types';
import { useDom } from '../../DomProvider';
import { WithControlledProp } from '../../../utils/types';
import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS, URI_DATAQUERY } from '../../../schemas';

export interface BindingEditorContentProps<K> {
  nodeId: NodeId;
  prop: K;
}

interface BoundExpressionEditorProps extends WithControlledProp<StudioBindable<unknown> | null> {
  propType: PropValueType;
}

function BoundExpressionEditor({ propType, value, onChange }: BoundExpressionEditorProps) {
  const argType = propType.type;

  const format = argType === 'string' ? 'stringLiteral' : 'default';

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ type: 'boundExpression', value: event.target.value, format });
    },
    [onChange, format],
  );

  return (
    <TextField
      fullWidth
      size="small"
      value={value?.type === 'boundExpression' ? value.value : ''}
      onChange={handleChange}
    />
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
    if (studioDom.isQueryState(destNode)) {
      if (propType.type === 'object' || propType.type === 'array') {
        if (!propType.schema) {
          return [];
        }
        switch (propType.schema) {
          case URI_DATAQUERY as string:
            return [destNode.name];
          case URI_DATAGRID_COLUMNS as string:
            return [`${destNode.name}.columns`];
          case URI_DATAGRID_ROWS as string:
            return [`${destNode.name}.rows`];
          default:
            return [];
        }
      }
    }
    return [];
  });
}

interface BindingEditorTabProps extends WithControlledProp<StudioBindable<unknown> | null> {
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

  const bindableProps = React.useMemo(() => {
    return getBindablePropsInScope(dom, srcNodeId, srcProp, propType);
  }, [dom, srcNodeId, srcProp, propType]);

  const handleSelect = (bindableProp: string) => () =>
    onChange(bindableProp ? { type: 'binding', value: bindableProp } : null);

  return (
    <div>
      <List sx={{ flex: 1, overflow: 'scroll' }}>
        {bindableProps.map((bindableProp) => (
          <ListItemButton
            key={`item-${bindableProp}`}
            onClick={handleSelect(bindableProp)}
            selected={value?.value === bindableProp}
          >
            <ListItemText primary={bindableProp} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}

export interface BindingEditorProps<K extends string>
  extends WithControlledProp<StudioBindable<unknown> | null> {
  nodeId: NodeId;
  prop: K;
  propType: PropValueType;
}

export function BindingEditor<P = any>({
  nodeId,
  prop,
  propType,
  value,
  onChange,
}: BindingEditorProps<keyof P & string>) {
  const dom = useDom();
  const node = studioDom.getNode(dom, nodeId);

  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const [bindingType, setBindingType] = React.useState<'binding' | 'boundExpression'>(
    value?.type === 'boundExpression' ? 'boundExpression' : 'binding',
  );
  React.useEffect(
    () => setBindingType(value?.type === 'boundExpression' ? 'boundExpression' : 'binding'),
    [value?.type],
  );

  const hasBinding = value?.type === 'boundExpression' || value?.type === 'binding';

  const inputValue = input?.type === bindingType ? input : null;

  const handleBind = React.useCallback(() => {
    onChange(inputValue);
    handleClose();
  }, [onChange, inputValue, handleClose]);

  return (
    <React.Fragment>
      <IconButton size="small" onClick={handleOpen} color={hasBinding ? 'primary' : 'inherit'}>
        {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
      </IconButton>
      <Dialog onClose={handleClose} open={open} fullWidth>
        <DialogTitle>Bind a property</DialogTitle>
        <DialogContent>
          <div>Type: {propType.type}</div>
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
                value={inputValue}
                onChange={(newValue) => setInput(newValue)}
              />
            </TabPanel>
            <TabPanel value="boundExpression">
              <BoundExpressionEditor
                propType={propType}
                value={inputValue}
                onChange={(newValue) => setInput(newValue)}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button disabled={!value} onClick={() => onChange(null)}>
            Remove
          </Button>
          <Button disabled={!inputValue} color="primary" onClick={handleBind}>
            Add binding
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
