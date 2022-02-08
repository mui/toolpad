import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  List,
  ListItem,
  SelectChangeEvent,
  DialogActions,
} from '@mui/material';
import React from 'react';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import * as studioDom from '../../../studioDom';
import { NodeId } from '../../../types';
import { WithControlledProp } from '../../../utils/types';

interface QueryStateNodeEditorProps<P>
  extends WithControlledProp<studioDom.StudioQueryStateNode<P>> {}

function QueryStateNodeEditor<P>({ value, onChange }: QueryStateNodeEditorProps<P>) {
  const dom = useDom();
  const app = studioDom.getApp(dom);
  const { apis = [] } = studioDom.getChildNodes(dom, app);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<'' | NodeId>) => {
      onChange({ ...value, api: event.target.value ? (event.target.value as NodeId) : null });
    },
    [onChange, value],
  );

  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`select-data-query`}>Query</InputLabel>
      <Select
        value={value.api || ''}
        labelId="select-data-query"
        label="Query"
        onChange={handleSelectionChange}
        size="small"
      >
        <MenuItem value="">---</MenuItem>
        {apis.map(({ id, name }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function QueryStateEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedState, setEditedState] = React.useState<NodeId | null>(null);
  const editedStateNode = editedState ? studioDom.getNode(dom, editedState, 'queryState') : null;
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId, 'page');
  const { queryStates = [] } = studioDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'queryState', {
      api: null,
      params: {},
    });
    domApi.addNode(stateNode, page, 'queryStates');
    setEditedState(stateNode.id);
  }, [dom, domApi, page]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleSave = React.useCallback(
    (newValue: studioDom.StudioQueryStateNode) => domApi.saveNode(newValue),
    [domApi],
  );

  const handleRemove = React.useCallback(() => {
    if (editedStateNode) {
      domApi.removeNode(editedStateNode.id);
    }
    handleEditStateDialogClose();
  }, [editedStateNode, handleEditStateDialogClose, domApi]);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" onClick={handleCreate}>
        create query state
      </Button>
      <List>
        {queryStates.map((stateNode) => {
          return (
            <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode.id)}>
              {stateNode.name}
            </ListItem>
          );
        })}
      </List>
      {lastEditedStateNode ? (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
        >
          <DialogTitle>Edit Query State ({lastEditedStateNode.id})</DialogTitle>
          <DialogContent>
            <QueryStateNodeEditor value={lastEditedStateNode} onChange={handleSave} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemove}>Remove</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
