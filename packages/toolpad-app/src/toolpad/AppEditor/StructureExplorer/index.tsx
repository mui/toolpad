import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { Box, Typography } from '@mui/material';
import TreeView from '@mui/lab/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import * as appDom from '../../../appDom';
import { useDom, useAppState, useAppStateApi } from '../../AppState';
import { ComponentIcon } from '../PageEditor/ComponentCatalog/ComponentCatalogItem';

function CustomTreeItem(
  props: TreeItemProps & {
    node: appDom.ElementNode;
    onHover?: (event: React.MouseEvent<HTMLElement>, nodeId: NodeId) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  },
) {
  const { label, node, onHover, onMouseLeave, ...other } = props;
  return (
    <TreeItem
      key={node.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          <ComponentIcon
            id={node.attributes.component}
            kind="builtIn"
            sx={{ marginRight: 1, fontSize: 18, opacity: 0.5 }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 'inherit', flexGrow: 1 }}
            noWrap
            onMouseEnter={(event: React.MouseEvent<HTMLElement>) =>
              onHover ? onHover(event, node.id) : null
            }
            onMouseLeave={(event: React.MouseEvent<HTMLElement>) =>
              onMouseLeave ? onMouseLeave(event) : null
            }
          >
            {node.name}
          </Typography>
        </Box>
      }
      {...other}
    />
  );
}

function RecursiveSubTree({
  dom,
  root,
  onHover,
  onMouseLeave,
}: {
  dom: appDom.AppDom;
  root: appDom.ElementNode;
  onHover?: (event: React.MouseEvent<HTMLElement>, nodeId: NodeId) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  const { children = [], renderItem = [] } = React.useMemo(
    () => appDom.getChildNodes(dom, root),
    [dom, root],
  );

  if (children.length) {
    return (
      <CustomTreeItem nodeId={root.id} node={root}>
        {children.map((childNode) => (
          <RecursiveSubTree
            key={childNode.id}
            dom={dom}
            root={childNode}
            onHover={onHover}
            onMouseLeave={onMouseLeave}
          />
        ))}
      </CustomTreeItem>
    );
  }
  if (renderItem.length) {
    return (
      <TreeItem nodeId={root.id} label={<Typography variant="body2">{root.name}</Typography>}>
        <TreeItem
          nodeId={`${root.id}-renderItem`}
          label={<Typography variant="body2">renderItem</Typography>}
        >
          {renderItem.map((childNode) => (
            <RecursiveSubTree
              key={childNode.id}
              dom={dom}
              root={childNode}
              onHover={onHover}
              onMouseLeave={onMouseLeave}
            />
          ))}
        </TreeItem>
      </TreeItem>
    );
  }
  return (
    <CustomTreeItem nodeId={root.id} node={root} onHover={onHover} onMouseLeave={onMouseLeave} />
  );
}

export default function PageStructureExplorer() {
  const { dom } = useDom();
  const { currentView } = useAppState();
  const appStateApi = useAppStateApi();
  const currentPageId = currentView?.kind === 'page' ? currentView.nodeId : null;
  const currentPageNode = currentPageId ? appDom.getNode(dom, currentPageId, 'page') : null;

  const { children: rootChildren = [] } = React.useMemo(() => {
    if (!currentPageNode) {
      return { children: [] };
    }
    return appDom.getChildNodes(dom, currentPageNode);
  }, [dom, currentPageNode]);

  const handleNodeSelect = React.useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      appStateApi.selectNode(nodeId as NodeId);
    },
    [appStateApi],
  );

  const handleNodeFocus = React.useCallback(
    (event: React.SyntheticEvent, nodeId: string) => {
      appStateApi.hoverNode(nodeId as NodeId);
    },
    [appStateApi],
  );

  const handleNodeHover = React.useCallback(
    (event: React.MouseEvent, nodeId: NodeId) => {
      appStateApi.hoverNode(nodeId as NodeId);
    },
    [appStateApi],
  );

  const handleNodeBlur = React.useCallback(() => {
    appStateApi.blurHoverNode();
  }, [appStateApi]);

  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      onNodeSelect={handleNodeSelect}
      onNodeFocus={handleNodeFocus}
      sx={{ height: 600, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      {rootChildren.map((childNode) => (
        <RecursiveSubTree
          key={childNode.id}
          dom={dom}
          root={childNode}
          onHover={handleNodeHover}
          onMouseLeave={handleNodeBlur}
        />
      ))}
    </TreeView>
  );
}
