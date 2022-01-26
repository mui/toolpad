import {
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  RUNTIME_PROP_STUDIO_SLOTS_TYPE,
  RUNTIME_PROP_NODE_ERROR,
  SlotType,
  RuntimeError,
} from '@mui/studio-core';
import { FiberNode, Hook } from 'react-devtools-inline';
import { NodeId, NodeState, ViewState, FlowDirection } from './types';
import { getRelativeBoundingRect, getRelativeOuterRect } from './utils/geometry';

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
    const rect = getRelativeOuterRect(viewElm, elm);
    const error = fiber.memoizedProps?.[RUNTIME_PROP_NODE_ERROR] as RuntimeError | undefined;

    return {
      nodeId,
      error,
      rect,
      props: fiber.memoizedProps ?? {},
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

export function getViewState(rootElm: HTMLElement): ViewState {
  // eslint-disable-next-line no-underscore-dangle
  const devtoolsHook = rootElm.ownerDocument.defaultView?.__REACT_DEVTOOLS_GLOBAL_HOOK__;

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
          if (viewState[nodeId]) {
            // We can get multiple fibers with the [RUNTIME_PROP_NODE_ID] if the component
            // spreads its props. Let's assume the first we encounter is the one wrapped by
            // the code generator and bail out on any subsequent ones.
            return;
          }

          const elm = devtoolsHook.renderers.get(rendererId)?.findHostInstanceByFiber(fiber);
          if (elm) {
            nodeElms.set(nodeId, elm);
            const nodeViewState = getNodeViewState(fiber, rootElm, elm, nodeId);
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
            const rect = getRelativeBoundingRect(rootElm, childContainerElm);
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
