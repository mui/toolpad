import { styled } from '@mui/system';
import * as React from 'react';
import clsx from 'clsx';
import {
  NodeId,
  NodeLayout,
  SlotLayout,
  SlotLayoutInsert,
  StudioPage,
  ViewLayout,
} from '../../types';
import { getAncestors, getDecendants, nodesByDepth } from '../../studioPage';
import StudioView, { getNodeLayout, getViewCoordinates } from '../PageView';
import {
  absolutePositionCss,
  distanceToLine,
  distanceToRect,
  rectContainsPoint,
} from '../../utils/geometry';
import { ExactEntriesOf } from '../../utils/types';
import { getSlots } from '../PageView/Slot';
import { EditorState } from '../../editorState';
import { PinholeOverlay } from '../../PinholeOverlay';
import { useEditorApi, useEditorState } from './EditorProvider';

const classes = {
  hud: 'StudioHud',
  view: 'StudioView',
  nodeHud: 'StudioNodeHud',
  slotHud: 'StudioSlotHud',
  insertSlotHud: 'StudioInsertSlotHud',
  selected: 'StudioSelected',
  allowNodeInteraction: 'StudioAllowNodeInteraction',
  active: 'StudioActive',
  componentDragging: 'StudioComponentDragging',
  selectionHint: 'StudioSelectionHint',
  hudOverlay: 'StudioHudOverlay',
};

const StudioViewEditorRoot = styled('div')({
  position: 'relative',
  overflow: 'auto',

  [`& .${classes.hud}`]: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  [`& .${classes.view}`]: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  [`& .${classes.selectionHint}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    cursor: 'grab',
    display: 'none',
    position: 'absolute',
    right: 0,
    background: 'red',
    color: 'white',
    fontSize: 11,
    padding: `0 4px`,
  },

  [`& .${classes.nodeHud}`]: {
    // capture mouse events
    pointerEvents: 'initial',
    position: 'absolute',
    [`&.${classes.selected}`]: {
      border: '1px solid red',
      [`& .${classes.selectionHint}`]: {
        display: 'block',
      },
    },
    [`&.${classes.allowNodeInteraction}`]: {
      // block pointer-events so we can interact with the selection
      pointerEvents: 'none',
    },
  },

  [`& .${classes.componentDragging}`]: {
    [`& .${classes.insertSlotHud}`]: {
      border: '1px dashed #DDD',
    },
  },

  [`& .${classes.insertSlotHud}`]: {
    position: 'absolute',

    [`&.${classes.active}`]: {
      border: '1px solid green',
    },
  },

  [`& .${classes.slotHud}`]: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: 'green',
    border: '1px dashed green',
    opacity: 0.5,
    [`&.${classes.active}`]: {
      border: '1px solid green',
      opacity: 1,
    },
  },

  [`& .${classes.hudOverlay}`]: {
    position: 'absolute',
    inset: '0 0 0 0',
  },
});

function insertSlotAbsolutePositionCss(slot: SlotLayoutInsert): React.CSSProperties {
  return slot.direction === 'horizontal'
    ? {
        left: slot.x,
        top: slot.y,
        height: slot.size,
      }
    : {
        left: slot.x,
        top: slot.y,
        width: slot.size,
      };
}

function findNodeAt(page: StudioPage, viewLayout: ViewLayout, x: number, y: number): NodeId | null {
  const nodes = nodesByDepth(page);
  // Search deepest nested first
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const nodeId = nodes[i];
    const nodeLayout = viewLayout[nodeId];
    if (nodeLayout && rectContainsPoint(nodeLayout.rect, x, y)) {
      return nodeId;
    }
  }
  return null;
}

/**
 * Return all nodes that are available for insertion.
 * i.e. Exclude all decendants of the current selection since inserting in one of
 * them would create a cyclic structure.
 */
function getAvailableNode(state: EditorState): NodeId[] {
  const nodes = nodesByDepth(state.page);
  const excludedNodes = new Set(
    state.selection ? [state.selection, ...getDecendants(state.page, state.selection)] : [],
  );
  return nodes.filter((nodeId) => !excludedNodes.has(nodeId));
}

interface SlotIndex {
  nodeId: NodeId;
  slot: string;
  index?: number;
}

/**
 * From an array of slots, returns the index of the closest one to a certain point
 */
function findClosestSlot(slots: SlotLayout[], x: number, y: number): SlotLayout | null {
  let closestDistance = Infinity;
  let closestSlot: SlotLayout | null = null;

  for (const slotLayout of slots) {
    let distance: number;
    if (slotLayout.type === 'slot') {
      distance = distanceToRect(slotLayout.rect, x, y);
    } else {
      distance =
        slotLayout.direction === 'horizontal'
          ? distanceToLine(
              slotLayout.x,
              slotLayout.y,
              slotLayout.x,
              slotLayout.y + slotLayout.size,
              x,
              y,
            )
          : distanceToLine(
              slotLayout.x,
              slotLayout.y,
              slotLayout.x + slotLayout.size,
              slotLayout.y,
              x,
              y,
            );
    }

    if (distance <= 0) {
      // We can bail out early
      return slotLayout;
    }
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSlot = slotLayout;
    }
  }

  return closestSlot;
}

function findActiveSlotInNode(nodeLayout: NodeLayout, x: number, y: number): SlotIndex | null {
  const { nodeId } = nodeLayout;
  const slots = nodeLayout.slots ?? [];
  const closestSlot = findClosestSlot(slots, x, y);
  if (closestSlot) {
    return { slot: closestSlot.name, nodeId, index: closestSlot.index };
  }
  return null;
}

function findActiveSlotAt(
  nodes: NodeId[],
  viewLayout: ViewLayout,
  x: number,
  y: number,
): SlotIndex | null {
  // Search deepest nested first
  let nodeLayout: NodeLayout | undefined;
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const nodeId = nodes[i];
    nodeLayout = viewLayout[nodeId];
    if (nodeLayout && rectContainsPoint(nodeLayout.rect, x, y)) {
      // Initially only consider slots of the node we're hovering
      const slotIndex = findActiveSlotInNode(nodeLayout, x, y);
      if (slotIndex) {
        return slotIndex;
      }
    }
  }
  // One last attempt, using the most shallow nodeLayout we found, regardless of
  // whether we are hovering it
  if (nodeLayout) {
    return findActiveSlotInNode(nodeLayout, x, y);
  }
  return null;
}

/**
 * We explictly calculate this through ES6 exports so they can be tree-shaken
 * when not running the editor.
 */
function getViewLayout(viewElm: HTMLElement): {
  layout: ViewLayout;
  elms: HTMLElement[];
} {
  const walker = document.createTreeWalker(viewElm, NodeFilter.SHOW_ELEMENT, null);

  const layout: ViewLayout = {};
  const elms: HTMLElement[] = [];
  let currentNode: NodeLayout | undefined;
  let currentNodeElm: HTMLElement | undefined;
  while (walker.nextNode()) {
    const elm = walker.currentNode as HTMLElement;
    const nodeLayout = getNodeLayout(viewElm, elm);
    if (nodeLayout) {
      elms.push(elm);
      currentNode = nodeLayout;
      currentNodeElm = elm;
      layout[nodeLayout.nodeId] = currentNode;
    } else if (currentNode && currentNodeElm) {
      currentNode.slots.push(...getSlots(currentNodeElm, elm));
    }
  }

  return { layout, elms };
}

export interface StudioViewEditorProps {
  className?: string;
}

export default function StudioViewEditor({ className }: StudioViewEditorProps) {
  const state = useEditorState();
  const api = useEditorApi();

  const viewRef = React.useRef<HTMLDivElement>(null);

  const [viewLayout, setViewLayout] = React.useState<ViewLayout>({});

  const observerRef = React.useRef<ResizeObserver | undefined>();

  React.useEffect(() => {
    // Running this in an effect as we want to capture the DOM state of the view after render has happened
    if (viewRef.current) {
      const { layout, elms } = getViewLayout(viewRef.current);
      setViewLayout(layout);

      if (!observerRef.current) {
        observerRef.current = new ResizeObserver(() => {
          if (viewRef.current) {
            const { layout: newLayout } = getViewLayout(viewRef.current);
            // TODO: any way we can update this without triggering rerenders if nothing changed?
            setViewLayout(newLayout);
          }
        });
      }

      const observer = observerRef.current;

      for (const elm of elms) {
        observer.observe(elm);
      }

      return () => observer.disconnect();
    }
    return () => {};
  }, [state.page]);

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<Element>) => {
      if (!viewRef.current) {
        return;
      }

      event.dataTransfer.dropEffect = 'move';
      const cursorPos = getViewCoordinates(viewRef.current, event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const nodeId = findNodeAt(state.page, viewLayout, cursorPos.x, cursorPos.y);

      if (nodeId) {
        api.nodeDragStart(nodeId);
      }
    },
    [api, state.page, viewLayout],
  );

  React.useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (!viewRef.current || (!state.newNode && !state.selection)) {
        return;
      }

      const cursorPos = getViewCoordinates(viewRef.current, event.clientX, event.clientY);

      if (!cursorPos) {
        api.addComponentDragOver(null);
        return;
      }

      const nodes = getAvailableNode(state);
      const slotIndex = findActiveSlotAt(nodes, viewLayout, cursorPos.x, cursorPos.y);

      const activeSlot =
        slotIndex &&
        viewLayout[slotIndex.nodeId]?.slots?.find(
          (slot) => slot.name === slotIndex.slot && slot.index === slotIndex.index,
        );

      event.preventDefault();
      if (activeSlot) {
        api.addComponentDragOver({
          nodeId: slotIndex.nodeId,
          slot: activeSlot.name,
          index: activeSlot.index,
        });
      } else {
        api.addComponentDragOver(null);
      }
    };

    const handleDrop = (event: DragEvent) => {
      if (!viewRef.current || (!state.newNode && !state.selection)) {
        return;
      }

      const cursorPos = getViewCoordinates(viewRef.current, event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const nodes = getAvailableNode(state);
      const slotIndex = findActiveSlotAt(nodes, viewLayout, cursorPos.x, cursorPos.y);

      const activeSlot =
        slotIndex &&
        viewLayout[slotIndex.nodeId]?.slots?.find(
          (slot) => slot.name === slotIndex.slot && slot.index === slotIndex.index,
        );

      if (activeSlot) {
        api.addComponentDrop({
          nodeId: slotIndex.nodeId,
          slot: activeSlot.name,
          index: activeSlot.index,
        });
      } else {
        api.addComponentDrop(null);
      }
    };

    const handleDragEnd = (event: DragEvent) => {
      event.preventDefault();
      api.addComponentDragEnd();
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragend', handleDragEnd);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, [state, viewLayout, api]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!viewRef.current) {
        return;
      }

      const cursorPos = getViewCoordinates(viewRef.current, event.clientX, event.clientY);

      if (!cursorPos) {
        return;
      }

      const selectedNode = findNodeAt(state.page, viewLayout, cursorPos.x, cursorPos.y);
      api.select(selectedNode);
    },
    [api, state.page, viewLayout],
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        api.selectionRemove();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [api]);

  const selectedRect = state.selection ? viewLayout[state.selection]?.rect : null;

  const nodesWithInteraction = React.useMemo<Set<NodeId>>(() => {
    return state.selection
      ? new Set([...getAncestors(state.page, state.selection), state.selection])
      : new Set();
  }, [state.selection, state.page]);

  return (
    <StudioViewEditorRoot className={className}>
      <StudioView className={classes.view} ref={viewRef} page={state.page} />
      <div
        className={clsx(classes.hud, {
          [classes.componentDragging]: state.highlightLayout,
        })}
        // This component has `pointer-events: none`, but we will slectively enable pointer-events
        // for its children. We can still capture the click gobally
        onClick={handleClick}
      >
        {(Object.entries(viewLayout) as ExactEntriesOf<ViewLayout>).map(([nodeId, nodeLayout]) => {
          if (!nodeLayout) {
            return null;
          }
          const node = state.page.nodes[nodeId];
          return node ? (
            <React.Fragment key={nodeId}>
              <div
                draggable
                onDragStart={handleDragStart}
                style={absolutePositionCss(nodeLayout.rect)}
                className={clsx(classes.nodeHud, {
                  [classes.selected]: state.selection === nodeId,
                  [classes.allowNodeInteraction]: nodesWithInteraction.has(nodeId),
                })}
              >
                <div className={classes.selectionHint}>{node.component}</div>
                {nodeLayout.slots.map((slotLayout, index) =>
                  slotLayout.type === 'insert' ? (
                    <div
                      key={`${slotLayout.name}:${slotLayout.index}`}
                      style={insertSlotAbsolutePositionCss(slotLayout)}
                      className={clsx(classes.insertSlotHud, {
                        [classes.active]:
                          state.highlightedSlot?.nodeId === nodeId &&
                          state.highlightedSlot?.slot === slotLayout.name &&
                          state.highlightedSlot?.index === index,
                      })}
                    />
                  ) : (
                    <div
                      key={slotLayout.name}
                      style={absolutePositionCss(slotLayout.rect)}
                      className={clsx(classes.slotHud, {
                        [classes.active]:
                          state.highlightedSlot?.nodeId === nodeId &&
                          state.highlightedSlot?.slot === slotLayout.name,
                      })}
                    >
                      Insert Here
                    </div>
                  ),
                )}
              </div>
            </React.Fragment>
          ) : null;
        })}
        {/* 
          This overlay allows passing through pointer-events through a pinhole
          This allows interactivity on the selected element only, while maintaining
          a reliable click target for the rest of the page
        */}
        <PinholeOverlay
          className={classes.hudOverlay}
          onClick={handleClick}
          pinhole={selectedRect}
        />
      </div>
    </StudioViewEditorRoot>
  );
}
