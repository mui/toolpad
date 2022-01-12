import { TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import * as React from 'react';
import TreeItem, { useTreeItem, TreeItemContentProps } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { NodeId } from '../../types';
import * as studioDom from '../../studioDom';
import { useDom } from './EditorProvider';

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
  const dom = useDom();
  const { children = [], ...namedChildren } = studioDom.getChildNodes(dom, element);
  return (
    <TreeItem
      ContentComponent={CustomContent}
      nodeId={element.id}
      label={`${element.name} (${element.id})`}
    >
      {children.map((child) => (
        <HierarchyExplorerElementItem key={child.id} element={child} />
      ))}

      {Object.entries(namedChildren).map(() => {
        // TODO: display `namedChildren` in the tree as well
        return null;
      })}
    </TreeItem>
  );
}

interface HierarchyExplorerPageItemProps {
  page: studioDom.StudioPageNode;
}

function HierarchyExplorerPageItem({ page }: HierarchyExplorerPageItemProps) {
  const dom = useDom();
  const children = studioDom.getChildNodes(dom, page).children ?? [];
  return (
    <TreeItem ContentComponent={CustomContent} nodeId={page.id} label={`${page.name} (${page.id})`}>
      {children.map((child) => (
        <HierarchyExplorerElementItem key={child.id} element={child} />
      ))}
    </TreeItem>
  );
}

export interface HierarchyExplorerProps {
  className?: string;
  selection?: NodeId | null;
  onSelect?: (nodeId: NodeId | null) => void;
}

export default function HierarchyExplorer({
  className,
  onSelect,
  selection,
}: HierarchyExplorerProps) {
  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    const selectedNodeId = nodeIds[0] as NodeId | undefined;
    onSelect?.(selectedNodeId ?? null);
  };

  const selected = selection ? [selection] : [];

  const dom = useDom();
  const app = studioDom.getApp(dom);
  const pages = studioDom.getPages(dom, app);

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
        <TreeItem ContentComponent={CustomContent} nodeId="" label="Pages">
          {pages.map((page) => (
            <HierarchyExplorerPageItem key={page.id} page={page} />
          ))}
        </TreeItem>
      </TreeView>
    </div>
  );
}
