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
} from '@mui/material';
import React from 'react';
import { getStudioComponent } from '../../studioComponents';
import { getNode } from '../../studioPage';
import { NodeId, StudioBoundProp, StudioNode, StudioNodeProps } from '../../types';
import { ExactEntriesOf } from '../../utils/types';
import useLatest from '../../utils/useLatest';
import { useEditorApi, useEditorState } from './EditorProvider';

export interface BindingEditorContentProps {
  nodeId: NodeId;
  prop: string;
}

export interface BindingEditorTabProps<P, K extends keyof P & string> {
  node: StudioNode<P>;
  prop: K;
}

export function AddBindingEditor<P, K extends keyof P & string>({
  node: srcNode,
  prop: srcProp,
}: BindingEditorTabProps<P, K>) {
  const state = useEditorState();
  const api = useEditorApi();

  const srcNodeId = srcNode.id;
  const srcDefinition = getStudioComponent(srcNode.component);

  const { type: srcType } = srcDefinition.props[srcProp];

  const bindableProps = React.useMemo(() => {
    return Object.values(state.page.nodes).flatMap((destNode) => {
      const destDefinition = getStudioComponent(destNode.component);

      return Object.entries(destDefinition.props).flatMap(([destProp, prop]) => {
        const { type: destType } = destDefinition.props[destProp];
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
  }, [srcNodeId, srcProp, state.page, srcType]);

  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);

  const handleSelect = (index: number) => () => setSelectedIdx(index);

  const handleBind = React.useCallback(() => {
    if (typeof selectedIdx === 'number') {
      const selection = bindableProps[selectedIdx];
      api.addBinding(
        srcNodeId,
        srcProp,
        selection.nodeId,
        selection.propName,
        srcDefinition.props[srcProp].defaultValue,
      );
    }
  }, [api, srcNodeId, srcProp, bindableProps, selectedIdx, srcDefinition.props]);

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

export interface RemoveBindingEditorProps<P, K extends keyof P & string> {
  node: StudioNode<P>;
  prop: K;
  propValue: StudioBoundProp<P[K]>;
}

export function RemoveBindingEditor<P, K extends keyof P & string>({
  node,
  prop,
  propValue,
}: RemoveBindingEditorProps<P, K>) {
  const api = useEditorApi();
  const state = useEditorState();

  const nodeId = node.id;
  const stateKey = propValue.state;

  const handleRemoveClick = React.useCallback(() => {
    api.removeBinding(nodeId, prop);
  }, [api, nodeId, prop]);

  const boundProps = React.useMemo(() => {
    return Object.values(state.page.nodes).flatMap((node) =>
      (Object.entries(node.props) as ExactEntriesOf<StudioNodeProps<any>>).flatMap(
        ([prop, propValue]) => {
          if (propValue?.type === 'binding' && propValue.state === stateKey) {
            return [{ node, prop }];
          } 
            return [];
          
        },
      ),
    );
  }, [state.page.nodes, stateKey]);

  return (
    <React.Fragment>
      <DialogTitle>Current binding</DialogTitle>
      <DialogContent>
        <Stack direction="row" gap={1}>
          {boundProps.map(({ node, prop }) => (
            <Chip key={`${node.id}.${prop}`} label={`${node.name}.${prop}`} />
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

export function BindingEditorContent<P, K extends keyof P>({
  nodeId,
  prop,
}: BindingEditorContentProps) {
  const state = useEditorState();

  const node = getNode(state.page, nodeId);
  const propValue = node.props[prop];
  const hasBinding = propValue?.type === 'binding';

  return hasBinding ? (
    <RemoveBindingEditor node={node} prop={prop} propValue={propValue} />
  ) : (
    <AddBindingEditor node={node} prop={prop} />
  );
}

export interface BindingEditorProps {}

export default function BindingEditor({}: BindingEditorProps) {
  const state = useEditorState();
  const api = useEditorApi();
  const handleClose = React.useCallback(() => api.closeBindingEditor(), [api]);
  const bindingEditorProps = useLatest(state.bindingEditor);
  return (
    <Dialog onClose={handleClose} open={!!state.bindingEditor} fullWidth>
      {bindingEditorProps ? <BindingEditorContent {...bindingEditorProps} /> : null}
    </Dialog>
  );
}
