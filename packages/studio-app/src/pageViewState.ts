import {
  RUNTIME_PROP_NODE_ID,
  RUNTIME_PROP_STUDIO_SLOTS,
  SlotType,
  RuntimeError,
  LiveBindings,
  RuntimeEvent,
  ComponentConfig,
} from '@mui/studio-core';
import { FiberNode, Hook } from 'react-devtools-inline';
import { NodeId, FlowDirection, PageViewState, NodesInfo, NodeInfo } from './types';
import { getRelativeBoundingRect, getRelativeOuterRect } from './utils/geometry';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: Hook;
    __STUDIO_RUNTIME_PAGE_STATE__?: Record<string, unknown>;
    __STUDIO_RUNTIME_BINDINGS_STATE__?: LiveBindings;
    __STUDIO_RUNTIME_EVENT__?: RuntimeEvent[] | ((event: RuntimeEvent) => void);
  }
}

function getNodeViewInfo(
  fiber: FiberNode,
  viewElm: Element,
  elm: Element,
  nodeId: NodeId,
): NodeInfo | null {
  if (nodeId) {
    const rect = getRelativeOuterRect(viewElm, elm);
    const error = fiber.memoizedProps?.nodeError as RuntimeError | undefined;
    // We get the props from the child fiber because the current fiber is for the wrapper element
    // eslint-disable-next-line no-underscore-dangle
    const component: ComponentConfig<unknown> | undefined = (fiber.child?.elementType as any)
      ?.__config;

    const props = fiber.child?.memoizedProps ?? {};

    return {
      nodeId,
      error,
      component,
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

        const studioNodeId = fiber.memoizedProps[RUNTIME_PROP_NODE_ID] as string | undefined;

        if (studioNodeId) {
          const nodeId: NodeId = studioNodeId as NodeId;
          if (nodes[nodeId]) {
            // We can get multiple fibers with the [RUNTIME_PROP_NODE_ID] if the component
            // spreads its props. Let's assume the first we encounter is the one wrapped by
            // the code generator and bail out on any subsequent ones.
            return;
          }

          const elm = devtoolsHook.renderers.get(rendererId)?.findHostInstanceByFiber(fiber);
          if (elm) {
            nodeElms.set(nodeId, elm);
            const info = getNodeViewInfo(fiber, rootElm, elm, nodeId);
            if (info) {
              nodes[nodeId] = info;
            }
          }
        }

        const studioSlotName = fiber.memoizedProps[RUNTIME_PROP_STUDIO_SLOTS] as string | undefined;
        if (studioSlotName) {
          const slotType = fiber.memoizedProps.slotType as SlotType;
          const parentId: NodeId = fiber.memoizedProps.parentId as NodeId;
          const nodeSlots = nodes[parentId]?.slots;

          const firstChildElm = devtoolsHook.renderers
            .get(rendererId)
            ?.findHostInstanceByFiber(fiber);
          const childContainerElm = firstChildElm?.parentElement;

          if (childContainerElm && nodeSlots) {
            const rect = getRelativeBoundingRect(rootElm, childContainerElm);
            const direction = window.getComputedStyle(childContainerElm)
              .flexDirection as FlowDirection;
            nodeSlots[studioSlotName] = {
              type: slotType,
              rect,
              direction,
            };
          }
        }
      });
    }
  });

  return { nodes };
}

export function getPageViewState(rootElm: HTMLElement): PageViewState {
  const contentWindow = rootElm.ownerDocument.defaultView;

  return {
    ...getNodesViewInfo(rootElm),
    // eslint-disable-next-line no-underscore-dangle
    pageState: contentWindow?.__STUDIO_RUNTIME_PAGE_STATE__ ?? {},
    // eslint-disable-next-line no-underscore-dangle
    bindings: contentWindow?.__STUDIO_RUNTIME_BINDINGS_STATE__ ?? {},
  };
}
