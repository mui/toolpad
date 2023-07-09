import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { Box, Typography } from '@mui/material';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem';
import * as appDom from '../../../appDom';
import { useDom, useDomApi, useAppState, useAppStateApi } from '../../AppState';
import EditableText from '../../../components/EditableText';
import { ComponentIcon } from '../PageEditor/ComponentCatalog/ComponentCatalogItem';
import { useNodeNameValidation } from '../HierarchyExplorer/validation';

function CustomTreeItem(
  props: TreeItemProps & {
    node: appDom.ElementNode;
    onHover?: (event: React.MouseEvent<HTMLElement>, nodeId: NodeId) => void;
    onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  },
) {
  const domApi = useDomApi();
  const { dom } = useDom();

  const [domNodeEditable, setDomNodeEditable] = React.useState(false);
  const { label, node, onHover, onMouseLeave, ...other } = props;

  const [nodeNameInput, setNodeNameInput] = React.useState(node.name);
  const handleNodeNameChange = React.useCallback(
    (newValue: string) => setNodeNameInput(newValue),
    [],
  );
  const handleStopEditing = React.useCallback(() => {
    setNodeNameInput(node.name);
    setDomNodeEditable(false);
  }, [node.name]);

  const existingNames = React.useMemo(() => appDom.getExistingNamesForNode(dom, node), [dom, node]);
  const nodeNameError = useNodeNameValidation(nodeNameInput, existingNames, node.type);
  const isNameValid = !nodeNameError;

  const handleNameSave = React.useCallback(() => {
    if (isNameValid) {
      setNodeNameInput(nodeNameInput);
      domApi.setNodeName(node.id, nodeNameInput);
    } else {
      setNodeNameInput(node.name);
    }
  }, [isNameValid, domApi, node.id, node.name, nodeNameInput]);

  return (
    <TreeItem
      key={node.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.2, pr: 0 }}>
          <ComponentIcon
            id={node.attributes.component}
            kind="builtIn"
            sx={{ marginRight: 1, fontSize: 18, opacity: 0.5 }}
          />
          <EditableText
            value={nodeNameInput}
            variant="body2"
            editable={domNodeEditable}
            onDoubleClick={() => setDomNodeEditable(true)}
            onChange={handleNodeNameChange}
            onClose={handleStopEditing}
            onSave={handleNameSave}
            error={!isNameValid}
            helperText={nodeNameError}
            sx={{ flexGrow: 1 }}
          />
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
  const [expandedDomNodeIds, setExpandedDomNodeIds] = React.useState<string[]>([]);

  const currentPageId = currentView?.kind === 'page' ? currentView.nodeId : null;
  const currentPageNode = currentPageId ? appDom.getNode(dom, currentPageId, 'page') : null;
  const selectedDomNodeId = currentView.kind === 'page' ? currentView.selectedNodeId : '';

  const selectedNodeParentId = React.useMemo(() => {
    if (!selectedDomNodeId) {
      return null;
    }
    const selectedNode = appDom.getMaybeNode(dom, selectedDomNodeId);
    if (selectedNode) {
      return appDom.getParent(dom, selectedNode)?.id;
    }
    return null;
  }, [dom, selectedDomNodeId]);

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

  const handleNodeToggle = React.useCallback(
    (event: React.SyntheticEvent, nodeIds: string[]) => {
      setExpandedDomNodeIds((prev) => {
        const newIds = nodeIds.filter((id) => !prev.includes(id));
        const retainedIds = prev.filter((id) => nodeIds.includes(id));
        return [...retainedIds, ...newIds];
      });
    },
    [setExpandedDomNodeIds],
  );

  const expandedDomNodeIdSet = React.useMemo(() => {
    return new Set([selectedNodeParentId as string, ...expandedDomNodeIds]);
  }, [selectedNodeParentId, expandedDomNodeIds]);

  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
      defaultExpandIcon={<ChevronRightIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />}
      expanded={Array.from(expandedDomNodeIdSet)}
      selected={selectedDomNodeId as string}
      onNodeSelect={handleNodeSelect}
      onNodeFocus={handleNodeFocus}
      onNodeToggle={handleNodeToggle}
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
