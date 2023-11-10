import * as React from 'react';
import clsx from 'clsx';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import {
  styled,
  Box,
  Button,
  IconButton,
  Typography,
  Divider,
  Popover,
  Stack,
  Paper,
  SxProps,
} from '@mui/material';
import { TreeView, treeItemClasses } from '@mui/x-tree-view';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as appDom from '../../../../appDom';
import dataSources from '../../../../toolpadDataSources/client';
import QueryIcon from '../../QueryIcon';
import { useAppState, useAppStateApi } from '../../../AppState';
import useBoolean from '../../../../utils/useBoolean';
import EditableTreeItem, { EditableTreeItemProps } from '../../../../components/EditableTreeItem';
import NodeMenu from '../../NodeMenu';
import ExplorerHeader from '../../ExplorerHeader';

const classes = {
  treeItemMenuButton: 'Toolpad__QueryListItem',
  treeItemMenuOpen: 'Toolpad__QueryListItemMenuOpen',
};

const StyledTreeItem = styled(EditableTreeItem)({
  [`& .${classes.treeItemMenuButton}`]: {
    visibility: 'hidden',
  },
  [`
  & .${treeItemClasses.content}:hover .${classes.treeItemMenuButton},
      & .${classes.treeItemMenuOpen}
    `]: {
    visibility: 'visible',
  },
});

interface StyledTreeItemProps extends EditableTreeItemProps {
  onDeleteNode?: (nodeId: NodeId) => void;
  onDuplicateNode?: (nodeId: NodeId) => void;
  onRenameNode?: (nodeId: NodeId, updatedName: string) => void;
  onSelectNode?: (nodeId: NodeId) => void;
  onCreate?: (event: React.MouseEvent, mode?: appDom.FetchMode) => void;
  labelTextSx?: SxProps;
  labelIconId?: string;
  labelIconSx?: SxProps;
  createLabelText?: string;
  deleteLabelText?: string;
  renameLabelText?: string;
  duplicateLabelText?: string;
  toolpadNodeId?: NodeId;
}

function DataTreeItem(props: StyledTreeItemProps) {
  const {
    nodeId,
    labelText,
    labelTextSx,
    labelIconSx,
    labelIconId,
    onCreate,
    onSelectNode,
    onDeleteNode,
    onDuplicateNode,
    onRenameNode,
    createLabelText,
    deleteLabelText = 'Delete',
    duplicateLabelText = 'Duplicate',
    renameLabelText = 'Rename',
    toolpadNodeId,
    validateItemName,
    ...other
  } = props;

  const { value: isEditing, setTrue: startEditing, setFalse: stopEditing } = useBoolean(false);

  const handleRenameConfirm = React.useCallback(
    (updatedName: string) => {
      if (onRenameNode) {
        onRenameNode(nodeId as NodeId, updatedName);
        stopEditing();
      }
    },
    [nodeId, onRenameNode, stopEditing],
  );

  const validateEditableQueryName = React.useCallback(
    (newName: string) => {
      if (newName !== labelText && validateItemName) {
        return validateItemName(newName);
      }
      return { isValid: true };
    },
    [labelText, validateItemName],
  );

  const handleClick = React.useCallback(() => {
    invariant(toolpadNodeId, 'DataTreeItem should only be used for nodes with a toolpadNodeId');
    onSelectNode?.(toolpadNodeId);
  }, [onSelectNode, toolpadNodeId]);

  const queryCreationMode = React.useMemo(() => {
    if (props.nodeId === ':query') {
      return 'query';
    }
    if (props.nodeId === ':mutation') {
      return 'mutation';
    }
    return undefined;
  }, [props.nodeId]);

  return (
    <StyledTreeItem
      nodeId={nodeId}
      labelText={labelText}
      renderLabel={(children) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={handleClick}>
          <QueryIcon id={labelIconId || 'query'} sx={{ fontSize: 24, my: 0, ...labelIconSx }} />
          {children}
          {onCreate ? (
            <IconButton
              aria-label={createLabelText}
              onClick={(event) => {
                onCreate(event, queryCreationMode);
              }}
              size="small"
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          ) : null}
          {toolpadNodeId ? (
            <NodeMenu
              renderButton={({ buttonProps, menuProps }) => (
                <IconButton
                  className={clsx(classes.treeItemMenuButton, {
                    [classes.treeItemMenuOpen]: menuProps.open,
                  })}
                  aria-label="Open hierarchy menu"
                  size="small"
                  {...buttonProps}
                >
                  <MoreVertIcon fontSize="inherit" />
                </IconButton>
              )}
              nodeId={toolpadNodeId}
              deleteLabelText={deleteLabelText}
              duplicateLabelText={duplicateLabelText}
              renameLabelText={renameLabelText}
              onRenameNode={startEditing}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
            />
          ) : null}
        </Box>
      )}
      suggestedNewItemName={labelText}
      onCancel={stopEditing}
      isEditing={isEditing}
      {...(onRenameNode ? { onEdit: handleRenameConfirm } : {})}
      validateItemName={validateEditableQueryName}
      {...other}
    />
  );
}

interface CreatePopoverProps {
  anchorEl: Element | null;
  createPopoverOpen: boolean;
  handleCreateNode: (dataSourceId: string, createMode?: appDom.FetchMode) => () => void;
  handleCreateClose: () => void;
  createMode: appDom.FetchMode | undefined;
}

function CreatePopover({
  anchorEl,
  createPopoverOpen,
  handleCreateNode,
  handleCreateClose,
  createMode,
}: CreatePopoverProps) {
  return (
    <Popover
      open={createPopoverOpen}
      anchorEl={anchorEl}
      onClose={handleCreateClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Paper sx={{ p: 2, maxWidth: 500 }}>
        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          {createMode === 'query'
            ? 'Make backend data available as state on the page'
            : 'Run an action on the page'}
        </Typography>
        <Stack direction="row" gap={1} display={'grid'} gridTemplateColumns={'1fr 1fr'}>
          {Object.keys(dataSources).map((dataSourceId) => {
            const dataSource = dataSources[dataSourceId];
            return dataSource?.isEnabled ? (
              <Button
                key={dataSourceId}
                sx={{ minHeight: 50, minWidth: 150 }}
                variant="outlined"
                onClick={handleCreateNode(dataSourceId, createMode)}
              >
                <QueryIcon id={dataSourceId} sx={{ fontSize: 28 }} />{' '}
                {dataSource?.displayName || dataSourceId}
              </Button>
            ) : null;
          })}
        </Stack>
      </Paper>
    </Popover>
  );
}

export function QueriesExplorer() {
  const { dom, currentView } = useAppState();
  const appStateApi = useAppStateApi();
  const currentPageId = currentView.nodeId;

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const queryNodes = React.useMemo(() => {
    if (!currentPageId) {
      return [];
    }
    if (currentPageId) {
      const currentPageNode = appDom.getNode(dom, currentPageId, 'page');
      if (currentPageNode) {
        return appDom.getChildNodes(dom, currentPageNode).queries ?? [];
      }
    }
    return [];
  }, [currentPageId, dom]);

  const queries = React.useMemo(() => {
    return queryNodes.filter(
      (query) => query.attributes?.mode === 'query' || !query.attributes?.mode,
    );
  }, [queryNodes]);

  const actions = React.useMemo(() => {
    return queryNodes.filter((query) => query.attributes?.mode === 'mutation');
  }, [queryNodes]);

  const handleQuerySelect = React.useCallback(
    (selectedQueryId: NodeId) => {
      appStateApi.openQueryTab(selectedQueryId);
    },
    [appStateApi],
  );

  const [createMode, setCreateMode] = React.useState<appDom.FetchMode | undefined>('query');

  const handleCreateQueryClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateMode('query');
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCreateActionClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateMode('mutation');
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCreateClose = () => {
    setAnchorEl(null);
  };

  const createPopoverOpen = Boolean(anchorEl);

  const handleCreateNode = React.useCallback(
    (dataSourceId: string, mode?: appDom.FetchMode) => () => {
      const dataSource = dataSources[dataSourceId];
      invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);
      invariant(
        currentPageId,
        'handleCreateNode should only be used for queries, which should always belong to a page',
      );

      appStateApi.createQueryTab(dataSource, dataSourceId, mode);
      setAnchorEl(null);
    },
    [currentPageId, appStateApi],
  );

  const handleDeleteNode = React.useCallback(
    (selectedQueryId: NodeId) => {
      const selectedQueryTabIndex = currentView.queryPanel?.queryTabs?.findIndex(
        (tab) => tab.meta?.id === selectedQueryId,
      );

      appStateApi.closeQueryTab(selectedQueryId, selectedQueryTabIndex, true);
    },
    [appStateApi, currentView],
  );

  const existingNames = React.useMemo(() => {
    if (!currentPageId) {
      return undefined;
    }
    const currentPageNode = appDom.getNode(dom, currentPageId, 'page');
    return appDom.getExistingNamesForChildren(dom, currentPageNode);
  }, [currentPageId, dom]);

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId, 'query');
      invariant(
        currentPageId,
        'handleDuplicateNode should only be used for queries, which should always belong to a page',
      );
      const currentPageNode = appDom.getNode(dom, currentPageId, 'page');

      const newName = appDom.proposeName(node.name, existingNames);
      const copy = appDom.createNode(dom, 'query', { ...node, name: newName });
      appStateApi.update((draft) => appDom.addNode(draft, copy, currentPageNode, 'queries'), {
        kind: 'page',
        nodeId: currentPageId,
        view: { kind: 'query', nodeId: copy.id },
      });
    },
    [dom, currentPageId, existingNames, appStateApi],
  );

  const validateName = React.useCallback(
    (queryName: string) => {
      if (!existingNames) {
        return {
          isValid: true,
        };
      }

      const validationErrorMessage = appDom.validateNodeName(queryName, existingNames, 'query');
      return {
        isValid: !validationErrorMessage,
        ...(validationErrorMessage ? { errorMessage: validationErrorMessage } : {}),
      };
    },
    [existingNames],
  );

  const handleRenameNode = React.useCallback(
    (nodeId: NodeId, updatedName: string) => {
      const node = appDom.getNode(dom, nodeId, 'query');
      appStateApi.update((draft) => appDom.setNodeName(draft, node, updatedName), {
        ...currentView,
        queryPanel: {
          ...currentView.queryPanel,
          queryTabs: currentView.queryPanel?.queryTabs?.map((tab) => {
            if (tab?.meta?.id === nodeId) {
              return {
                ...tab,
                meta: {
                  ...tab.meta,
                  name: updatedName,
                },
              };
            }
            return tab;
          }),
        },
      });
    },
    [dom, appStateApi, currentView],
  );

  return (
    <Box sx={{ maxHeight: '100%', overflowY: 'auto' }} data-testid="queries-explorer">
      <ExplorerHeader
        headerIcon={<QueryIcon mode="query" />}
        headerText="Queries"
        onCreate={handleCreateQueryClick}
        createLabelText="Create new query"
      />
      <TreeView
        aria-label="queries explorer"
        defaultExpanded={[':queries']}
        selected={
          currentView.kind === 'page' && currentView.view?.kind === 'query'
            ? currentView.view.nodeId
            : ''
        }
        defaultCollapseIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
        defaultExpandIcon={<ChevronRightIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
        sx={{
          flexGrow: 1,
          maxWidth: 400,
        }}
      >
        {queries.map((query) => (
          <DataTreeItem
            key={query.id}
            nodeId={query.id}
            toolpadNodeId={query.id}
            aria-level={1}
            aria-label={query.name}
            labelText={query.name}
            labelTextSx={{ fontSize: 13 }}
            labelIconId={query.attributes?.dataSource}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleQuerySelect}
            onRenameNode={handleRenameNode}
            validateItemName={validateName}
          />
        ))}
      </TreeView>
      <Divider />
      <ExplorerHeader
        headerIcon={<QueryIcon mode="mutation" />}
        headerText="Actions"
        onCreate={handleCreateActionClick}
        createLabelText="Create new action"
      />
      <TreeView
        aria-label="actions explorer"
        defaultExpanded={[':actions']}
        selected={
          currentView.kind === 'page' && currentView.view?.kind === 'query'
            ? currentView.view.nodeId
            : ''
        }
        defaultCollapseIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
        defaultExpandIcon={<ChevronRightIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
        sx={{
          flexGrow: 1,
          maxWidth: 400,
        }}
      >
        {actions.map((action) => (
          <DataTreeItem
            key={action.id}
            nodeId={action.id}
            toolpadNodeId={action.id}
            aria-level={1}
            labelText={action.name}
            labelTextSx={{ fontSize: 13 }}
            labelIconId={action.attributes?.dataSource}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleQuerySelect}
            onRenameNode={handleRenameNode}
            validateItemName={validateName}
          />
        ))}
      </TreeView>
      <CreatePopover
        anchorEl={anchorEl}
        createPopoverOpen={createPopoverOpen}
        handleCreateNode={handleCreateNode}
        handleCreateClose={handleCreateClose}
        createMode={createMode}
      />
    </Box>
  );
}
