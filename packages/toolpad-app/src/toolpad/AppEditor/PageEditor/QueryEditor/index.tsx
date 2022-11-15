import {
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  DialogActions,
  ListItemText,
  IconButton,
  styled,
  ListItemButton,
} from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import clsx from 'clsx';
import { usePageEditorState } from '../PageEditorProvider';
import * as appDom from '../../../../appDom';
import dataSources from '../../../../toolpadDataSources/client';
import { useDom, useDomApi } from '../../../DomLoader';
import ConnectionSelect, { ConnectionOption } from '../ConnectionSelect';
import NodeMenu from '../../NodeMenu';
import QueryNodeEditorDialog from './QueryEditorDialog';

interface DataSourceSelectorProps<Q> {
  open: boolean;
  onClose: () => void;
  onCreated: (newNode: appDom.QueryNode<Q>) => void;
}

function ConnectionSelectorDialog<Q>({ open, onCreated, onClose }: DataSourceSelectorProps<Q>) {
  const dom = useDom();

  const [input, setInput] = React.useState<ConnectionOption | null>(null);

  const handleCreateClick = React.useCallback(() => {
    invariant(input, `Create button should be disabled when there's no input`);

    const { connectionId = null, dataSourceId } = input;

    if (connectionId) {
      const connection = appDom.getMaybeNode(dom, connectionId, 'connection');
      invariant(connection, `Selected non-existing connection "${connectionId}"`);
    }

    const dataSource = dataSources[dataSourceId];
    invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);

    const queryNode = appDom.createNode(dom, 'query', {
      attributes: {
        query: appDom.createConst(dataSource.getInitialQueryValue()),
        connectionId: appDom.createConst(appDom.ref(connectionId)),
        dataSource: appDom.createConst(dataSourceId),
      },
    });

    onCreated(queryNode);
  }, [dom, input, onCreated]);

  return (
    <Dialog fullWidth open={open} onClose={onClose} scroll="body">
      <DialogTitle>Create Query</DialogTitle>
      <DialogContent>
        <ConnectionSelect sx={{ my: 1 }} value={input} onChange={setInput} />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!input} onClick={handleCreateClick}>
          Create query
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const classes = {
  listItemMenuButton: 'Toolpad__QueryListItem',
  listItemMenuOpen: 'Toolpad__QueryListItemMenuOpen',
};

const QueryListItem = styled(ListItem)({
  [`& .${classes.listItemMenuButton}`]: {
    visibility: 'hidden',
  },
  [`
    &:hover .${classes.listItemMenuButton}, 
    & .${classes.listItemMenuOpen}
  `]: {
    visibility: 'visible',
  },
});

type DialogState =
  | {
      node?: undefined;
      isDraft?: undefined;
    }
  | {
      node: appDom.QueryNode;
      isDraft: boolean;
    };

export default function QueryEditor() {
  const dom = useDom();
  const state = usePageEditorState();
  const domApi = useDomApi();

  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);

  const handleEditStateDialogClose = React.useCallback(() => setDialogState(null), []);

  const page = appDom.getNode(dom, state.nodeId, 'page');
  const { queries = [] } = appDom.getChildNodes(dom, page) ?? [];

  const handleCreate = React.useCallback(() => {
    setDialogState({});
  }, []);

  const handleCreated = React.useCallback((node: appDom.QueryNode) => {
    setDialogState({ node, isDraft: true });
  }, []);

  const handleSave = React.useCallback(
    (node: appDom.QueryNode) => {
      if (appDom.nodeExists(dom, node.id)) {
        domApi.saveNode(node);
      } else {
        domApi.addNode(node, page, 'queries');
      }
      setDialogState({
        node,
        isDraft: false,
      });
    },
    [dom, domApi, page],
  );

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId) => {
      domApi.removeNode(nodeId);
      handleEditStateDialogClose();
    },
    [domApi, handleEditStateDialogClose],
  );

  const handleRemove = React.useCallback(
    (node: appDom.QueryNode) => handleDeleteNode(node.id),
    [handleDeleteNode],
  );

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId, 'query');
      invariant(
        page,
        'handleDuplicateNode should only be used for queries, which should always belong to a page',
      );
      const existingNames = appDom.getExistingNamesForChildren(dom, page);
      const newName = appDom.proposeName(node.name, existingNames);
      const copy = appDom.createNode(dom, 'query', { ...node, name: newName });
      setDialogState({ node: copy, isDraft: true });
    },
    [dom, page],
  );

  return (
    <Stack spacing={1} alignItems="start" sx={{ width: '100%' }}>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        Add query
      </Button>
      <List sx={{ width: '100%' }}>
        {queries.map((queryNode) => {
          return (
            <QueryListItem
              key={queryNode.id}
              disablePadding
              onClick={() => setDialogState({ node: queryNode, isDraft: false })}
              secondaryAction={
                <NodeMenu
                  renderButton={({ buttonProps, menuProps }) => (
                    <IconButton
                      className={clsx(classes.listItemMenuButton, {
                        [classes.listItemMenuOpen]: menuProps.open,
                      })}
                      edge="end"
                      aria-label="Open query menu"
                      {...buttonProps}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                  nodeId={queryNode.id}
                  deleteLabelText="Delete"
                  duplicateLabelText="Duplicate"
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                />
              }
            >
              <ListItemButton>
                <ListItemText primaryTypographyProps={{ noWrap: true }} primary={queryNode.name} />
              </ListItemButton>
            </QueryListItem>
          );
        })}
      </List>
      {dialogState?.node ? (
        <QueryNodeEditorDialog
          open={!!dialogState}
          node={dialogState.node}
          isDraft={dialogState.isDraft}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={handleEditStateDialogClose}
        />
      ) : (
        <ConnectionSelectorDialog
          open={!!dialogState}
          onCreated={handleCreated}
          onClose={handleEditStateDialogClose}
        />
      )}
    </Stack>
  );
}
