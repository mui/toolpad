import { TreeView } from '@mui/lab';
import {
  Typography,
  styled,
  Box,
  IconButton,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import * as React from 'react';
import TreeItem, { treeItemClasses, TreeItemProps } from '@mui/lab/TreeItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation, matchRoutes, Location } from 'react-router-dom';
import { NodeId } from '@mui/toolpad-core';
import clsx from 'clsx';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import CreatePageNodeDialog from './CreatePageNodeDialog';
import CreateCodeComponentNodeDialog from './CreateCodeComponentNodeDialog';
import CreateConnectionNodeDialog from './CreateConnectionNodeDialog';
import useLocalStorageState from '../../../utils/useLocalStorageState';
import useLatest from '../../../utils/useLatest';
import { ConfirmDialog } from '../../../components/SystemDialogs';
import useMenu from '../../../utils/useMenu';

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

function getActiveNodeId(location: Location): NodeId | null {
  const match =
    matchRoutes(
      [
        { path: `/app/:appId/pages/:activeNodeId` },
        { path: `/app/:appId/apis/:activeNodeId` },
        { path: `/app/:appId/codeComponents/:activeNodeId` },
        { path: `/app/:appId/connections/:activeNodeId` },
      ],
      location,
    ) || [];

  const selected: NodeId[] = match.map((route) => route.params.activeNodeId as NodeId);
  return selected.length > 0 ? selected[0] : null;
}

interface NodeMenuProps {
  nodeId: NodeId;
  deleteLabelText?: string;
  duplicateLabelText?: string;
  onNodeDeleted?: (deletedNode: appDom.AppDomNode) => void;
  onNodeDuplicated?: (newNodeId: appDom.AppDomNode) => void;
}

function NodeMenu({
  nodeId,
  deleteLabelText,
  duplicateLabelText,
  onNodeDeleted,
  onNodeDuplicated,
}: NodeMenuProps) {
  const dom = useDom();
  const domApi = useDomApi();

  const { menuProps, buttonProps, onMenuClose } = useMenu();

  const [deletedNodeId, setDeletedNodeId] = React.useState<NodeId | null>(null);
  const handleDeleteNodeDialogOpen = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setDeletedNodeId(nodeId);
      onMenuClose(event);
    },
    [nodeId, onMenuClose],
  );
  const deletedNode = deletedNodeId && appDom.getMaybeNode(dom, deletedNodeId);
  const latestDeletedNode = useLatest(deletedNode);

  const handleDeleteNodeDialogClose = React.useCallback(
    (confirmed: boolean) => {
      if (confirmed && deletedNode) {
        domApi.removeNode(deletedNodeId);

        onNodeDeleted?.(deletedNode);
      }

      setDeletedNodeId(null);
    },
    [deletedNode, deletedNodeId, domApi, onNodeDeleted],
  );

  const handleDuplicateClick = React.useCallback(
    (event: React.MouseEvent) => {
      const node = appDom.getNode(dom, nodeId);

      invariant(
        node.parentId && node.parentProp,
        'Duplication should never be called on nodes that are not placed in the dom',
      );

      const fragment = appDom.cloneFragment(dom, node.id);
      domApi.addFragment(fragment, node.parentId, node.parentProp);

      onNodeDuplicated?.(appDom.getNode(fragment, fragment.root));
      onMenuClose(event);
    },
    [dom, domApi, nodeId, onMenuClose, onNodeDuplicated],
  );

  return (
    <React.Fragment>
      <IconButton
        className={clsx(classes.treeItemMenuButton, {
          [classes.treeItemMenuOpen]: menuProps.open,
        })}
        aria-label="Open hierarchy menu"
        {...buttonProps}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        {...menuProps}
        onClick={(event) => {
          event.stopPropagation();
          menuProps.onClick?.(event);
        }}
      >
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
          <ListItemText> {duplicateLabelText}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteNodeDialogOpen}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText> {deleteLabelText}</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={!!deletedNode}
        severity="error"
        onClose={handleDeleteNodeDialogClose}
        okButton="Delete"
      >
        Delete {latestDeletedNode?.type} &quot;{latestDeletedNode?.name}&quot;?
      </ConfirmDialog>
    </React.Fragment>
  );
}

type StyledTreeItemProps = TreeItemProps & {
  onNodeDeleted?: (deletedNode: appDom.AppDomNode) => void;
  onNodeDuplicated?: (newNodeId: appDom.AppDomNode) => void;
  onCreate?: React.MouseEventHandler;
  labelIcon?: React.ReactNode;
  labelText: string;
  createLabelText?: string;
  deleteLabelText?: string;
  duplicateLabelText?: string;
  toolpadNodeId?: NodeId;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const {
    labelIcon,
    labelText,
    onCreate,
    onNodeDeleted,
    onNodeDuplicated,
    createLabelText = `Create ${labelText}`,
    deleteLabelText = `Delete ${labelText}`,
    duplicateLabelText = `Duplicate ${labelText}`,
    toolpadNodeId,
    ...other
  } = props;

  return (
    <StyledTreeItem
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          {labelIcon}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          {onCreate ? (
            <IconButton aria-label={createLabelText} onClick={onCreate}>
              <AddIcon />
            </IconButton>
          ) : null}
          {toolpadNodeId ? (
            <NodeMenu
              nodeId={toolpadNodeId}
              deleteLabelText={deleteLabelText}
              duplicateLabelText={duplicateLabelText}
              onNodeDeleted={onNodeDeleted}
              onNodeDuplicated={onNodeDuplicated}
            />
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

function getLinkToNodeEditor(appId: string, node: appDom.AppDomNode): string | undefined {
  switch (node.type) {
    case 'page':
      return `/app/${appId}/pages/${node.id}`;
    case 'connection':
      return `/app/${appId}/connections/${node.id}`;
    case 'codeComponent':
      return `/app/${appId}/codeComponents/${node.id}`;
    default:
      return undefined;
  }
}

export interface HierarchyExplorerProps {
  appId: string;
  className?: string;
}

export default function HierarchyExplorer({ appId, className }: HierarchyExplorerProps) {
  const dom = useDom();

  const app = appDom.getApp(dom);
  const { codeComponents = [], pages = [], connections = [] } = appDom.getChildNodes(dom, app);

  const [expanded, setExpanded] = useLocalStorageState<string[]>(
    `editor/${app.id}/hierarchy-expansion`,
    [':connections', ':pages', ':codeComponents'],
  );

  const location = useLocation();

  const activeNode = getActiveNodeId(location);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds as NodeId[]);
  };

  const navigate = useNavigate();

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
        navigate(`/app/${appId}/pages/${page.id}`);
      }
    }

    if (appDom.isPage(node)) {
      navigate(`/app/${appId}/pages/${node.id}`);
    }

    if (appDom.isCodeComponent(node)) {
      navigate(`/app/${appId}/codeComponents/${node.id}`);
    }

    if (appDom.isConnection(node)) {
      navigate(`/app/${appId}/connections/${node.id}`);
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

  const handleNodeDeleted = React.useCallback(
    (deletedNode: appDom.AppDomNode) => {
      if (activeNode === deletedNode.id) {
        const siblings = appDom.getSiblings(dom, deletedNode);
        const nextFocusedNode = siblings.find((sibling) => sibling.type === deletedNode.type);
        let redirectAfterDelete: string | undefined;

        if (nextFocusedNode) {
          redirectAfterDelete = getLinkToNodeEditor(appId, nextFocusedNode);
        } else {
          redirectAfterDelete = `/app/${appId}`;
        }

        if (redirectAfterDelete) {
          console.log('navigating', redirectAfterDelete);
          navigate(redirectAfterDelete);
        }
      }
    },
    [activeNode, appId, dom, navigate],
  );

  const handleNodeDuplicated = React.useCallback(
    (newNode: appDom.AppDomNode) => {
      const editorLink = getLinkToNodeEditor(appId, newNode);
      if (editorLink) {
        navigate(editorLink);
      }
    },
    [appId, navigate],
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
          nodeId=":connections"
          aria-level={1}
          labelText="Connections"
          createLabelText="Create connection"
          deleteLabelText="Delete connection"
          onCreate={handleCreateConnectionDialogOpen}
        >
          {connections.map((connectionNode) => (
            <HierarchyTreeItem
              key={connectionNode.id}
              nodeId={connectionNode.id}
              toolpadNodeId={connectionNode.id}
              aria-level={2}
              labelText={connectionNode.name}
              onNodeDuplicated={handleNodeDuplicated}
              onNodeDeleted={handleNodeDeleted}
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem
          nodeId=":codeComponents"
          aria-level={1}
          labelText="Components"
          createLabelText="Create component"
          deleteLabelText="Delete component"
          onCreate={handleCreateCodeComponentDialogOpen}
        >
          {codeComponents.map((codeComponent) => (
            <HierarchyTreeItem
              key={codeComponent.id}
              nodeId={codeComponent.id}
              toolpadNodeId={codeComponent.id}
              aria-level={2}
              labelText={codeComponent.name}
              onNodeDuplicated={handleNodeDuplicated}
              onNodeDeleted={handleNodeDeleted}
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem
          nodeId=":pages"
          aria-level={1}
          labelText="Pages"
          createLabelText="Create page"
          deleteLabelText="Delete page"
          onCreate={handleCreatePageDialogOpen}
        >
          {pages.map((page) => (
            <HierarchyTreeItem
              key={page.id}
              nodeId={page.id}
              toolpadNodeId={page.id}
              aria-level={2}
              labelText={page.name}
              onNodeDuplicated={handleNodeDuplicated}
              onNodeDeleted={handleNodeDeleted}
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
