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
import { useAppStateApi, useDom, useAppState } from '../../AppState';
import CreatePageNodeDialog from './CreatePageNodeDialog';
import useLocalStorageState from '../../../utils/useLocalStorageState';
import NodeMenu from '../NodeMenu';
import { DomView } from '../../../utils/domView';
import client from '../../../api';

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
  className?: string;
}

export default function HierarchyExplorer({ className }: HierarchyExplorerProps) {
  const { dom } = useDom();
  const { currentView } = useAppState();

  const appStateApi = useAppStateApi();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);

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
        appStateApi.setView({ kind: 'page', nodeId: page.id });
      }
    }

    if (appDom.isPage(node)) {
      appStateApi.setView({ kind: 'page', nodeId: node.id });
    }

    if (appDom.isCodeComponent(node)) {
      appStateApi.setView({ kind: 'codeComponent', nodeId: node.id });
    }

    if (appDom.isConnection(node)) {
      appStateApi.setView({ kind: 'connection', nodeId: node.id });
    }
  };

  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreatePageDialogOpen(Math.random());
  }, []);
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);

  const handleDeletePage = React.useCallback(
    async (nodeId: NodeId) => {
      const deletedNode = appDom.getNode(dom, nodeId);

      let domViewAfterDelete: DomView | undefined;
      if (nodeId === activeNode) {
        const siblings = appDom.getSiblings(dom, deletedNode);
        const firstSiblingOfType = siblings.find((sibling) => sibling.type === deletedNode.type);
        domViewAfterDelete = firstSiblingOfType && getNodeEditorDomView(firstSiblingOfType);
      }

      await client.mutation.deletePage(deletedNode.name);

      appStateApi.update(
        (draft) => appDom.removeNode(draft, nodeId),
        domViewAfterDelete || { kind: 'page' },
      );
    },
    [activeNode, appStateApi, dom],
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

      appStateApi.update(
        (draft) => appDom.addFragment(draft, fragment, node.parentId!, node.parentProp!),
        editorDomView || { kind: 'page' },
      );
    },
    [appStateApi, dom],
  );

  const handlePageSettingsNode = React.useCallback(
    (nodeId: NodeId) => {
      const node = appDom.getNode(dom, nodeId);

      if (appDom.isPage(node)) {
        appStateApi.setView({ kind: 'page', nodeId: node.id, selectedNodeId: null });
      }
    },
    [appStateApi, dom],
  );

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
              onDeleteNode={handleDeletePage}
              onSettingsNode={handlePageSettingsNode}
            />
          ))}
        </HierarchyTreeItem>
      </TreeView>

      <CreatePageNodeDialog
        key={createPageDialogOpen || undefined}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
    </HierarchyExplorerRoot>
  );
}
