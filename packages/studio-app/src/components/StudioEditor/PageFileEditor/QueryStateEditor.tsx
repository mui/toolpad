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
} from '@mui/material';
import React from 'react';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import * as studioDom from '../../../studioDom';
import { NodeId } from '../../../types';

interface EditDerivedStateDialogProps {
  open: boolean;
  onClose: () => void;
  nodeId: NodeId;
}

function EditQueryStateDialog<P>({ nodeId, open, onClose }: EditDerivedStateDialogProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const value = studioDom.getNode(dom, nodeId);
  studioDom.assertIsQueryState<P>(value);

  const app = studioDom.getApp(dom);
  const { apis = [] } = studioDom.getChildNodes(dom, app);

  const handleSelectionChange = React.useCallback(
    (event: SelectChangeEvent<'' | NodeId>) => {
      domApi.setNodeAttribute(
        value,
        'api',
        event.target.value ? (event.target.value as NodeId) : null,
      );
    },
    [domApi, value],
  );

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle>Edit Query State ({nodeId})</DialogTitle>
      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
}

export default function QueryStateEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedStateNode, setEditedState] = React.useState<NodeId | null>(null);
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId);
  studioDom.assertIsPage(page);
  const { queryStates = [] } = studioDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'queryState', {
      api: null,
      props: {},
    });
    domApi.addNode(stateNode, page, 'queryStates');
    setEditedState(stateNode.id);
  }, [dom, domApi, page]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);
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
        <EditQueryStateDialog
          nodeId={lastEditedStateNode}
          open={!!editedStateNode}
          onClose={handleEditStateDialogClose}
        />
      ) : null}
    </Stack>
  );
}
