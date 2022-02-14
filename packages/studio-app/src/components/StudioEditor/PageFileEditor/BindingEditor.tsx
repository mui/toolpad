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
import * as React from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { PropValueType } from '@mui/studio-core';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getStudioComponent } from '../../../studioComponents';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBindable } from '../../../types';
import { useDom } from '../../DomLoader';
import { WithControlledProp } from '../../../utils/types';
import { URI_DATAGRID_COLUMNS, URI_DATAGRID_ROWS, URI_DATAQUERY } from '../../../schemas';
import { JsExpressionEditor } from './JsExpressionEditor';
import { usePageEditorState } from './PageEditorProvider';
import RuntimeErrorAlert from './RuntimeErrorAlert';
import JsonView from '../../JsonView';
import { tryFormatExpression } from '../../../utils/prettier';

interface BoundExpressionEditorProps<V> extends WithControlledProp<StudioBindable<V> | null> {
  propType: PropValueType;
}

function BoundExpressionEditor<V>({ propType, value, onChange }: BoundExpressionEditorProps<V>) {
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

interface JsExpressionBindingEditorProps<V> extends WithControlledProp<StudioBindable<V> | null> {
  onCommit?: () => void;
}

function JsExpressionBindingEditor<V>({
  value,
  onChange,
  onCommit,
}: JsExpressionBindingEditorProps<V>) {
  const handleChange = React.useCallback(
    (newValue: string) => onChange({ type: 'jsExpression', value: newValue }),
    [onChange],
  );

  return (
    <JsExpressionEditor
      value={value?.type === 'jsExpression' ? value.value : ''}
      onChange={handleChange}
      onCommit={onCommit}
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
    if (studioDom.isQueryState(destNode) || studioDom.isFetchedState(destNode)) {
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
            return [`${destNode.name}.rows`, `${destNode.name}.data`];
          default:
            return [];
        }
      }
    }
    return [];
  });
}

interface BindingEditorTabProps<V> extends WithControlledProp<StudioBindable<V> | null> {
  node: studioDom.StudioNode;
  prop: string;
  propType: PropValueType;
}

function AddBindingEditor<V>({
  node: srcNode,
  prop: srcProp,
  propType,
  value,
  onChange,
}: BindingEditorTabProps<V>) {
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

function getInitialBindingType(
  type?: StudioBindable<unknown>['type'] | null,
): 'binding' | 'boundExpression' | 'jsExpression' {
  return type === 'boundExpression' || type === 'binding' ? type : 'jsExpression';
}

export interface BindingEditorProps<V> extends WithControlledProp<StudioBindable<V> | null> {
  bindingId: string;
  nodeId: NodeId;
  prop: string;
  propType: PropValueType;
}

export function BindingEditor<V>({
  bindingId,
  nodeId,
  prop,
  propType,
  value,
  onChange,
}: BindingEditorProps<V>) {
  const dom = useDom();
  const node = studioDom.getNode(dom, nodeId);
  const { viewState } = usePageEditorState();

  const liveBinding = viewState.bindings[bindingId];

  const [input, setInput] = React.useState(value);
  React.useEffect(() => setInput(value), [value]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setOpen(true), []);
  const handleClose = React.useCallback(() => setOpen(false), []);

  const [bindingType, setBindingType] = React.useState(getInitialBindingType(value?.type));
  React.useEffect(() => setBindingType(getInitialBindingType(value?.type)), [value?.type]);

  const hasBinding =
    value?.type === 'boundExpression' ||
    value?.type === 'binding' ||
    value?.type === 'jsExpression';

  const inputValue = input?.type === bindingType ? input : null;

  const handleCommit = React.useCallback(() => {
    let newValue = inputValue;

    if (inputValue?.type === 'jsExpression') {
      newValue = {
        ...inputValue,
        value: tryFormatExpression(inputValue.value),
      };
    }

    onChange(newValue);
  }, [onChange, inputValue]);

  return (
    <React.Fragment>
      <IconButton size="small" onClick={handleOpen} color={hasBinding ? 'primary' : 'inherit'}>
        {hasBinding ? <LinkIcon fontSize="inherit" /> : <LinkOffIcon fontSize="inherit" />}
      </IconButton>
      <Dialog onClose={handleClose} open={open} fullWidth scroll="body">
        <DialogTitle>Bind a property</DialogTitle>
        <DialogContent>
          <div>Type: {propType.type}</div>
          <TabContext value={bindingType}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(event, newValue) => setBindingType(newValue)}>
                <Tab label="Binding" value="binding" />
                <Tab label="Expression" value="boundExpression" />
                <Tab label="Javascript" value="jsExpression" />
              </TabList>
            </Box>
            <TabPanel value="binding">
              <AddBindingEditor<V>
                node={node}
                prop={prop}
                propType={propType}
                value={inputValue}
                onChange={(newValue) => setInput(newValue)}
              />
            </TabPanel>
            <TabPanel value="boundExpression">
              <BoundExpressionEditor<V>
                propType={propType}
                value={inputValue}
                onChange={(newValue) => setInput(newValue)}
              />
            </TabPanel>
            <TabPanel value="jsExpression">
              <JsExpressionBindingEditor<V>
                onCommit={handleCommit}
                value={inputValue}
                onChange={(newValue) => setInput(newValue)}
              />
            </TabPanel>
          </TabContext>
          {/* eslint-disable-next-line no-nested-ternary */}
          {liveBinding ? (
            liveBinding.error ? (
              <RuntimeErrorAlert error={liveBinding.error} />
            ) : (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                <JsonView name={false} src={liveBinding.value} />
              </Box>
            )
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button disabled={!value} onClick={() => onChange(null)}>
            Remove
          </Button>
          <Button disabled={!inputValue} color="primary" onClick={handleCommit}>
            Update binding
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
