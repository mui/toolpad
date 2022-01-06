import { TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import * as React from 'react';
import TreeItem, { useTreeItem, TreeItemContentProps } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { NodeId } from '../../types';
import * as studioDom from '../../studioDom';
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

interface HierarchyExplorerElementItemProps {
  element: studioDom.StudioElementNode;
}

function HierarchyExplorerElementItem({ element }: HierarchyExplorerElementItemProps) {
  const state = useEditorState();
  return (
    <TreeItem
      ContentComponent={CustomContent}
      nodeId={element.id}
      label={`${element.name} (${element.id})`}
    >
      {studioDom.getChildren(state.dom, element).map((child) => (
        <HierarchyExplorerElementItem key={child.id} element={child} />
      ))}
    </TreeItem>
  );
}

interface HierarchyExplorerPageItemProps {
  page: studioDom.StudioPageNode;
}

function HierarchyExplorerPageItem({ page }: HierarchyExplorerPageItemProps) {
  const state = useEditorState();
  const root = studioDom.getPageRoot(state.dom, page);
  return (
    <TreeItem ContentComponent={CustomContent} nodeId={page.id} label={`${page.name} (${page.id})`}>
      <HierarchyExplorerElementItem element={root} />
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
    const selectedNode = nodeIds[0];
    if (selectedNode) {
      api.select(selectedNode as NodeId);
    }
  };

  const selected = state.editorType === 'page' && state.selection ? [state.selection] : [];

  const app = studioDom.getApp(state.dom);
  const pages = studioDom.getPages(state.dom, app);
  const theme = studioDom.getTheme(state.dom, app);

  return (
    <div className={className}>
      <Typography>App Hierarchy</Typography>
      <TreeView
        aria-label="hierarchy explorer"
        selected={selected}
        onNodeSelect={handleSelect}
        multiSelect
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {theme ? (
          <TreeItem ContentComponent={CustomContent} nodeId={theme.id} label="Theme" />
        ) : null}
        <TreeItem ContentComponent={CustomContent} nodeId="" label="Pages">
          {pages.map((page) => (
            <HierarchyExplorerPageItem key={page.id} page={page} />
          ))}
        </TreeItem>
      </TreeView>
    </div>
  );
}
