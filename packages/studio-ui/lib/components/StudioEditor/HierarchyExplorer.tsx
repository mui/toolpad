import { TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import * as React from 'react';
import TreeItem, { useTreeItem, TreeItemContentProps } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { NodeId } from '../../types';
import { getNode } from '../../studioPage';
import { useEditorApi, useEditorState } from './EditorProvider';

const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
  const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;

  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleExpansion(event);
  };

  const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    handleSelection(event);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={clsx(className, classes.root, {
        [classes.expanded]: expanded,
        [classes.selected]: selected,
        [classes.focused]: focused,
        [classes.disabled]: disabled,
      })}
      onMouseDown={handleMouseDown}
      ref={ref as React.Ref<HTMLDivElement>}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={handleExpansionClick} className={classes.iconContainer}>
        {icon}
      </div>
      <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
        {label}
      </Typography>
    </div>
  );
});

interface HierarchyExplorerItemProps {
  nodeId: NodeId;
}

function HierarchyExplorerItem({ nodeId }: HierarchyExplorerItemProps) {
  const state = useEditorState();
  const item = getNode(state.page, nodeId);

  return (
    <TreeItem ContentComponent={CustomContent} nodeId={item.id} label={`${item.name} (${item.id})`}>
      {item.children.map((childId) =>
        childId ? <HierarchyExplorerItem key={childId} nodeId={childId} /> : null,
      )}
    </TreeItem>
  );
}

export interface HierarchyExplorerProps {
  className?: string;
}

export default function HierarchyExplorer({ className }: HierarchyExplorerProps) {
  const state = useEditorState();
  const api = useEditorApi();
  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    api.select(nodeIds[0] as NodeId);
  };

  const selected = state.selection ? [state.selection] : [];

  return (
    <div className={className}>
      <Typography>Page Hierarchy</Typography>
      <TreeView
        aria-label="hierarchy explorer"
        selected={selected}
        onNodeSelect={handleSelect}
        multiSelect
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <HierarchyExplorerItem nodeId={state.page.root} />
      </TreeView>
    </div>
  );
}
