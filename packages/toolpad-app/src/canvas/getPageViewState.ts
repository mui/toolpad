import type { FiberNode, Hook } from 'react-devtools-inline';
import { NodeId, RUNTIME_PROP_NODE_ID, RUNTIME_PROP_SLOTS, SlotType } from '@mui/toolpad-core';
import { NodeFiberHostProps } from '@mui/toolpad-core/runtime';
import { PageViewState, NodesInfo, NodeInfo, FlowDirection } from '../types';
import { getRelativeBoundingRect, getRelativeOuterRect } from '../utils/geometry';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: Hook;
  }
}

function getNodeViewInfo(
  fiber: FiberNode,
  viewElm: Element,
  elm: Element,
  nodeId: NodeId,
  fiberHostProps: NodeFiberHostProps,
): NodeInfo | null {
  if (nodeId) {
    const rect = getRelativeOuterRect(viewElm, elm);
    const props = fiber.child?.memoizedProps ?? {};

    return {
      nodeId,
      error: fiberHostProps.nodeError,
      componentConfig: fiberHostProps.componentConfig,
      rect,
      slots: {},
      props,
    };
  }
  return null;
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

export function getNodesViewInfo(rootElm: HTMLElement): {
  nodes: NodesInfo;
} {
  // eslint-disable-next-line no-underscore-dangle
  const devtoolsHook = rootElm.ownerDocument.defaultView?.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (!devtoolsHook) {
    console.warn(`Can't read page layout as react devtools are not installed`);
    return { nodes: {} };
  }

  const nodes: NodesInfo = {};

  const rendererId = 1;
  const nodeElms = new Map<NodeId, Element>();
  Array.from(devtoolsHook.getFiberRoots(rendererId)).forEach((fiberRoot) => {
    if (fiberRoot.current) {
      walkFibers(fiberRoot.current, (fiber) => {
        if (!fiber.memoizedProps) {
          return;
        }

        const nodeIdPropValue = fiber.memoizedProps[RUNTIME_PROP_NODE_ID] as string | undefined;

        if (nodeIdPropValue) {
          const fiberHostProps = fiber.memoizedProps as unknown as NodeFiberHostProps;

          const nodeId = fiberHostProps[RUNTIME_PROP_NODE_ID] as NodeId;
          if (nodes[nodeId]) {
            // We can get multiple fibers with the [RUNTIME_PROP_NODE_ID] if the component
            // spreads its props. Let's assume the first we encounter is the one wrapped by
            // the code generator and bail out on any subsequent ones.
            return;
          }

          const elm = devtoolsHook.renderers.get(rendererId)?.findHostInstanceByFiber(fiber);
          if (elm) {
            nodeElms.set(nodeId, elm);
            const info = getNodeViewInfo(fiber, rootElm, elm, nodeId, fiberHostProps);
            if (info) {
              nodes[nodeId] = info;
            }
          }
        }

        const slotNamePropValue = fiber.memoizedProps[RUNTIME_PROP_SLOTS] as string | undefined;
        if (slotNamePropValue) {
          const slotType = fiber.memoizedProps.slotType as SlotType;
          const parentId: NodeId = fiber.memoizedProps.parentId as NodeId;
          const nodeSlots = nodes[parentId]?.slots;

          // If there are 2 slots for the same prop name, consider only the first one
          if (nodeSlots && nodeSlots[slotNamePropValue]) {
            return;
          }

          const firstChildElm = devtoolsHook.renderers
            .get(rendererId)
            ?.findHostInstanceByFiber(fiber);

          const childContainerElm = firstChildElm?.parentElement;

          if (childContainerElm && nodeSlots) {
            const rect =
              slotType === 'single' || slotType === 'layout'
                ? getRelativeBoundingRect(rootElm, firstChildElm)
                : getRelativeBoundingRect(rootElm, childContainerElm);

            const display = window.getComputedStyle(childContainerElm).display;

            let flowDirection = 'row';
            if (display === 'grid') {
              const gridAutoFlow = window.getComputedStyle(childContainerElm).gridAutoFlow;
              flowDirection = gridAutoFlow === 'row' ? 'column' : 'row';
            } else if (display === 'flex') {
              flowDirection = window.getComputedStyle(childContainerElm).flexDirection;
            }

            nodeSlots[slotNamePropValue] = {
              type: slotType,
              rect,
              flowDirection: flowDirection as FlowDirection,
            };
          }
        }
      });
    }
  });

  return { nodes };
}

export default function getPageViewState(rootElm: HTMLElement): PageViewState {
  return getNodesViewInfo(rootElm);
}
