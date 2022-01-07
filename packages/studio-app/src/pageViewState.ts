import { RUNTIME_PROP_NODE_ID, RUNTIME_PROP_STUDIO_SLOTS } from '@mui/studio-core';
import { FiberNode, Hook } from 'react-devtools-inline';
import {
  NodeId,
  NodeState,
  SlotLayoutInsert,
  ViewState,
  SlotDirection,
  SlotLayoutCenter,
  FlowDirection,
} from './types';
import { getRelativeBoundingBox } from './utils/geometry';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: Hook;
  }
}

function getNodeViewState(
  fiber: FiberNode,
  viewElm: Element,
  elm: Element,
  nodeId: NodeId,
): NodeState | null {
  if (nodeId) {
    const rect = getRelativeBoundingBox(viewElm, elm);
    return {
      nodeId,
      rect,
      slots: {},
      props: fiber.child?.memoizedProps ?? {},
      innerRect: rect,
      direction: 'column',
      slotType: 'none',
    };
  }
  return null;
}

function getSlotDirection(flow: FlowDirection): SlotDirection {
  switch (flow) {
    case 'row':
    case 'row-reverse':
      return 'horizontal';
    case 'column':
    case 'column-reverse':
      return 'vertical';
    default:
      throw new Error(`Invariant: Unrecognized direction "${flow}"`);
  }
}

interface GetInsertSlotsParams {
  nodeElm: Element;
  name: string;
  direction?: FlowDirection;
  container?: Element;
  items?: Iterable<Element>;
}

function getInsertSlots({
  nodeElm,
  name,
  direction = 'row',
  container = nodeElm,
  items = nodeElm.children,
}: GetInsertSlotsParams): SlotLayoutInsert[] {
  if (!container) {
    throw new Error(`Invariant: Slots element must have a parent`);
  }

  const rect = getRelativeBoundingBox(nodeElm, container);

  const slotDirection = getSlotDirection(direction);

  const size = slotDirection === 'horizontal' ? rect.height : rect.width;

  const boundaries = Array.from(items, (childElm) => {
    const childRect = getRelativeBoundingBox(nodeElm, childElm);
    switch (direction) {
      case 'row':
        return { start: childRect.x, end: childRect.x + childRect.width };
      case 'column':
        return { start: childRect.y, end: childRect.y + childRect.height };
      case 'row-reverse':
        return { start: childRect.x + childRect.width, end: childRect.x };
      case 'column-reverse':
        return { start: childRect.y + childRect.height, end: childRect.y };
      default:
        throw new Error(`Invariant: Unrecognized direction "${direction}"`);
    }
  });

  const offsets = [];
  if (boundaries.length > 0) {
    offsets.push(boundaries[0].start);
    const lastIdx = boundaries.length - 1;
    for (let i = 0; i < lastIdx; i += 1) {
      offsets.push((boundaries[i].end + boundaries[i + 1].start) / 2);
    }
    offsets.push(boundaries[lastIdx].end);
  }

  return offsets.map(
    (offset, index) =>
      ({
        type: 'insert',
        name,
        index,
        direction: slotDirection,
        x: slotDirection === 'horizontal' ? offset : rect.x,
        y: slotDirection === 'horizontal' ? rect.y : offset,
        size,
      } as const),
  );
}

interface GetSlotParams {
  nodeElm: Element;
  name: string;
  container?: Element;
}

function getSlot({ nodeElm, name, container = nodeElm }: GetSlotParams): SlotLayoutCenter {
  const rect = getRelativeBoundingBox(nodeElm, container);
  return {
    type: 'slot',
    name,
    index: 0,
    rect,
  };
}

function walkFibers(node: FiberNode, visitor: (node: FiberNode) => void) {
  visitor(node);
  if (node.child) {
    walkFibers(node.child, visitor);
  }
  if (node.sibling) {
    walkFibers(node.sibling, visitor);
  }
}

function getChildFibers(fiber: FiberNode) {
  const children: FiberNode[] = [];
  let current = fiber.child;
  while (current) {
    children.push(current);
    current = current.sibling;
  }
  return children;
}

export function getViewState(viewElm: HTMLElement): ViewState {
  // eslint-disable-next-line no-underscore-dangle
  const devtoolsHook = viewElm.ownerDocument.defaultView?.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (!devtoolsHook) {
    console.warn(`Can't read page layout as react devtools are not installed`);
    return {};
  }

  const viewState: ViewState = {};

  const rendererId = 1;
  const nodeElms = new Map<NodeId, Element>();
  Array.from(devtoolsHook.getFiberRoots(rendererId)).forEach((fiberRoot) => {
    if (fiberRoot.current) {
      walkFibers(fiberRoot.current, (fiber) => {
        if (!fiber.memoizedProps) {
          return;
        }

        const studioNodeId = fiber.memoizedProps[RUNTIME_PROP_NODE_ID] as string | undefined;
        if (studioNodeId) {
          const nodeId: NodeId = studioNodeId as NodeId;
          const elm = devtoolsHook.renderers.get(rendererId)?.findHostInstanceByFiber(fiber);
          if (elm) {
            nodeElms.set(nodeId, elm);
            const nodeViewState = getNodeViewState(fiber, viewElm, elm, nodeId);
            if (nodeViewState) {
              viewState[nodeId] = nodeViewState;
            }
          }
        }

        const studioSlots = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS] as string | undefined;
        if (studioSlots) {
          const name = studioSlots as string;
          const childfibers = getChildFibers(fiber);
          const direction = fiber.memoizedProps.direction as FlowDirection | undefined;
          const parentId: NodeId = fiber.memoizedProps.parentId as NodeId;
          const parentElm = nodeElms.get(parentId);
          const nodeViewState = viewState[parentId];

          if (name === 'children') {
            const firstChildElm = devtoolsHook.renderers
              .get(rendererId)
              ?.findHostInstanceByFiber(fiber);
            const childContainerElm = firstChildElm?.parentElement;
            if (childContainerElm && nodeViewState) {
              nodeViewState.innerRect = getRelativeBoundingBox(viewElm, childContainerElm);
              nodeViewState.direction = window.getComputedStyle(childContainerElm)
                .flexDirection as FlowDirection;
              nodeViewState.slotType = direction ? 'multiple' : 'single';
            }
          }

          if (parentElm && nodeViewState) {
            if (direction) {
              const items = childfibers
                .map((childFiber) =>
                  devtoolsHook.renderers.get(rendererId)?.findHostInstanceByFiber(childFiber),
                )
                .filter(Boolean);
              const slots = getInsertSlots({
                nodeElm: parentElm,
                items,
                direction,
                name,
                container: parentElm,
              });
              nodeViewState.slots[name] = slots;
            } else {
              const slotContainerElm = devtoolsHook.renderers
                .get(rendererId)
                ?.findHostInstanceByFiber(fiber);
              if (slotContainerElm) {
                const slot = getSlot({
                  nodeElm: parentElm,
                  name,
                  container: slotContainerElm,
                });
                nodeViewState.slots[name] = [slot];
              }
            }
          }
        }
      });
    }
  });

  return viewState;
}
