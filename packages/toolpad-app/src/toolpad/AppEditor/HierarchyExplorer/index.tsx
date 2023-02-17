import { TreeView } from '@mui/lab';
import { Typography, styled, Box, IconButton } from '@mui/material';
import * as React from 'react';
import TreeItem, { treeItemClasses, TreeItemProps } from '@mui/lab/TreeItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { NodeId } from '@mui/toolpad-core';
import clsx from 'clsx';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import CreatePageNodeDialog from './CreatePageNodeDialog';
import CreateCodeComponentNodeDialog from './CreateCodeComponentNodeDialog';
import CreateConnectionNodeDialog from './CreateConnectionNodeDialog';
import useLocalStorageState from '../../../utils/useLocalStorageState';
import NodeMenu from '../NodeMenu';
import config from '../../../config';
import { DomView } from '../../../utils/domView';

const HierarchyExplorerRoot = styled('div')({
  overflow: 'auto',
  width: '100%',
});

const classes = {
  treeItemMenuButton: 'Toolpad__HierarchyTreeItem',
  treeItemMenuOpen: 'Toolpad__HierarchyTreeItemMenuOpen',
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
  onSettingsNode?: (nodeId: NodeId) => void;
  onCreate?: React.MouseEventHandler;
  labelIcon?: React.ReactNode;
  labelText: string;
  createLabelText?: string;
  deleteLabelText?: string;
  duplicateLabelText?: string;
  settingsLabelText?: string;
  toolpadNodeId?: NodeId;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const {
    labelIcon,
    labelText,
    onCreate,
    onDeleteNode,
    onDuplicateNode,
    onSettingsNode,
    createLabelText,
    deleteLabelText = 'Delete',
    duplicateLabelText = 'Duplicate',
    settingsLabelText = 'Settings',
    toolpadNodeId,
    ...other
  } = props;

  return (
    <StyledTreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          {labelIcon}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }} noWrap>
            {labelText}
          </Typography>
          {onCreate ? (
            <IconButton aria-label={createLabelText} onClick={onCreate}>
              <AddIcon />
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
                  {...buttonProps}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              nodeId={toolpadNodeId}
              deleteLabelText={deleteLabelText}
              duplicateLabelText={duplicateLabelText}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              onSettingsNode={onSettingsNode}
              settingsLabelText={settingsLabelText}
            />
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

function getNodeEditorDomView(node: appDom.AppDomNode): DomView | undefined {
  switch (node.type) {
    case 'page':
      return { kind: 'page', nodeId: node.id };
    case 'connection':
      return { kind: 'connection', nodeId: node.id };
    case 'codeComponent':
      return { kind: 'codeComponent', nodeId: node.id };
    default:
      return undefined;
  }
}

export interface HierarchyExplorerProps {
  appId: string;
  className?: string;
}

export default function HierarchyExplorer({ appId, className }: HierarchyExplorerProps) {
  const { dom, currentView } = useDom();
  const domApi = useDomApi();

  const app = appDom.getApp(dom);
  const { codeComponents = [], pages = [], connections = [] } = appDom.getChildNodes(dom, app);

  const [expanded, setExpanded] = useLocalStorageState<string[]>(
    `editor/${app.id}/hierarchy-expansion`,
    [':connections', ':pages', ':codeComponents'],
  );

  const activeNode = currentView.nodeId || null;

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds as NodeId[]);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    if (nodeIds.length <= 0) {
      return;
    }

    const rawNodeId = nodeIds[0];
    if (rawNodeId.startsWith(':')) {
      return;
    }

    const selectedNodeId: NodeId = rawNodeId as NodeId;
    const node = appDom.getNode(dom, selectedNodeId);
    if (appDom.isElement(node)) {
      // TODO: sort out in-page selection
      const page = appDom.getPageAncestor(dom, node);
      if (page) {
        domApi.setView({ kind: 'page', nodeId: page.id });
      }
    }

    if (appDom.isPage(node)) {
      domApi.deselectNode();
      domApi.setView({ kind: 'page', nodeId: node.id });
    }

    if (appDom.isCodeComponent(node)) {
      domApi.setView({ kind: 'codeComponent', nodeId: node.id });
    }

    if (appDom.isConnection(node)) {
      domApi.setView({ kind: 'connection', nodeId: node.id });
    }
  };

  const [createConnectionDialogOpen, setCreateConnectionDialogOpen] = React.useState(0);
  const handleCreateConnectionDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateConnectionDialogOpen(Math.random());
  }, []);
  const handleCreateConnectionDialogClose = React.useCallback(
    () => setCreateConnectionDialogOpen(0),
    [],
  );

  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreatePageDialogOpen(Math.random());
  }, []);
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);

  const [createCodeComponentDialogOpen, setCreateCodeComponentDialogOpen] = React.useState(0);
  const handleCreateCodeComponentDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreateCodeComponentDialogOpen(Math.random());
  }, []);
  const handleCreateCodeComponentDialogClose = React.useCallback(
    () => setCreateCodeComponentDialogOpen(0),
    [],
  );

  const handleDeleteNode = React.useCallback(
    (nodeId: NodeId) => {
      let domViewAfterDelete: DomView | undefined;
      if (nodeId === activeNode) {
        const deletedNode = appDom.getNode(dom, nodeId);
        const siblings = appDom.getSiblings(dom, deletedNode);
        const firstSiblingOfType = siblings.find((sibling) => sibling.type === deletedNode.type);
        domViewAfterDelete = firstSiblingOfType && getNodeEditorDomView(firstSiblingOfType);
      }

      domApi.update((draft) => appDom.removeNode(draft, nodeId), {
        view: domViewAfterDelete || { kind: 'page' },
      });
    },
    [activeNode, dom, domApi],
  );

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId);

      invariant(
        node.parentId && node.parentProp,
        'Duplication should never be called on nodes that are not placed in the dom',
      );

      const fragment = appDom.cloneFragment(dom, nodeId);

      const newNode = appDom.getNode(fragment, fragment.root);
      const editorDomView = getNodeEditorDomView(newNode);

      domApi.update(
        (draft) => appDom.addFragment(draft, fragment, node.parentId!, node.parentProp!),
        {
          view: editorDomView || { kind: 'page' },
        },
      );
    },
    [dom, domApi],
  );

  const handlePageSettingsNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId);

      if (appDom.isPage(node)) {
        domApi.update((dom) => dom, {
          view: { kind: 'page', nodeId: node.id },
          selectedNodeId: null,
        });
      }
    },
    [dom, domApi],
  );

  const hasConnectionsView = !config.localMode && !config.isDemo;
  const hasComponentsView = !config.localMode;

  return (
    <HierarchyExplorerRoot data-testid="hierarchy-explorer" className={className}>
      <TreeView
        aria-label="hierarchy explorer"
        selected={activeNode ? [activeNode] : []}
        onNodeSelect={handleSelect}
        expanded={expanded}
        onNodeToggle={handleToggle}
        multiSelect
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
      >
        {hasConnectionsView ? (
          <HierarchyTreeItem
            nodeId=":connections"
            aria-level={1}
            labelText="Connections"
            createLabelText="Create connection"
            onCreate={handleCreateConnectionDialogOpen}
          >
            {connections.map((connectionNode) => (
              <HierarchyTreeItem
                key={connectionNode.id}
                nodeId={connectionNode.id}
                toolpadNodeId={connectionNode.id}
                aria-level={2}
                labelText={connectionNode.name}
                onDuplicateNode={handleDuplicateNode}
                onDeleteNode={handleDeleteNode}
              />
            ))}
          </HierarchyTreeItem>
        ) : null}
        {hasComponentsView ? (
          <HierarchyTreeItem
            nodeId=":codeComponents"
            aria-level={1}
            labelText="Components"
            createLabelText="Create component"
            onCreate={handleCreateCodeComponentDialogOpen}
          >
            {codeComponents.map((codeComponent) => (
              <HierarchyTreeItem
                key={codeComponent.id}
                nodeId={codeComponent.id}
                toolpadNodeId={codeComponent.id}
                aria-level={2}
                labelText={codeComponent.name}
                onDuplicateNode={handleDuplicateNode}
                onDeleteNode={handleDeleteNode}
              />
            ))}
          </HierarchyTreeItem>
        ) : null}
        <HierarchyTreeItem
          nodeId=":pages"
          aria-level={1}
          labelText="Pages"
          createLabelText="Create page"
          onCreate={handleCreatePageDialogOpen}
        >
          {pages.map((page) => (
            <HierarchyTreeItem
              key={page.id}
              nodeId={page.id}
              toolpadNodeId={page.id}
              aria-level={2}
              labelText={page.name}
              onDuplicateNode={handleDuplicateNode}
              onDeleteNode={handleDeleteNode}
              onSettingsNode={handlePageSettingsNode}
            />
          ))}
        </HierarchyTreeItem>
      </TreeView>

      <CreateConnectionNodeDialog
        key={createConnectionDialogOpen || undefined}
        appId={appId}
        open={!!createConnectionDialogOpen}
        onClose={handleCreateConnectionDialogClose}
      />
      <CreatePageNodeDialog
        key={createPageDialogOpen || undefined}
        appId={appId}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
      <CreateCodeComponentNodeDialog
        key={createCodeComponentDialogOpen || undefined}
        appId={appId}
        open={!!createCodeComponentDialogOpen}
        onClose={handleCreateCodeComponentDialogClose}
      />
    </HierarchyExplorerRoot>
  );
}
