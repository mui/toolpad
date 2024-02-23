import { MenuItem, Menu, ListItemIcon, ListItemText, ButtonProps, MenuProps } from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { NodeId } from '@mui/toolpad-core';
import useLatest from '@mui/toolpad-utils/hooks/useLatest';
import * as appDom from '@mui/toolpad-core/appDom';
import { useAppState } from '../AppState';
import { ConfirmDialog } from '../../components/SystemDialogs';
import useMenu from '../../utils/useMenu';

export interface NodeMenuProps {
  nodeId: NodeId;
  renderButton: (params: { buttonProps: ButtonProps; menuProps: MenuProps }) => React.ReactNode;
  renameLabelText?: string;
  deleteLabelText?: string;
  duplicateLabelText?: string;
  onRenameNode?: (nodeId: NodeId) => void;
  onDeleteNode?: (nodeId: NodeId) => void;
  onDuplicateNode?: (nodeId: NodeId) => void;
}

export default function NodeMenu({
  nodeId,
  renderButton,
  renameLabelText,
  deleteLabelText,
  duplicateLabelText,
  onRenameNode,
  onDeleteNode,
  onDuplicateNode,
}: NodeMenuProps) {
  const { dom } = useAppState();

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

  const isAction = React.useMemo(() => {
    if (latestDeletedNode?.type === 'query' && latestDeletedNode?.attributes?.mode === 'mutation') {
      return true;
    }
    return false;
  }, [latestDeletedNode]);

  const handleDeleteNodeDialogClose = React.useCallback(
    (confirmed: boolean, event: React.MouseEvent) => {
      event.stopPropagation();
      setDeletedNodeId(null);
      if (confirmed && deletedNode) {
        onDeleteNode?.(deletedNodeId);
      }
    },
    [deletedNode, deletedNodeId, onDeleteNode],
  );

  const handleRenameClick = React.useCallback(
    (event: React.MouseEvent) => {
      onRenameNode?.(nodeId);
      onMenuClose(event);
    },
    [nodeId, onRenameNode, onMenuClose],
  );

  const handleDuplicateClick = React.useCallback(
    (event: React.MouseEvent) => {
      onMenuClose(event);
      onDuplicateNode?.(nodeId);
    },
    [onDuplicateNode, nodeId, onMenuClose],
  );

  return (
    <React.Fragment>
      {renderButton({
        buttonProps,
        menuProps,
      })}
      <Menu
        {...menuProps}
        onClick={(event) => {
          event.stopPropagation();
          menuProps.onClick?.(event);
        }}
      >
        {onRenameNode ? (
          <MenuItem onClick={handleRenameClick}>
            <ListItemIcon>
              <ModeEditIcon />
            </ListItemIcon>
            <ListItemText>{renameLabelText}</ListItemText>
          </MenuItem>
        ) : null}
        {onDuplicateNode ? (
          <MenuItem onClick={handleDuplicateClick}>
            <ListItemIcon>
              <ContentCopyIcon />
            </ListItemIcon>
            <ListItemText>{duplicateLabelText}</ListItemText>
          </MenuItem>
        ) : null}
        {onDeleteNode ? (
          <MenuItem onClick={handleDeleteNodeDialogOpen}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText>{deleteLabelText}</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
      <ConfirmDialog
        open={!!deletedNode}
        severity="error"
        onClose={handleDeleteNodeDialogClose}
        okButton="Delete"
      >
        Delete {isAction ? 'action' : 'query'} &quot;{latestDeletedNode?.name}
        &quot;?
      </ConfirmDialog>
    </React.Fragment>
  );
}
