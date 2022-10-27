import { MenuItem, Menu, ListItemIcon, ListItemText, ButtonProps, MenuProps } from '@mui/material';
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { NodeId } from '@mui/toolpad-core';
import invariant from 'invariant';
import * as appDom from '../../appDom';
import { useDom, useDomApi } from '../DomLoader';
import useLatest from '../../utils/useLatest';
import { ConfirmDialog } from '../../components/SystemDialogs';
import useMenu from '../../utils/useMenu';

export interface NodeMenuProps {
  nodeId: NodeId;
  renderButton: (params: { buttonProps: ButtonProps; menuProps: MenuProps }) => React.ReactNode;
  deleteLabelText?: string;
  duplicateLabelText?: string;
  onNodeDeleted?: (deletedNode: appDom.AppDomNode) => void;
  onNodeDuplicated?: (newNodeId: appDom.AppDomNode) => void;
}

export default function NodeMenu({
  nodeId,
  renderButton,
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
