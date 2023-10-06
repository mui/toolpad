import * as React from 'react';
import clsx from 'clsx';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import {
  styled,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Popover,
  Stack,
  Paper,
  SxProps,
} from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as appDom from '../../../../appDom';
import dataSources from '../../../../toolpadDataSources/client';
import QueryIcon from '../../QueryIcon';
import { useAppState, useAppStateApi } from '../../../AppState';
import NodeMenu from '../../NodeMenu';

const classes = {
  treeItemMenuButton: 'Toolpad__QueryListItem',
  treeItemMenuOpen: 'Toolpad__QueryListItemMenuOpen',
};

const StyledTreeItem = styled(TreeItem)({
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

type StyledTreeItemProps = TreeItemProps & {
  onDeleteNode?: (nodeId: NodeId) => void;
  onDuplicateNode?: (nodeId: NodeId) => void;
  onSelectNode?: (nodeId: NodeId) => void;
  onCreate?: (event: React.MouseEvent, mode?: appDom.FetchMode) => void;
  labelText: string;
  labelIconId?: string;
  labelIconSx?: SxProps;
  createLabelText?: string;
  deleteLabelText?: string;
  renameLabelText?: string;
  duplicateLabelText?: string;
  toolpadNodeId?: NodeId;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const {
    labelText,
    labelIconSx,
    labelIconId,
    onCreate,
    onSelectNode,
    onDeleteNode,
    onDuplicateNode,
    createLabelText,
    deleteLabelText = 'Delete',
    duplicateLabelText = 'Duplicate',
    renameLabelText = 'Rename',
    toolpadNodeId,
    ...other
  } = props;

  const handleClick = React.useCallback(() => {
    if (props.nodeId === ':query' || props.nodeId === ':mutation') {
      return;
    }
    invariant(
      toolpadNodeId,
      'HierarchyTreeItem should only be used for nodes with a toolpadNodeId',
    );
    onSelectNode?.(toolpadNodeId);
  }, [onSelectNode, toolpadNodeId, props.nodeId]);

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
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.1, pr: 0 }} onClick={handleClick}>
          <QueryIcon
            id={labelIconId || 'query'}
            sx={{ fontSize: 28, mt: 0.1, ml: -1, ...labelIconSx }}
          />
          <Typography
            variant="body2"
            sx={{ flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            {labelText}
          </Typography>
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
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
            />
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

interface CreateQueryPopoverProps {
  anchorEl: Element | null;
  createPopoverOpen: boolean;
  handleCreateNode: (dataSourceId: string, createMode?: appDom.FetchMode) => () => void;
  handleCreateClose: () => void;
  createMode: appDom.FetchMode | undefined;
}

function CreateQueryPopover({
  anchorEl,
  createPopoverOpen,
  handleCreateNode,
  handleCreateClose,
  createMode,
}: CreateQueryPopoverProps) {
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
          Make backend data available as state on the page through{' '}
          {createMode === 'mutation' ? (
            <React.Fragment>
              a{' '}
              <Tooltip
                title="Manual queries are only run when triggered by an action"
                placement="right"
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    cursor: 'help',
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                  component={'span'}
                >
                  manual
                </Typography>
              </Tooltip>
            </React.Fragment>
          ) : (
            <React.Fragment>
              an{' '}
              <Tooltip
                title="Queries are automatically fetched at a set interval"
                placement="right"
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    cursor: 'help',
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                  component={'span'}
                >
                  automatic
                </Typography>
              </Tooltip>
            </React.Fragment>
          )}{' '}
          query.
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
                <QueryIcon id={dataSourceId} sx={{ fontSize: 28, mr: 0.5, mt: 0.1 }} />{' '}
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

  const queries = React.useMemo(() => {
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

  const manualQueries = React.useMemo(() => {
    return queries.filter((query) => query.attributes?.mode === 'mutation');
  }, [queries]);

  const automaticQueries = React.useMemo(() => {
    return queries.filter((query) => query.attributes?.mode === 'query' || !query.attributes?.mode);
  }, [queries]);

  const handleQuerySelect = React.useCallback(
    (selectedQueryId: NodeId) => {
      appStateApi.openQueryTab(selectedQueryId);
    },
    [appStateApi],
  );

  const [createMode, setCreateMode] = React.useState<appDom.FetchMode | undefined>('query');

  const handleCreateClick = React.useCallback(
    (event: React.MouseEvent, mode?: appDom.FetchMode) => {
      event.stopPropagation();
      setCreateMode(mode);
      setAnchorEl(event.currentTarget);
    },
    [],
  );

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
      const selectedQueryIndex = queries.findIndex((query) => query.id === selectedQueryId);
      appStateApi.closeQueryTab(selectedQueryIndex, selectedQueryId, true);
    },
    [appStateApi, queries],
  );

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId, 'query');
      invariant(
        currentPageId,
        'handleDuplicateNode should only be used for queries, which should always belong to a page',
      );
      const currentPageNode = appDom.getNode(dom, currentPageId, 'page');
      const existingNames = appDom.getExistingNamesForChildren(dom, currentPageNode);
      const newName = appDom.proposeName(node.name, existingNames);
      const copy = appDom.createNode(dom, 'query', { ...node, name: newName });
      appStateApi.update((draft) => appDom.addNode(draft, copy, currentPageNode, 'queries'), {
        kind: 'page',
        nodeId: currentPageId,
        view: { kind: 'query', nodeId: copy.id },
      });
    },
    [dom, currentPageId, appStateApi],
  );

  return (
    <React.Fragment>
      <TreeView
        aria-label="queries explorer"
        defaultExpanded={[':queries', ':query', ':mutation']}
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
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <HierarchyTreeItem
          nodeId=":queries"
          aria-level={1}
          labelText="Queries"
          createLabelText="Create query"
        >
          <HierarchyTreeItem
            nodeId=":mutation"
            aria-level={2}
            labelText="Manual"
            labelIconId="manual"
            labelIconSx={{ fontSize: 16, mr: 1, ml: 0, opacity: 0.75 }}
            createLabelText="Create manual query"
            onCreate={handleCreateClick}
          >
            {manualQueries.map((queryNode) => (
              <HierarchyTreeItem
                key={queryNode.id}
                nodeId={queryNode.id}
                toolpadNodeId={queryNode.id}
                aria-level={2}
                labelText={queryNode.name}
                labelIconId={queryNode.attributes?.dataSource}
                onDuplicateNode={handleDuplicateNode}
                onDeleteNode={handleDeleteNode}
                onSelectNode={handleQuerySelect}
              />
            ))}
          </HierarchyTreeItem>
          <HierarchyTreeItem
            nodeId=":query"
            aria-level={3}
            labelIconId="automatic"
            labelText="Automatic"
            labelIconSx={{ fontSize: 16, mr: 1, ml: 0, opacity: 0.75 }}
            createLabelText="Create automatic query"
            onCreate={handleCreateClick}
          >
            {automaticQueries.map((queryNode) => (
              <HierarchyTreeItem
                key={queryNode.id}
                nodeId={queryNode.id}
                toolpadNodeId={queryNode.id}
                aria-level={2}
                labelText={queryNode.name}
                labelIconId={queryNode.attributes?.dataSource}
                onDuplicateNode={handleDuplicateNode}
                onDeleteNode={handleDeleteNode}
                onSelectNode={handleQuerySelect}
              />
            ))}
          </HierarchyTreeItem>
        </HierarchyTreeItem>
      </TreeView>
      <CreateQueryPopover
        anchorEl={anchorEl}
        createPopoverOpen={createPopoverOpen}
        handleCreateNode={handleCreateNode}
        handleCreateClose={handleCreateClose}
        createMode={createMode}
      />
    </React.Fragment>
  );
}
