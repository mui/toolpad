import {
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  RUNTIME_PROP_STUDIO_SLOTS_TYPE,
  SlotType,
} from '@mui/studio-core';
import { FiberNode, Hook } from 'react-devtools-inline';
import { NodeId, NodeState, ViewState, FlowDirection } from './types';
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
      props: fiber.child?.memoizedProps ?? {},
      slots: {},
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

        const studioSlotName = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS] as string | undefined;
        if (studioSlotName) {
          const slotType = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS_TYPE] as SlotType;
          const parentId: NodeId = fiber.memoizedProps.parentId as NodeId;
          const nodeViewState = viewState[parentId];

          const firstChildElm = devtoolsHook.renderers
            .get(rendererId)
            ?.findHostInstanceByFiber(fiber);
          const childContainerElm = firstChildElm?.parentElement;
          if (childContainerElm && nodeViewState) {
            const rect = getRelativeBoundingBox(viewElm, childContainerElm);
            const direction = window.getComputedStyle(childContainerElm)
              .flexDirection as FlowDirection;
            nodeViewState.slots[studioSlotName] = {
              type: slotType,
              rect,
              direction,
            };
          }
        }
      });
    }
  });

  return viewState;
}
