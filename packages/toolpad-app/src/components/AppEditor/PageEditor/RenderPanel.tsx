import * as React from 'react';
import clsx from 'clsx';
import throttle from 'lodash-es/throttle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, styled } from '@mui/material';
import { RuntimeEvent } from '@mui/toolpad-core';
import { setEventHandler } from '@mui/toolpad-core/runtime';
import { NodeId, NodesInfo } from '../../../types';
import * as appDom from '../../../appDom';
import EditorCanvasHost from './EditorCanvasHost';
import { absolutePositionCss, Rectangle, rectContainsPoint } from '../../../utils/geometry';
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
  dropPreview: 'Toolpad_DropPreview',
  selected: 'Toolpad_Selected',
  allowNodeInteraction: 'Toolpad_AllowNodeInteraction',
  layout: 'Toolpad_Layout',
  active: 'Toolpad_Active',
  available: 'Toolpad_Available',
  componentDragging: 'Toolpad_ComponentDragging',
  selectionHint: 'Toolpad_SelectionHint',
  hudOverlay: 'Toolpad_HudOverlay',
};

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
    [`&.${overlayClasses.dropPreview}`]: {
      border: '2px solid green',
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

interface SelectionHudProps {
  node: appDom.ElementNode;
  rect: Rectangle;
  hasDropPreview?: boolean;
  selected?: boolean;
  allowInteraction?: boolean;
  onDragStart?: React.DragEventHandler<HTMLElement>;
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
}

function NodeHud({
  node,
  hasDropPreview,
  selected,
  allowInteraction,
  rect,
  onDragStart,
  onDelete,
}: SelectionHudProps) {
  const dom = useDom();

  const componentId = getElementNodeComponentId(node);
  const component = useToolpadComponent(dom, componentId);

  const isLayoutComponent =
    componentId === PAGE_ROW_COMPONENT_ID || componentId === PAGE_COLUMN_COMPONENT_ID;

  return (
    <div
      draggable
      data-node-id={node.id}
      onDragStart={onDragStart}
      style={absolutePositionCss(rect)}
      className={clsx(overlayClasses.nodeHud, {
        [overlayClasses.layout]: isLayoutComponent,
        [overlayClasses.dropPreview]: hasDropPreview,
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

  const [dropPreviewNodeId, setDropPreviewNodeId] = React.useState<NodeId | null>(null);

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

      const newActiveDropNodeId = findNodeAt(
        availableDropTargets,
        nodesInfo,
        cursorPos.x,
        cursorPos.y,
      );

      if (
        newActiveDropNodeId &&
        newActiveDropNodeId !== dropPreviewNodeId &&
        availableDropTargetIds.has(newActiveDropNodeId)
      ) {
        setDropPreviewNodeId(newActiveDropNodeId);
      }

      event.preventDefault();

      if (newActiveDropNodeId) {
        api.nodeDragOver(newActiveDropNodeId);
      } else {
        api.nodeDragOver(null);
      }
    },
    [
      api,
      availableDropTargetIds,
      availableDropTargets,
      dropPreviewNodeId,
      getViewCoordinates,
      nodesInfo,
    ],
  );

  const handleDragLeave = React.useCallback(() => api.nodeDragOver(null), [api]);

  const handleDrop = React.useCallback(() => {}, []);

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

      const isOnlyRowElement =
        parent &&
        appDom.isElement(parent) &&
        isPageRow(parent) &&
        appDom.getChildNodes(dom, parent).children.length === 1;

      domApi.removeNode(toRemove.id);

      if (isOnlyRowElement) {
        domApi.removeNode(parent.id);
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

            const hasDropPreview = node.id === dropPreviewNodeId;

            return (
              appDom.isElement(node) && (
                <NodeHud
                  key={node.id}
                  node={node}
                  rect={nodeLayout.rect}
                  hasDropPreview={hasDropPreview}
                  selected={selectedNode?.id === node.id}
                  allowInteraction={nodesWithInteraction.has(node.id)}
                  onDragStart={handleDragStart}
                  onDelete={() => handleDelete(node.id)}
                />
              )
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
