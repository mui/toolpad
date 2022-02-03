import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
} from '@mui/material';
import React from 'react';
import { ArgTypeDefinition } from '@mui/studio-core';
import useLatest from '../../../utils/useLatest';
import { useDom, useDomApi } from '../../DomProvider';
import { usePageEditorState } from './PageEditorProvider';
import * as studioDom from '../../../studioDom';
import { NodeId, StudioBindable } from '../../../types';
import { WithControlledProp } from '../../../utils/types';
import { BindableEditor } from './ComponentPropEditor';

const URL_ARGTYPE: ArgTypeDefinition = {
  typeDef: { type: 'string' },
};

interface FetchedStateNodeEditorProps extends WithControlledProp<studioDom.StudioFetchedStateNode> {
  nodeId: NodeId;
}

function FetchedStateNodeEditor({ nodeId, value, onChange }: FetchedStateNodeEditorProps) {
  const handleUrlChange = React.useCallback(
    (newUrl: StudioBindable<string> | null) => {
      onChange({ ...value, url: newUrl || { type: 'const', value: '' } });
    },
    [onChange, value],
  );

  return (
    <div>
      <BindableEditor
        label="url"
        nodeId={nodeId}
        argType={URL_ARGTYPE}
        value={value.url}
        onChange={handleUrlChange}
      />
    </div>
  );
}

export interface FetchedStateEditorProps {
  pageNodeId: NodeId;
}

export default function FetchedStateEditor({ pageNodeId }: FetchedStateEditorProps) {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [editedStateNode, setEditedState] = React.useState<studioDom.StudioFetchedStateNode | null>(
    null,
  );
  const handleEditStateDialogClose = React.useCallback(() => setEditedState(null), []);

  const page = studioDom.getNode(dom, state.nodeId);
  studioDom.assertIsPage(page);
  const { fetchedStates = [] } = studioDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    const stateNode = studioDom.createNode(dom, 'fetchedState', {
      url: { type: 'const', value: '' },
      collectionPath: '.',
      fieldPaths: {},
    });
    setEditedState(stateNode);
  }, [dom]);

  // To keep it around during closing animation
  const lastEditedStateNode = useLatest(editedStateNode);

  const handleSave = React.useCallback(() => {
    if (editedStateNode?.parentId) {
      domApi.saveNode(editedStateNode);
    } else if (editedStateNode) {
      domApi.addNode(editedStateNode, page, 'fetchedStates');
    }
    handleEditStateDialogClose();
  }, [domApi, editedStateNode, handleEditStateDialogClose, page]);

  const handleRemove = React.useCallback(() => {
    if (editedStateNode) {
      domApi.removeNode(editedStateNode.id);
    }
    handleEditStateDialogClose();
  }, [editedStateNode, handleEditStateDialogClose, domApi]);

  console.log(pageNodeId);

  return (
    <Stack spacing={1} alignItems="start">
      <Button color="inherit" onClick={handleCreate}>
        create fetched state
      </Button>
      <List>
        {fetchedStates.map((stateNode) => {
          return (
            <ListItem key={stateNode.id} button onClick={() => setEditedState(stateNode)}>
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
          <DialogTitle>Edit Fetched State ({lastEditedStateNode.id})</DialogTitle>
          <DialogContent>
            <FetchedStateNodeEditor
              nodeId={pageNodeId}
              value={lastEditedStateNode}
              onChange={(newValue) => setEditedState(newValue)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSave}>Save</Button>
            {lastEditedStateNode.parentId ? <Button onClick={handleRemove}>Remove</Button> : null}
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
