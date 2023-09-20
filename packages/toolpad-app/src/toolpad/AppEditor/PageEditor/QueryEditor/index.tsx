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
  ButtonBase,
  Popover,
  Paper,
  Typography,
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
import { useAppStateApi, useAppState, useDomApi } from '../../../AppState';
import NodeMenu from '../../NodeMenu';
import QueryNodeEditorDialog from './QueryEditorDialog';

const DataSourceButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: 150,
  height: 70,
  border: 1,
  borderColor: 'divider',
  borderStyle: 'solid',
  color: 'text.secondary',
  padding: theme.spacing(1),
  borderRadius: 8,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface DataSourceSelectorProps<Q> {
  open: boolean;
  onClose: () => void;
  onCreated: (newNode: appDom.QueryNode<Q>) => void;
}

function ConnectionSelectorDialog<Q>({ open, onCreated, onClose }: DataSourceSelectorProps<Q>) {
  const { dom } = useAppState();

  const handleCreateClick = React.useCallback(
    (dataSourceId: string) => () => {
      const dataSource = dataSources[dataSourceId];
      invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);

      const queryNode = appDom.createNode(dom, 'query', {
        attributes: {
          query: dataSource.getInitialQueryValue(),
          connectionId: null,
          dataSource: dataSourceId,
        },
      });

      onCreated(queryNode);
    },
    [dom, onCreated],
  );

  return (
    <Dialog open={open} onClose={onClose} scroll="body">
      <DialogTitle>Create Query</DialogTitle>
      <DialogContent>
        <Stack direction="row" gap={1}>
          <DataSourceButton onClick={handleCreateClick('local')}>Local function</DataSourceButton>
          <DataSourceButton onClick={handleCreateClick('rest')}>Fetch</DataSourceButton>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancel
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
  const { dom } = useAppState();
  const { currentView } = useAppState();
  const state = usePageEditorState();

  const appStateApi = useAppStateApi();
  const domApi = useDomApi();

  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);
  const isDraft = dialogState?.isDraft || false;

  const page = appDom.getNode(dom, state.nodeId, 'page');
  const { queries = [] } = appDom.getChildNodes(dom, page) ?? [];

  const handleEditStateDialogClose = React.useCallback(() => {
    if (isDraft) {
      setDialogState(null);
    } else {
      appStateApi.setView({ kind: 'page', nodeId: page.id });
    }
  }, [appStateApi, isDraft, page.id]);

  const handleCreated = React.useCallback((node: appDom.QueryNode) => {
    setDialogState({ node, isDraft: true });
  }, []);

  const handleSave = React.useCallback(
    (node: appDom.QueryNode) => {
      if (appDom.nodeExists(dom, node.id)) {
        domApi.saveNode(node);
      } else {
        appStateApi.update((draft) => appDom.addNode(draft, node, page, 'queries'));
      }
    },
    [dom, domApi, appStateApi, page],
  );

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId) => {
      appStateApi.update((draft) => appDom.removeNode(draft, nodeId), {
        kind: 'page',
        nodeId: page.id,
      });
    },
    [appStateApi, page.id],
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

  React.useEffect(() => {
    setDialogState((previousState) => {
      if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
        const node = appDom.getNode(dom, currentView.view?.nodeId, 'query');
        return { node, isDraft: false };
      }

      if (isDraft) {
        return previousState;
      }

      return null;
    });
  }, [currentView, dom, isDraft]);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const handleCreate = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleCreateClick = React.useCallback(
    (dataSourceId: string) => () => {
      const dataSource = dataSources[dataSourceId];
      invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);

      const node = appDom.createNode(dom, 'query', {
        attributes: {
          query: dataSource.getInitialQueryValue(),
          connectionId: null,
          dataSource: dataSourceId,
        },
      });

      setAnchorEl(null);
      setDialogState({ node, isDraft: true });
    },
    [dom],
  );

  return (
    <Stack spacing={1} alignItems="start" sx={{ width: '100%' }}>
      <Button color="inherit" startIcon={<AddIcon />} onClick={handleCreate}>
        Add query
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography sx={{ mb: 2 }}>Make backend data available as state on the page.</Typography>
          <Stack direction="row" gap={1}>
            <DataSourceButton onClick={handleCreateClick('local')}>
              Custom function
            </DataSourceButton>
            <DataSourceButton onClick={handleCreateClick('rest')}>HTTP request</DataSourceButton>
          </Stack>
        </Paper>
      </Popover>
      <List sx={{ width: '100%' }}>
        {queries.map((queryNode) => {
          return (
            <QueryListItem
              key={queryNode.id}
              disablePadding
              onClick={() => {
                appStateApi.setView({
                  kind: 'page',
                  nodeId: page.id,
                  view: { kind: 'query', nodeId: queryNode.id },
                });
              }}
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
          isDraft={isDraft}
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
