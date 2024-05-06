import * as React from 'react';
import invariant from 'invariant';
import { throttle } from 'lodash-es';
import {
  queryClient,
  FlowDirection,
  SlotType,
  useAppHost,
  CanvasEventsContext,
} from '@toolpad/studio-runtime';
import { update } from '@toolpad/utils/immutability';
import { AppCanvasState, NodeInfo, PageViewState, SlotsState } from '../types';
import {
  getRelativeBoundingRect,
  getRelativeOuterRect,
  rectContainsPoint,
} from '../utils/geometry';
import { ToolpadBridge, bridge, setCommandHandler } from './ToolpadBridge';
import { ToolpadApp, CanvasHooks, CanvasHooksContext } from '../runtime';

const handleScreenUpdate = throttle(
  () => {
    bridge?.canvasEvents.emit('screenUpdate', {});
  },
  50,
  { trailing: true },
);

export function updateNodeInfo(nodeInfo: NodeInfo, rootElm: Element): NodeInfo {
  const nodeElm = rootElm.querySelector(`[data-toolpad-node-id="${nodeInfo.nodeId}"]`);

  if (!nodeElm) {
    return nodeInfo;
  }

  const rect = getRelativeOuterRect(rootElm, nodeElm);

  const slotElms = rootElm.querySelectorAll(`[data-toolpad-slot-parent="${nodeInfo.nodeId}"]`);

  const slots: SlotsState = {};

  for (const slotElm of slotElms) {
    const slotName = slotElm.getAttribute('data-toolpad-slot-name');
    const slotType = slotElm.getAttribute('data-toolpad-slot-type');

    invariant(slotName, 'Slot name not found');
    invariant(slotType, 'Slot type not found');

    if (slots[slotName]) {
      continue;
    }

    const slotRect =
      slotType === 'single'
        ? getRelativeBoundingRect(rootElm, slotElm)
        : getRelativeBoundingRect(rootElm, slotElm);

    const display = window.getComputedStyle(slotElm).display;
    let flowDirection: FlowDirection = 'row';
    if (slotType === 'layout') {
      flowDirection = 'column';
    } else if (display === 'grid') {
      const gridAutoFlow = window.getComputedStyle(slotElm).gridAutoFlow;
      flowDirection = gridAutoFlow === 'row' ? 'column' : 'row';
    } else if (display === 'flex') {
      flowDirection = window.getComputedStyle(slotElm).flexDirection as FlowDirection;
    }

    slots[slotName] = {
      type: slotType as SlotType,
      rect: slotRect,
      flowDirection,
    };
  }

  return { ...nodeInfo, rect, slots };
}

export interface AppCanvasProps {
  state: AppCanvasState;
  basename: string;
}

export default function AppCanvas({ basename, state }: AppCanvasProps) {
  const [readyBridge, setReadyBridge] = React.useState<ToolpadBridge | undefined>();

  const appRootRef = React.useRef<HTMLDivElement>();
  const appRootCleanupRef = React.useRef<() => void>();
  const onAppRoot = React.useCallback((appRoot: HTMLDivElement) => {
    appRootCleanupRef.current?.();
    appRootCleanupRef.current = undefined;

    if (!appRoot) {
      return;
    }

    appRootRef.current = appRoot;

    const mutationObserver = new MutationObserver(handleScreenUpdate);

    mutationObserver.observe(appRoot, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });

    const resizeObserver = new ResizeObserver(handleScreenUpdate);

    resizeObserver.observe(appRoot);
    appRoot.querySelectorAll('*').forEach((elm) => resizeObserver.observe(elm));

    appRootCleanupRef.current = () => {
      handleScreenUpdate.cancel();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(
    () => () => {
      appRootCleanupRef.current?.();
      appRootCleanupRef.current = undefined;
    },
    [],
  );

  // Notify host after every render
  React.useEffect(() => {
    if (appRootRef.current) {
      // Only notify screen updates if the approot is rendered
      handleScreenUpdate();
    }
  });

  const viewState = React.useRef<PageViewState>({ nodes: {} });

  React.useEffect(() => {
    if (!bridge) {
      return;
    }

    setCommandHandler(bridge.canvasCommands, 'getPageViewState', () => {
      invariant(appRootRef.current, 'App root not found');
      let nodes = viewState.current.nodes;

      for (const [nodeId, nodeInfo] of Object.entries(nodes)) {
        nodes = update(nodes, {
          [nodeId]: updateNodeInfo(nodeInfo, appRootRef.current),
        });
      }

      return { nodes };
    });

    setCommandHandler(bridge.canvasCommands, 'scrollComponent', (nodeId) => {
      if (!nodeId) {
        return;
      }
      invariant(appRootRef.current, 'App root not found');
      const canvasNode = appRootRef.current.querySelector(`[data-node-id='${nodeId}']`);
      canvasNode?.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'end' });
    });

    setCommandHandler(bridge.canvasCommands, 'getViewCoordinates', (clientX, clientY) => {
      if (!appRootRef.current) {
        return null;
      }
      const rect = appRootRef.current.getBoundingClientRect();
      if (rectContainsPoint(rect, clientX, clientY)) {
        return { x: clientX - rect.x, y: clientY - rect.y };
      }
      return null;
    });

    setCommandHandler(bridge.canvasCommands, 'invalidateQueries', () => {
      queryClient.invalidateQueries();
    });

    bridge.canvasEvents.emit('ready', {});
    setReadyBridge(bridge);
  }, []);

  const savedNodes = state?.savedNodes;
  const editorHooks: CanvasHooks = React.useMemo(() => {
    return {
      savedNodes,
      registerNode: (node, props, componentConfig) => {
        viewState.current.nodes[node.id] = {
          nodeId: node.id,
          props,
          componentConfig,
        };

        return () => {
          delete viewState.current.nodes[node.id];
        };
      },
    };
  }, [savedNodes]);

  const appHost = useAppHost();

  if (appHost.isCanvas) {
    return readyBridge ? (
      <CanvasHooksContext.Provider value={editorHooks}>
        <CanvasEventsContext.Provider value={readyBridge.canvasEvents}>
          <ToolpadApp rootRef={onAppRoot} basename={basename} state={state} />
        </CanvasEventsContext.Provider>
      </CanvasHooksContext.Provider>
    ) : null;
  }

  return <ToolpadApp basename={basename} state={state} />;
}
