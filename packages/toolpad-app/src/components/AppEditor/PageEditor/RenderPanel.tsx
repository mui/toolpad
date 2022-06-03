import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash-es/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { ArgTypeDefinitions, RuntimeEvent } from '@mui/toolpad-core';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import { FlowDirection, NodeId, NodeInfo, NodesInfo } from '../../../types';
import * as appDom from '../../../appDom';
import EditorCanvasHost from './EditorCanvasHost';
import {
  absolutePositionCss,
  getRectPointZone,
  Rectangle,
  RectZone,
  rectContainsPoint,
} from '../../../utils/geometry';
import { PinholeOverlay } from '../../../PinholeOverlay';
import { getPageViewState } from '../../../pageViewState';
import { useDom, useDomApi } from '../../DomLoader';
import { usePageEditorApi, usePageEditorState } from './PageEditorProvider';
import EditorOverlay from './EditorOverlay';
import { HTML_ID_APP_ROOT } from '../../../constants';
import { useToolpadComponent } from '../toolpadComponents';
import {
  getElementNodeComponentId,
  isPageRow,
  PAGE_COLUMN_COMPONENT_ID,
  PAGE_ROW_COMPONENT_ID,
  isPageLayoutComponent,
  isPageColumn,
} from '../../../toolpadComponents';

const classes = {
  view: 'Toolpad_View',
};

const RenderPanelRoot = styled('div')({
  position: 'relative',
  overflow: 'hidden',

  [`& .${classes.view}`]: {
    height: '100%',
  },
});

const overlayClasses = {
  hud: 'Toolpad_Hud',
  nodeHud: 'Toolpad_NodeHud',
  highlightedTop: 'Toolpad_HighlightedTop',
  highlightedRight: 'Toolpad_HighlightedRight',
  highlightedBottom: 'Toolpad_HighlightedBottom',
  highlightedLeft: 'Toolpad_HighlightedLeft',
  highlightedCenter: 'Toolpad_HighlightedCenter',
  selected: 'Toolpad_Selected',
  allowNodeInteraction: 'Toolpad_AllowNodeInteraction',
  layout: 'Toolpad_Layout',
  active: 'Toolpad_Active',
  available: 'Toolpad_Available',
  componentDragging: 'Toolpad_ComponentDragging',
  selectionHint: 'Toolpad_SelectionHint',
  hudOverlay: 'Toolpad_HudOverlay',
};

export function getHighlightedZoneOverlayClass(
  highlightedZone: RectZone,
): typeof overlayClasses[keyof typeof overlayClasses] | null {
  switch (highlightedZone) {
    case RectZone.TOP:
      return overlayClasses.highlightedTop;
    case RectZone.RIGHT:
      return overlayClasses.highlightedRight;
    case RectZone.BOTTOM:
      return overlayClasses.highlightedBottom;
    case RectZone.LEFT:
      return overlayClasses.highlightedLeft;
    case RectZone.CENTER:
      return overlayClasses.highlightedCenter;
    default:
      return null;
  }
}

export function getChildNodeHighlightedZone(direction: FlowDirection): RectZone | null {
  switch (direction) {
    case 'row':
      return RectZone.RIGHT;
    case 'column':
      return RectZone.BOTTOM;
    case 'row-reverse':
      return RectZone.LEFT;
    case 'column-reverse':
      return RectZone.TOP;
    default:
      return null;
  }
}

const OverlayRoot = styled('div')({
  pointerEvents: 'none',
  width: '100%',
  height: '100%',

  '&:focus': {
    outline: 'none',
  },

  [`& .${overlayClasses.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'none',
    position: 'absolute',
    alignItems: 'center',
    right: -1,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `0 0 0 8px`,
    // TODO: figure out positioning of this selectionhint, perhaps it should
    //   - prefer top right, above the component
    //   - if that appears out of bound of the editor, show it bottom or left
    zIndex: 1,
    transform: `translate(0, -100%)`,
  },

  [`& .${overlayClasses.nodeHud}`]: {
    border: '1px dashed rgba(255,0,0,.25)',
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${overlayClasses.layout}`]: {
      borderColor: 'rgba(255,0,0,.125)',
    },
    [`&.${overlayClasses.highlightedTop}`]: {
      borderTop: '3px solid #44EB2D',
    },
    [`&.${overlayClasses.highlightedRight}`]: {
      borderRight: '3px solid #44EB2D',
    },
    [`&.${overlayClasses.highlightedBottom}`]: {
      borderBottom: '3px solid #44EB2D',
    },
    [`&.${overlayClasses.highlightedLeft}`]: {
      borderLeft: '3px solid #44EB2D',
    },
    [`&.${overlayClasses.highlightedCenter}`]: {
      border: '3px solid #44EB2D',
    },
    [`&.${overlayClasses.selected}`]: {
      border: '1px solid red',
      [`& .${overlayClasses.selectionHint}`]: {
        display: 'flex',
      },
    },
    [`&.${overlayClasses.allowNodeInteraction}`]: {
      // block pointer-events so we can interact with the selection
      pointerEvents: 'none',
    },
  },

  [`& .${overlayClasses.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

const EmptyDropZone = styled('div')({
  alignItems: 'center',
  border: '1px solid green',
  color: 'green',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
  position: 'absolute',
});

function findNodeAt(
  nodes: readonly appDom.AppDomNode[],
  nodesInfo: NodesInfo,
  x: number,
  y: number,
): NodeId | null {
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const nodeInfo = nodesInfo[node.id];
    if (nodeInfo?.rect && rectContainsPoint(nodeInfo.rect, x, y)) {
      return node.id;
    }
  }
  return null;
}

function hasContainerComponent(nodeInfo: NodeInfo): boolean {
  const componentArgTypes: ArgTypeDefinitions<any> | undefined = nodeInfo.componentConfig?.argTypes;
  const childrenControlType = componentArgTypes?.children?.control?.type;

  return childrenControlType === 'slot' || childrenControlType === 'slots';
}

interface SelectionHudProps {
  node: appDom.ElementNode | appDom.PageNode;
  rect: Rectangle;
  highlightedZone?: RectZone | null;
  selected?: boolean;
  allowInteraction?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
  hasEmptyContainer: boolean;
}

function NodeHud({
  node,
  highlightedZone,
  selected,
  allowInteraction,
  rect,
  onDragStart,
  onDelete,
  hasEmptyContainer,
}: SelectionHudProps) {
  const dom = useDom();

  const componentId = appDom.isElement(node) ? getElementNodeComponentId(node) : '';
  const component = useToolpadComponent(dom, componentId);

  const isLayoutComponent =
    componentId === PAGE_ROW_COMPONENT_ID || componentId === PAGE_COLUMN_COMPONENT_ID;

  const highlightedZoneOverlayClass =
    highlightedZone && getHighlightedZoneOverlayClass(highlightedZone);

  return (
    <React.Fragment>
      {hasEmptyContainer ? (
        <EmptyDropZone style={absolutePositionCss(rect)}>+</EmptyDropZone>
      ) : null}
      <div
        draggable
        data-node-id={node.id}
        onDragStart={onDragStart}
        style={absolutePositionCss(rect)}
        className={clsx(overlayClasses.nodeHud, {
          [overlayClasses.layout]: isLayoutComponent,
          ...(highlightedZoneOverlayClass ? { [highlightedZoneOverlayClass]: true } : {}),
          [overlayClasses.selected]: selected,
          [overlayClasses.allowNodeInteraction]: allowInteraction,
        })}
      >
        <div draggable className={overlayClasses.selectionHint}>
          {component?.displayName || '<unknown>'}
          <DragIndicatorIcon color="inherit" />
          <IconButton aria-label="Remove element" color="inherit" onClick={onDelete}>
            <DeleteIcon color="inherit" />
          </IconButton>
        </div>
      </div>
    </React.Fragment>
  );
}

export interface RenderPanelProps {
  className?: string;
}

export default function RenderPanel({ className }: RenderPanelProps) {
  const dom = useDom();
  const domApi = useDomApi();
  const api = usePageEditorApi();
  const {
    appId,
    selection,
    newNode,
    viewState,
    nodeId: pageNodeId,
    highlightLayout,
    dragOverNodeId,
    dragOverNodeZone,
  } = usePageEditorState();

  const { nodes: nodesInfo } = viewState;

  const pageNode = appDom.getNode(dom, pageNodeId, 'page');

  const pageNodes = React.useMemo(() => {
    return [pageNode, ...appDom.getDescendants(dom, pageNode)];
  }, [dom, pageNode]);

  const selectedNode = selection && appDom.getNode(dom, selection);

  // We will use this key to remount the overlay after page load
  const [overlayKey, setOverlayKey] = React.useState(1);
  const editorWindowRef = React.useRef<Window>();

  const getViewCoordinates = React.useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const rootElm = editorWindowRef.current?.document.getElementById(HTML_ID_APP_ROOT);
      if (!rootElm) {
        return null;
      }
      const rect = rootElm.getBoundingClientRect();
      if (rectContainsPoint(rect, clientX, clientY)) {
        return { x: clientX - rect.x, y: clientY - rect.y };
      }
      return null;
    },
    [],
  );

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      const nodeId = event.currentTarget.dataset.nodeId as NodeId | undefined;

      if (!nodeId) {
        return;
      }

      event.dataTransfer.dropEffect = 'move';
      api.select(nodeId);
    },
    [api],
  );

  const getCurrentlyDraggedNode = React.useCallback((): appDom.ElementNode | null => {
    return newNode || (selection && appDom.getNode(dom, selection, 'element'));
  }, [dom, newNode, selection]);

  const availableDropTargets = React.useMemo((): appDom.AppDomNode[] => {
    const draggedNode = getCurrentlyDraggedNode();

    if (!draggedNode) {
      return [];
    }

    /**
     * Return all nodes that are available for insertion.
     * i.e. Exclude all descendants of the current selection since inserting in one of
     * them would create a cyclic structure.
     */
    const excludedNodes = selectedNode
      ? new Set<appDom.AppDomNode>([selectedNode, ...appDom.getDescendants(dom, selectedNode)])
      : new Set();
    return pageNodes.filter((n) => !excludedNodes.has(n));
  }, [dom, getCurrentlyDraggedNode, pageNodes, selectedNode]);

  const availableDropTargetIds = React.useMemo(
    () => new Set(availableDropTargets.map((n) => n.id)),
    [availableDropTargets],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const activeDropNodeId = findNodeAt(
        availableDropTargets,
        nodesInfo,
        cursorPos.x,
        cursorPos.y,
      );

      event.preventDefault();

      const activeDropNode = activeDropNodeId && appDom.getNode(dom, activeDropNodeId);
      const activeDropNodeInfo = activeDropNodeId && nodesInfo[activeDropNodeId];

      let activeDropZone = null;
      if (activeDropNode && activeDropNodeInfo) {
        const activeDropNodeRect = activeDropNodeInfo.rect;

        const isDraggingOverPage = appDom.isPage(activeDropNode);

        const isDraggingOverContainer = hasContainerComponent(activeDropNodeInfo);

        let centerAreaFraction = 0;
        if (isDraggingOverContainer) {
          centerAreaFraction = 0.5;
        }
        if (isDraggingOverPage) {
          centerAreaFraction = 1;
        }

        if (activeDropNodeRect) {
          activeDropZone = getRectPointZone(
            activeDropNodeRect,
            cursorPos.x - activeDropNodeRect.x,
            cursorPos.y - activeDropNodeRect.y,
            centerAreaFraction,
          );
        }
      }

      const hasChangedHighlightedArea =
        activeDropNodeId !== dragOverNodeId || activeDropZone !== dragOverNodeZone;

      if (
        activeDropNodeId &&
        activeDropZone &&
        hasChangedHighlightedArea &&
        availableDropTargetIds.has(activeDropNodeId)
      ) {
        api.nodeDragOver({ nodeId: activeDropNodeId, zone: activeDropZone });
      } else if (dragOverNodeId && (!activeDropNodeId || !activeDropZone)) {
        api.nodeDragOver({ nodeId: null, zone: null });
      }
    },
    [
      getViewCoordinates,
      availableDropTargets,
      nodesInfo,
      dom,
      dragOverNodeId,
      dragOverNodeZone,
      availableDropTargetIds,
      api,
    ],
  );

  const getNodeHighlightedZone = React.useCallback(
    (node: appDom.AppDomNode): RectZone | null => {
      if (dragOverNodeZone === RectZone.CENTER) {
        if (node.id !== dragOverNodeId) {
          const parent = appDom.getParent(dom, node);

          // Is dragging over parent element center
          if (parent && !appDom.isPage(parent) && parent.id === dragOverNodeId) {
            const parentChildren = appDom.isElement(parent)
              ? appDom.getChildNodes(dom, parent).children
              : [];

            const isParentLastChild =
              parentChildren.length > 0 && node.id === parentChildren[parentChildren.length - 1].id;

            const parentNodeInfo = nodesInfo[parent.id];

            return parentNodeInfo && isParentLastChild
              ? getChildNodeHighlightedZone(parentNodeInfo.direction)
              : null;
          }
          return null;
        }
        // Is dragging over own element center
        if (node.id === dragOverNodeId) {
          const nodeChildren =
            (appDom.isElement(node) && appDom.getChildNodes(dom, node).children) || [];

          return nodeChildren && nodeChildren.length === 0 ? RectZone.CENTER : null;
        }
        return null;
      }
      return node.id === dragOverNodeId ? dragOverNodeZone : null;
    },
    [dom, dragOverNodeId, dragOverNodeZone, nodesInfo],
  );

  const handleDragLeave = React.useCallback(
    () => api.nodeDragOver({ nodeId: null, zone: null }),
    [api],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<Element>) => {
      const draggedNode = getCurrentlyDraggedNode();
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!draggedNode || !cursorPos || !dragOverNodeId || !dragOverNodeZone) {
        return;
      }

      const dragOverNode = appDom.getNode(dom, dragOverNodeId);
      let parent = appDom.getParent(dom, dragOverNode);
      const originalParent = parent;

      const isDraggingOverPage = (dragOverNode && appDom.isPage(dragOverNode)) || false;

      if (isDraggingOverPage) {
        const container = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
        domApi.addNode(container, dragOverNode, 'children');
        domApi.addNode(draggedNode, container, 'children');
      }

      if (!isDraggingOverPage && parent) {
        const isOriginalParentPage = appDom.isPage(originalParent);
        const isOriginalParentRow = appDom.isElement(originalParent) && isPageRow(originalParent);

        if (!isOriginalParentPage && !appDom.isElement(parent)) {
          throw new Error(`Invalid drop target "${parent.id}" of type "${parent.type}"`);
        }

        if (isOriginalParentPage && dragOverNodeZone && dragOverNodeZone !== RectZone.CENTER) {
          if ([RectZone.TOP, RectZone.BOTTOM].includes(dragOverNodeZone)) {
            const rowContainer = appDom.createElement(dom, PAGE_ROW_COMPONENT_ID, {});
            domApi.addNode(rowContainer, parent, 'children');
            parent = rowContainer;
          } else {
            const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
            domApi.addNode(columnContainer, dragOverNode, 'children');
            parent = columnContainer;
          }
        }

        const isDraggingOverRow = isPageRow(dragOverNode);
        const isDraggingOverColumn = isPageColumn(dragOverNode);

        if (dragOverNodeZone === RectZone.CENTER) {
          if (isDraggingOverRow) {
            const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
            domApi.addNode(columnContainer, dragOverNode, 'children');
            parent = columnContainer;
          }

          domApi.addNode(
            draggedNode,
            isDraggingOverRow ? parent : dragOverNode,
            'children',
            dragOverNode.parentIndex,
          );
        }

        if ([RectZone.TOP, RectZone.BOTTOM].includes(dragOverNodeZone)) {
          if (isOriginalParentRow && !isDraggingOverColumn) {
            const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
            domApi.addNode(columnContainer, parent, 'children');
            parent = columnContainer;

            if (dragOverNodeZone === RectZone.TOP) {
              domApi.moveNode(dragOverNode.id, parent.id, 'children');
            }
            if (dragOverNodeZone === RectZone.BOTTOM) {
              domApi.moveNode(dragOverNode.id, parent.id, 'children');
            }
          }
          domApi.addNode(
            draggedNode,
            isDraggingOverColumn ? dragOverNode : parent,
            'children',
            dragOverNode.parentIndex,
          );
        }

        if ([RectZone.RIGHT, RectZone.LEFT].includes(dragOverNodeZone)) {
          if (isDraggingOverColumn) {
            const columnContainer = appDom.createElement(dom, PAGE_COLUMN_COMPONENT_ID, {});
            domApi.addNode(columnContainer, parent, 'children');
            parent = columnContainer;
          }

          if (dragOverNodeZone === RectZone.RIGHT) {
            domApi.addNode(draggedNode, parent, 'children', dragOverNode.parentIndex);
          }
          if (dragOverNodeZone === RectZone.LEFT) {
            domApi.addNode(draggedNode, parent, 'children', dragOverNode.parentIndex);
          }
        }

        if (selection) {
          const dragParent = appDom.getParent(dom, draggedNode);
          const dragParentParent = dragParent && appDom.getParent(dom, dragParent);

          const isOnlyLayoutContainerChild =
            dragParent &&
            appDom.isElement(dragParent) &&
            isPageLayoutComponent(dragParent) &&
            appDom.getChildNodes(dom, dragParent).children.length === 1;

          if (isOnlyLayoutContainerChild) {
            const isParentOnlyRowColumn =
              dragParentParent &&
              appDom.isElement(dragParentParent) &&
              isPageRow(dragParentParent) &&
              appDom.getChildNodes(dom, dragParentParent).children.length === 1;

            domApi.removeNode(dragParent.id);

            if (isParentOnlyRowColumn) {
              domApi.removeNode(dragParentParent.id);
            }
          }
        }
      }

      api.nodeDragEnd();
      if (newNode) {
        api.select(newNode.id);
      }
    },
    [
      api,
      dom,
      domApi,
      dragOverNodeId,
      dragOverNodeZone,
      getCurrentlyDraggedNode,
      getViewCoordinates,
      newNode,
      selection,
    ],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEvent | React.DragEvent) => {
      event.preventDefault();
      api.nodeDragEnd();
    },
    [api],
  );

  React.useEffect(() => {
    const handleDragOverDefault = (event: DragEvent) => {
      // Make the whole window a drop target to prevent the return animation happening on dragend
      event.preventDefault();
    };
    window.addEventListener('dragover', handleDragOverDefault);
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragover', handleDragOverDefault);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [handleDragEnd]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const cursorPos = getViewCoordinates(event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const newSelectedNodeId = findNodeAt(pageNodes, nodesInfo, cursorPos.x, cursorPos.y);
      const newSelectedNode = newSelectedNodeId && appDom.getMaybeNode(dom, newSelectedNodeId);
      if (newSelectedNode && appDom.isElement(newSelectedNode)) {
        api.select(newSelectedNodeId);
      } else {
        api.select(null);
      }
    },
    [getViewCoordinates, pageNodes, nodesInfo, dom, api],
  );

  const handleDelete = React.useCallback(
    (nodeId: NodeId) => {
      const toRemove = appDom.getNode(dom, nodeId);
      const parent = appDom.getParent(dom, toRemove);
      const parentParent = parent && appDom.getParent(dom, parent);

      const isOnlyLayoutContainerChild =
        parent &&
        appDom.isElement(parent) &&
        isPageLayoutComponent(parent) &&
        appDom.getChildNodes(dom, parent).children.length === 1;

      domApi.removeNode(toRemove.id);

      if (isOnlyLayoutContainerChild) {
        const isParentOnlyRowColumn =
          parentParent &&
          appDom.isElement(parentParent) &&
          isPageRow(parentParent) &&
          appDom.getChildNodes(dom, parentParent).children.length === 1;

        domApi.removeNode(parent.id);

        if (isParentOnlyRowColumn) {
          domApi.removeNode(parentParent.id);
        }
      }

      api.deselect();
    },
    [dom, domApi, api],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (selection && event.key === 'Backspace') {
        handleDelete(selection);
      }
    },
    [selection, handleDelete],
  );
  const selectedRect = selectedNode ? nodesInfo[selectedNode.id]?.rect : null;

  const nodesWithInteraction = React.useMemo<Set<NodeId>>(() => {
    if (!selectedNode) {
      return new Set();
    }
    return new Set(
      [...appDom.getPageAncestors(dom, selectedNode), selectedNode].map((node) => node.id),
    );
  }, [dom, selectedNode]);

  const handleLoad = React.useCallback((frameWindow: Window) => {
    editorWindowRef.current = frameWindow;
    setOverlayKey((key) => key + 1);
  }, []);

  const handlePageViewStateUpdate = React.useCallback(() => {
    const rootElm = editorWindowRef.current?.document.getElementById(HTML_ID_APP_ROOT);

    if (!rootElm) {
      return;
    }

    api.pageViewStateUpdate(getPageViewState(rootElm));
  }, [api]);

  const [rootElm, setRootElm] = React.useState<HTMLElement | null>();

  const handleRuntimeEvent = React.useCallback(
    (event: RuntimeEvent) => {
      switch (event.type) {
        case 'propUpdated': {
          const node = appDom.getNode(dom, event.nodeId as NodeId, 'element');
          const actual = node.props?.[event.prop];
          if (actual && actual.type !== 'const') {
            console.warn(`Can't update a non-const prop "${event.prop}" on node "${node.id}"`);
            return;
          }

          const newValue: unknown =
            typeof event.value === 'function' ? event.value(actual?.value) : event.value;

          domApi.setNodeNamespacedProp(node, 'props', event.prop, {
            type: 'const',
            value: newValue,
          });
          return;
        }
        case 'pageStateUpdated': {
          api.pageStateUpdate(event.pageState);
          return;
        }
        case 'pageBindingsUpdated': {
          api.pageBindingsUpdate(event.bindings);
          return;
        }
        case 'afterRender': {
          const editorWindow = editorWindowRef.current ?? null;
          setRootElm(editorWindow?.document.getElementById(HTML_ID_APP_ROOT));
          return;
        }
        default:
          throw new Error(
            `received unrecognized event "${(event as RuntimeEvent).type}" from editor runtime`,
          );
      }
    },
    [dom, domApi, api],
  );

  const handleRuntimeEventRef = React.useRef(handleRuntimeEvent);
  React.useLayoutEffect(() => {
    handleRuntimeEventRef.current = handleRuntimeEvent;
  }, [handleRuntimeEvent]);

  React.useEffect(() => {
    if (editorWindowRef.current) {
      const editorWindow = editorWindowRef.current;

      const cleanupHandler = setEventHandler(editorWindow, (event) =>
        handleRuntimeEventRef.current(event),
      );

      return cleanupHandler;
    }
    return () => {};
  }, [overlayKey]);

  React.useEffect(() => {
    if (!rootElm) {
      return () => {};
    }

    handlePageViewStateUpdate();
    const handlePageUpdateThrottled = throttle(handlePageViewStateUpdate, 250, {
      trailing: true,
    });

    const mutationObserver = new MutationObserver(handlePageUpdateThrottled);

    mutationObserver.observe(rootElm, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    const resizeObserver = new ResizeObserver(handlePageUpdateThrottled);

    resizeObserver.observe(rootElm);
    rootElm.querySelectorAll('*').forEach((elm) => resizeObserver.observe(elm));

    return () => {
      handlePageUpdateThrottled.cancel();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [overlayKey, handlePageViewStateUpdate, rootElm]);

  return (
    <RenderPanelRoot className={className}>
      <EditorCanvasHost
        appId={appId}
        editor
        className={classes.view}
        dom={dom}
        pageNodeId={pageNodeId}
        onLoad={handleLoad}
      />
      <EditorOverlay key={overlayKey} window={editorWindowRef.current}>
        <OverlayRoot
          className={clsx({
            [overlayClasses.componentDragging]: highlightLayout,
          })}
          // Need this to be able to capture key events
          tabIndex={0}
          // This component has `pointer-events: none`, but we will selectively enable pointer-events
          // for its children. We can still capture the click gobally
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onDragEnd={handleDragEnd}
        >
          {pageNodes.map((node) => {
            const nodeLayout = nodesInfo[node.id];
            if (!nodeLayout?.rect) {
              return null;
            }

            const nodeInfo = nodesInfo[node.id];

            const isPageNodeHub = pageNodes.length === 1;

            const hasContainer = nodeInfo ? hasContainerComponent(nodeInfo) : false;

            let hasEmptyContainer = false;
            if (hasContainer) {
              const childNodes =
                (appDom.isElement(node) && appDom.getChildNodes(dom, node).children) || [];
              hasEmptyContainer = childNodes.length === 0;
            }

            return (
              <React.Fragment key={node.id}>
                {isPageNodeHub || appDom.isElement(node) ? (
                  <NodeHud
                    node={node}
                    rect={nodeLayout.rect}
                    highlightedZone={getNodeHighlightedZone(node)}
                    selected={selectedNode?.id === node.id}
                    allowInteraction={isPageNodeHub ? false : nodesWithInteraction.has(node.id)}
                    onDragStart={handleDragStart}
                    onDelete={() => handleDelete(node.id)}
                    hasEmptyContainer={hasEmptyContainer}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
          {/* 
            This overlay allows passing through pointer-events through a pinhole
            This allows interactivity on the selected element only, while maintaining
            a reliable click target for the rest of the page
          */}
          <PinholeOverlay className={overlayClasses.hudOverlay} pinhole={selectedRect} />
        </OverlayRoot>
      </EditorOverlay>
    </RenderPanelRoot>
  );
}
