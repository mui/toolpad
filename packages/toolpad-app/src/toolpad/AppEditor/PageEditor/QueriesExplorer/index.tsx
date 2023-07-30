import * as React from 'react';
import clsx from 'clsx';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import { styled, Box, Button, IconButton, Typography, Popover, Stack, Paper } from '@mui/material';
import { TreeView, TreeItem, TreeItemProps, treeItemClasses } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as appDom from '../../../../appDom';
import dataSources from '../../../../toolpadDataSources/client';
import QueryIcon from '../../QueryIcon';
import { useDom, useDomApi, useAppState, useAppStateApi } from '../../../AppState';
import { DomView } from '../../../../utils/domView';
import NodeMenu from '../../NodeMenu';
import EditableText from '../../../../components/EditableText';
import { QueryMeta, PanelState } from './types';
import QueryEditor from './QueryEditor2';
import { useNodeNameValidation } from '../../HierarchyExplorer/validation';

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
  handleDeleteNode?: (
    nodeId: NodeId,
    onDelete?: (viewOptions: DomView, nodeId?: NodeId) => void,
  ) => void;
  onDelete?: (viewOptions: DomView, nodeId?: NodeId) => void;
  onDuplicateNode?: (nodeId: NodeId) => void;
  onSelectNode?: (nodeId: NodeId) => void;
  onCreate?: React.MouseEventHandler;
  labelText: string;
  labelIconId?: string;
  createLabelText?: string;
  deleteLabelText?: string;
  renameLabelText?: string;
  duplicateLabelText?: string;
  toolpadNodeId?: NodeId;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const {
    labelText,
    labelIconId,
    onCreate,
    onSelectNode,
    handleDeleteNode,
    onDelete,
    onDuplicateNode,
    createLabelText,
    deleteLabelText = 'Delete',
    duplicateLabelText = 'Duplicate',
    renameLabelText = 'Rename',
    toolpadNodeId,
    ...other
  } = props;

  const handleClick = React.useCallback(() => {
    invariant(
      toolpadNodeId,
      'HierarchyTreeItem should only be used for nodes with a toolpadNodeId',
    );
    onSelectNode?.(toolpadNodeId);
  }, [onSelectNode, toolpadNodeId]);

  const { dom } = useDom();
  const domApi = useDomApi();

  const [queryNameEditable, setQueryNameEditable] = React.useState(false);
  const [queryNameInput, setQueryNameInput] = React.useState(labelText);
  const handleQueryNameChange = React.useCallback(
    (newValue: string) => setQueryNameInput(newValue),
    [],
  );
  const handleStopEditing = React.useCallback(() => {
    setQueryNameInput(labelText);
    setQueryNameEditable(false);
  }, [labelText]);

  const existingNames = React.useMemo(() => {
    if (toolpadNodeId) {
      const node = appDom.getNode(dom, toolpadNodeId);
      if (node) {
        return appDom.getExistingNamesForNode(dom, node);
      }
    }
    return new Set([]);
  }, [dom, toolpadNodeId]);

  const nodeNameError = useNodeNameValidation(queryNameInput, existingNames, 'query');
  const isNameValid = !nodeNameError;

  const handleNameSave = React.useCallback(() => {
    if (isNameValid && toolpadNodeId) {
      setQueryNameInput(queryNameInput);
      domApi.setNodeName(toolpadNodeId, queryNameInput);
    } else {
      setQueryNameInput(labelText);
    }
  }, [isNameValid, domApi, toolpadNodeId, labelText, queryNameInput]);

  return (
    <StyledTreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.1, pr: 0 }} onClick={handleClick}>
          <QueryIcon id={labelIconId || 'query'} sx={{ fontSize: 28, mt: 0.1, ml: -1 }} />
          <EditableText
            value={queryNameInput}
            variant="body2"
            editable={queryNameEditable}
            onDoubleClick={() => setQueryNameEditable(true)}
            onChange={handleQueryNameChange}
            onClose={handleStopEditing}
            onSave={handleNameSave}
            error={!isNameValid}
            helperText={nodeNameError}
            sx={{ flexGrow: 1 }}
          />
          {onCreate ? (
            <IconButton aria-label={createLabelText} onClick={onCreate} size="small">
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
              onDeleteNode={(nodeId) => handleDeleteNode?.(nodeId, onDelete)}
              onDuplicateNode={onDuplicateNode}
              onRenameNode={() => setQueryNameEditable(true)}
            />
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

export function QueriesExplorer() {
  const { dom } = useDom();
  const { currentView } = useAppState();

  const appStateApi = useAppStateApi();
  const currentPageId = currentView.nodeId;

  const tabs = React.useRef(new Map<NodeId, QueryMeta>());

  const currentQueryId = React.useMemo(() => {
    if (currentView.kind === 'page' && currentView.view?.kind === 'query') {
      return currentView.view.nodeId;
    }
    return '';
  }, [currentView]);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const [panelState, setPanelState] = React.useState<PanelState | null>(null);
  const isDraft = panelState?.isDraft || false;

  React.useEffect(() => {
    setPanelState((previousState) => {
      if (!currentQueryId) {
        return null;
      }

      if (isDraft) {
        return previousState;
      }
      const node = appDom.getNode(dom, currentQueryId, 'query');
      tabs.current.set(node.id, { name: node.name, dataSource: node.attributes.dataSource });
      return { node, isDraft: false };

      return null;
    });
  }, [currentQueryId, dom, isDraft]);

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

  const handleQuerySelect = React.useCallback(
    (nodeId: NodeId) => {
      appStateApi.setView({
        kind: 'page',
        nodeId: currentPageId,
        view: { kind: 'query', nodeId },
      });
    },
    [appStateApi, currentPageId],
  );

  const handleCreateClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCreateClose = () => {
    setAnchorEl(null);
  };

  const createPopoverOpen = Boolean(anchorEl);

  const handleCreateNode = React.useCallback(
    (dataSourceId: string) => () => {
      const dataSource = dataSources[dataSourceId];
      invariant(dataSource, `Selected non-existing dataSource "${dataSourceId}"`);
      invariant(
        currentPageId,
        'handleDuplicateNode should only be used for queries, which should always belong to a page',
      );
      const currentPageNode = appDom.getNode(dom, currentPageId, 'page');

      const node = appDom.createNode(dom, 'query', {
        attributes: {
          query: dataSource.getInitialQueryValue(),
          connectionId: null,
          dataSource: dataSourceId,
        },
      });
      appStateApi.update((draft) => appDom.addNode(draft, node, currentPageNode, 'queries'), {
        kind: 'page',
        nodeId: currentPageId,
        view: { kind: 'query', nodeId: node.id },
      });
      setAnchorEl(null);
    },
    [dom, currentPageId, appStateApi],
  );

  const onDelete = React.useCallback(
    (viewOptions: DomView, nodeId?: NodeId) => {
      if (nodeId) {
        appStateApi.update((draft) => appDom.removeNode(draft, nodeId), viewOptions);
      }
    },
    [appStateApi],
  );

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId, onComplete?: (viewOptions: DomView, nodeId?: NodeId) => void) => {
      const viewOptions: DomView = {
        kind: 'page',
        nodeId: currentPageId,
      };
      /*
       * if this is the only tab,
       * or if the query being deleted is not the one open,
       * delete the node and remove the tab, don't change the view
       */
      if (tabs.current.size === 1 || nodeId !== currentQueryId) {
        if (currentQueryId && currentQueryId !== nodeId) {
          viewOptions.view = { kind: 'query', nodeId: currentQueryId };
        }
        onComplete?.(viewOptions, nodeId);
        tabs.current.delete(nodeId);
      } else {
        // if there are multiple tabs open, and
        // the query being deleted is the one open,
        // select the previous tab, or the next tab if there is no previous tab
        const queryIds = Array.from(tabs.current.keys());
        const currentTabIndex = queryIds.findIndex((id) => id === currentQueryId);
        const replacementQueryId = queryIds[currentTabIndex === 0 ? 1 : currentTabIndex - 1];
        if (replacementQueryId) {
          viewOptions.view = { kind: 'query', nodeId: replacementQueryId };
          onComplete?.(viewOptions, nodeId);
          tabs.current.delete(nodeId);
        }
      }
    },
    [tabs, currentPageId, currentQueryId],
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
        defaultExpanded={[':queries']}
        selected={
          currentView.kind === 'page' && currentView.view?.kind === 'query'
            ? currentView.view.nodeId
            : ''
        }
        defaultCollapseIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
        defaultExpandIcon={<ChevronRightIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
      >
        <HierarchyTreeItem
          nodeId=":queries"
          aria-level={1}
          labelText="Queries"
          createLabelText="Create query"
          onCreate={handleCreateClick}
        >
          {queries.map((queryNode) => (
            <HierarchyTreeItem
              key={queryNode.id}
              nodeId={queryNode.id}
              toolpadNodeId={queryNode.id}
              aria-level={2}
              labelText={queryNode.name}
              labelIconId={queryNode.attributes?.dataSource}
              onDuplicateNode={handleDuplicateNode}
              handleDeleteNode={(nodeId) => handleDeleteNode(nodeId, onDelete)}
              onSelectNode={handleQuerySelect}
            />
          ))}
        </HierarchyTreeItem>
      </TreeView>
      <Popover
        open={createPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleCreateClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
            Make backend data available as state on the page.
          </Typography>
          <Stack direction="row" gap={1} display={'grid'} gridTemplateColumns={'1fr 1fr 1fr'}>
            {Object.keys(dataSources).map((dataSourceId) => {
              const dataSource = dataSources[dataSourceId];
              return dataSource?.isEnabled ? (
                <Button
                  key={dataSourceId}
                  sx={{ minHeight: 50, minWidth: 150 }}
                  variant="outlined"
                  onClick={handleCreateNode(dataSourceId)}
                >
                  <QueryIcon id={dataSourceId} sx={{ fontSize: 28, mr: 0.5, mt: 0.1 }} />{' '}
                  {dataSource?.displayName || dataSourceId}
                </Button>
              ) : null;
            })}
          </Stack>
        </Paper>
      </Popover>
      <QueryEditor
        tabs={tabs}
        currentQueryId={currentQueryId}
        currentPageId={currentView.nodeId}
        panelState={panelState}
        handleTabRemove={handleDeleteNode}
      />
    </React.Fragment>
  );
}
