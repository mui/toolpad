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

type StyledTreeItemProps = TreeItemProps & {
  onDelete?: React.MouseEventHandler;
  onDuplicate?: React.MouseEventHandler;
  onCreate?: React.MouseEventHandler;
  menuButton?: boolean;
  labelIcon?: React.ReactNode;
  labelText: string;
  createLabelText?: string;
  deleteLabelText?: string;
  duplicateLabelText?: string;
};

function HierarchyTreeItem(props: StyledTreeItemProps) {
  const {
    labelIcon,
    labelText,
    onCreate,
    onDelete,
    onDuplicate,
    menuButton,
    createLabelText = `Create ${labelText}`,
    deleteLabelText = `Delete ${labelText}`,
    duplicateLabelText = `Duplicate ${labelText}`,
    ...other
  } = props;

  const menu = useMenu();

  const handleDelete = React.useCallback<React.MouseEventHandler<HTMLLIElement>>(
    (event) => {
      onDelete?.(event);
      menu.onMenuClose(event);
    },
    [menu, onDelete],
  );

  const handleDuplicate = React.useCallback<React.MouseEventHandler<HTMLLIElement>>(
    (event) => {
      onDuplicate?.(event);
      menu.onMenuClose(event);
    },
    [menu, onDuplicate],
  );

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
          {menuButton ? (
            <React.Fragment>
              <IconButton
                className={clsx(classes.treeItemMenuButton, {
                  [classes.treeItemMenuOpen]: menu.menuProps.open,
                })}
                {...menu.buttonProps}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu {...menu.menuProps}>
                {onDuplicate ? (
                  <MenuItem onClick={handleDuplicate}>
                    <ListItemIcon>
                      <ContentCopyIcon />
                    </ListItemIcon>
                    <ListItemText> {duplicateLabelText}</ListItemText>
                  </MenuItem>
                ) : null}
                {onDelete ? (
                  <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                      <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText> {deleteLabelText}</ListItemText>
                  </MenuItem>
                ) : null}
              </Menu>
            </React.Fragment>
          ) : null}
        </Box>
      }
      {...other}
    />
  );
}

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
  const domApi = useDomApi();

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

  const [deletedNodeId, setDeletedNodeId] = React.useState<NodeId | null>(null);
  const handleDeleteNodeDialogOpen = React.useCallback(
    (nodeId: NodeId) => (event: React.MouseEvent) => {
      event.stopPropagation();
      setDeletedNodeId(nodeId);
    },
    [],
  );

  const handledeleteNodeDialogClose = React.useCallback(
    (confirmed: boolean) => {
      if (confirmed && deletedNodeId) {
        let redirectAfterDelete: string | undefined;
        if (deletedNodeId === activeNode) {
          const deletedNode = appDom.getNode(dom, deletedNodeId);
          const siblings = appDom.getSiblings(dom, deletedNode);
          const firstSiblingOfType = siblings.find((sibling) => sibling.type === deletedNode.type);
          if (firstSiblingOfType) {
            redirectAfterDelete = getLinkToNodeEditor(appId, firstSiblingOfType);
          } else {
            redirectAfterDelete = `/app/${appId}`;
          }
        }

        domApi.removeNode(deletedNodeId);

        if (redirectAfterDelete) {
          navigate(redirectAfterDelete);
        }
      } else {
        setDeletedNodeId(null);
      }
    },
    [activeNode, appId, deletedNodeId, dom, domApi, navigate],
  );

  const deletedNode = deletedNodeId && appDom.getMaybeNode(dom, deletedNodeId);
  const latestDeletedNode = useLatest(deletedNode);

  const handleDuplicateNode = React.useCallback(
    (nodeId: NodeId) => () => {
      const node = appDom.getNode(dom, nodeId);

      invariant(
        node.parentId && node.parentProp,
        'Duplication should never be called on nodes that are not placed in the dom',
      );

      const fragment = appDom.cloneFragment(dom, node.id);
      domApi.addFragment(fragment, node.parentId, node.parentProp);
      const fragmentRoot = appDom.getNode(fragment, fragment.root);
      const editorLink = getLinkToNodeEditor(appId, fragmentRoot);
      if (editorLink) {
        navigate(editorLink);
      }
    },
    [appId, dom, domApi, navigate],
  );

  return (
    <HierarchyExplorerRoot className={className}>
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
          labelText="Connections"
          createLabelText="Create connection"
          deleteLabelText="Delete connection"
          onCreate={handleCreateConnectionDialogOpen}
        >
          {connections.map((connectionNode) => (
            <HierarchyTreeItem
              key={connectionNode.id}
              nodeId={connectionNode.id}
              labelText={connectionNode.name}
              onDuplicate={handleDuplicateNode(connectionNode.id)}
              onDelete={handleDeleteNodeDialogOpen(connectionNode.id)}
              menuButton
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem
          nodeId=":codeComponents"
          labelText="Components"
          createLabelText="Create component"
          deleteLabelText="Delete component"
          onCreate={handleCreateCodeComponentDialogOpen}
        >
          {codeComponents.map((codeComponent) => (
            <HierarchyTreeItem
              key={codeComponent.id}
              nodeId={codeComponent.id}
              labelText={codeComponent.name}
              onDuplicate={handleDuplicateNode(codeComponent.id)}
              onDelete={handleDeleteNodeDialogOpen(codeComponent.id)}
              menuButton
            />
          ))}
        </HierarchyTreeItem>
        <HierarchyTreeItem
          nodeId=":pages"
          labelText="Pages"
          createLabelText="Create page"
          deleteLabelText="Delete page"
          onCreate={handleCreatePageDialogOpen}
        >
          {pages.map((page) => (
            <HierarchyTreeItem
              key={page.id}
              nodeId={page.id}
              labelText={page.name}
              onDuplicate={handleDuplicateNode(page.id)}
              onDelete={handleDeleteNodeDialogOpen(page.id)}
              menuButton
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
      <ConfirmDialog
        open={!!deletedNode}
        severity="error"
        onClose={handledeleteNodeDialogClose}
        okButton="Delete"
      >
        Delete {latestDeletedNode?.type} &quot;{latestDeletedNode?.name}&quot;?
      </ConfirmDialog>
    </HierarchyExplorerRoot>
  );
}
