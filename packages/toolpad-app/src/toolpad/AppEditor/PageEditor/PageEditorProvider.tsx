import { NodeId, LiveBindings, ScopeMeta, ApplicationVm } from '@mui/toolpad-core';
import * as React from 'react';
import { update, updateOrCreate } from '@mui/toolpad-utils/immutability';
import * as appDom from '@mui/toolpad-core/appDom';
import { PageViewState } from '../../../types';
import { RectangleEdge } from '../../../utils/geometry';

export const DROP_ZONE_TOP = 'top';
export const DROP_ZONE_BOTTOM = 'bottom';
export const DROP_ZONE_LEFT = 'left';
export const DROP_ZONE_RIGHT = 'right';
export const DROP_ZONE_CENTER = 'center';
export type DropZone =
  | typeof DROP_ZONE_TOP
  | typeof DROP_ZONE_BOTTOM
  | typeof DROP_ZONE_LEFT
  | typeof DROP_ZONE_RIGHT
  | typeof DROP_ZONE_CENTER;

export interface PageEditorState {
  readonly type: 'page';
  readonly nodeId: NodeId;
  readonly newNode: appDom.ElementNode | null;
  readonly draggedNodeId: NodeId | null;
  readonly isDraggingOver: boolean;
  readonly dragOverNodeId: NodeId | null;
  readonly dragOverSlotParentProp: appDom.ParentProp<appDom.ElementNode | appDom.PageNode> | null;
  readonly dragOverZone: DropZone | null;
  readonly draggedEdge: RectangleEdge | null;
  readonly viewState: PageViewState;
  readonly pageState: Record<string, unknown>;
  readonly nodeData: Record<NodeId, Record<string, unknown> | undefined>;
  readonly globalScopeMeta: ScopeMeta;
  readonly bindings: LiveBindings;
  readonly vm: ApplicationVm;
}

export type PageEditorAction =
  | {
      type: 'REPLACE';
      state: PageEditorState;
    }
  | {
      type: 'PAGE_NEW_NODE_DRAG_START';
      newNode: appDom.ElementNode;
    }
  | {
      type: 'PAGE_EXISTING_NODE_DRAG_START';
      node: appDom.ElementNode;
    }
  | {
      type: 'PAGE_EDGE_DRAG_START';
      edgeDragState: {
        nodeId: NodeId | null;
        edge: RectangleEdge;
      };
    }
  | {
      type: 'PAGE_NODE_DRAG_OVER';
      dragOverState: {
        nodeId: NodeId | null;
        parentProp: appDom.ParentProp<appDom.ElementNode | appDom.PageNode> | null;
        zone: DropZone | null;
      };
    }
  | {
      type: 'PAGE_DRAG_END';
    }
  | {
      type: 'PAGE_STATE_UPDATE';
      pageState: Record<string, unknown>;
      globalScopeMeta: ScopeMeta;
    }
  | {
      type: 'NODE_DATA_UPDATE';
      nodeId: NodeId;
      prop: string;
      value: unknown;
    }
  | {
      type: 'PAGE_VIEW_STATE_UPDATE';
      viewState: PageViewState;
    }
  | {
      type: 'PAGE_BINDINGS_UPDATE';
      bindings: LiveBindings;
    }
  | {
      type: 'VM_UPDATE';
      vm: ApplicationVm;
    };

export function createPageEditorState(nodeId: NodeId): PageEditorState {
  return {
    type: 'page',
    nodeId,
    newNode: null,
    draggedNodeId: null,
    isDraggingOver: false,
    dragOverNodeId: null,
    dragOverSlotParentProp: null,
    dragOverZone: null,
    draggedEdge: null,
    viewState: { nodes: {} },
    pageState: {},
    globalScopeMeta: {},
    bindings: {},
    nodeData: {},
    vm: {
      scopes: {},
      bindingScopes: {},
    },
  };
}

export function pageEditorReducer(
  state: PageEditorState,
  action: PageEditorAction,
): PageEditorState {
  switch (action.type) {
    case 'REPLACE': {
      return action.state;
    }
    case 'PAGE_NEW_NODE_DRAG_START': {
      if (state.newNode) {
        return state;
      }
      return update(state, {
        newNode: action.newNode,
      });
    }
    case 'PAGE_EXISTING_NODE_DRAG_START': {
      return update(state, {
        draggedNodeId: action.node.id,
      });
    }
    case 'PAGE_EDGE_DRAG_START': {
      const { nodeId, edge } = action.edgeDragState;

      return update(state, {
        draggedNodeId: nodeId,
        draggedEdge: edge,
      });
    }
    case 'PAGE_DRAG_END':
      return update(state, {
        newNode: null,
        draggedNodeId: null,
        isDraggingOver: false,
        dragOverNodeId: null,
        dragOverSlotParentProp: null,
        dragOverZone: null,
        draggedEdge: null,
      });
    case 'PAGE_NODE_DRAG_OVER': {
      const { nodeId, parentProp, zone } = action.dragOverState;

      return update(state, {
        isDraggingOver: true,
        dragOverNodeId: nodeId,
        dragOverSlotParentProp: parentProp,
        dragOverZone: zone,
      });
    }
    case 'PAGE_VIEW_STATE_UPDATE': {
      const { viewState } = action;
      return update(state, {
        viewState,
      });
    }
    case 'PAGE_STATE_UPDATE': {
      const { pageState, globalScopeMeta } = action;
      return update(state, {
        pageState,
        globalScopeMeta,
      });
    }
    case 'NODE_DATA_UPDATE': {
      const { nodeId, prop, value } = action;
      return update(state, {
        nodeData: update(state.nodeData, {
          [nodeId]: updateOrCreate(state.nodeData[nodeId], {
            [prop]: value,
          }),
        }),
      });
    }
    case 'PAGE_BINDINGS_UPDATE': {
      const { bindings } = action;
      return update(state, {
        bindings,
      });
    }
    case 'VM_UPDATE': {
      const { vm } = action;
      return update(state, { vm });
    }
    default:
      return state;
  }
}

function createPageEditorApi(dispatch: React.Dispatch<PageEditorAction>) {
  return {
    replace: (state: PageEditorState) => dispatch({ type: 'REPLACE', state }),
    newNodeDragStart(newNode: appDom.ElementNode) {
      dispatch({ type: 'PAGE_NEW_NODE_DRAG_START', newNode });
    },
    existingNodeDragStart(node: appDom.ElementNode) {
      dispatch({ type: 'PAGE_EXISTING_NODE_DRAG_START', node });
    },
    edgeDragStart({ nodeId, edge }: { nodeId: NodeId | null; edge: RectangleEdge }) {
      dispatch({
        type: 'PAGE_EDGE_DRAG_START',
        edgeDragState: { nodeId, edge },
      });
    },
    dragEnd() {
      dispatch({ type: 'PAGE_DRAG_END' });
    },
    nodeDragOver({
      nodeId,
      parentProp,
      zone,
    }: {
      nodeId: NodeId | null;
      parentProp: appDom.ParentProp<appDom.ElementNode | appDom.PageNode> | null;
      zone: DropZone | null;
    }) {
      dispatch({
        type: 'PAGE_NODE_DRAG_OVER',
        dragOverState: { nodeId, parentProp, zone },
      });
    },
    pageViewStateUpdate(viewState: PageViewState) {
      dispatch({
        type: 'PAGE_VIEW_STATE_UPDATE',
        viewState,
      });
    },
    pageStateUpdate(pageState: Record<string, unknown>, globalScopeMeta: ScopeMeta) {
      dispatch({
        type: 'PAGE_STATE_UPDATE',
        pageState,
        globalScopeMeta,
      });
    },
    nodeDataUpdate(nodeId: NodeId, prop: string, value: unknown) {
      dispatch({
        type: 'NODE_DATA_UPDATE',
        nodeId,
        prop,
        value,
      });
    },
    pageBindingsUpdate(bindings: LiveBindings) {
      dispatch({
        type: 'PAGE_BINDINGS_UPDATE',
        bindings,
      });
    },
    vmUpdate(vm: ApplicationVm) {
      dispatch({
        type: 'VM_UPDATE',
        vm,
      });
    },
  };
}

const PageEditorContext = React.createContext<PageEditorState | null>(null);

export function usePageEditorState() {
  const state = React.useContext(PageEditorContext);

  if (!state) {
    throw new Error(`Missing PageEditorContext`);
  }

  return state;
}

export interface PageEditorProviderProps {
  children?: React.ReactNode;
  nodeId: NodeId;
}

export type PageEditorApi = ReturnType<typeof createPageEditorApi>;

const PageEditorApiContext = React.createContext<PageEditorApi>(
  createPageEditorApi(() => undefined),
);

export function PageEditorProvider({ children, nodeId }: PageEditorProviderProps) {
  const initialState = createPageEditorState(nodeId);
  const [state, dispatch] = React.useReducer(pageEditorReducer, initialState);
  const api = React.useMemo(() => createPageEditorApi(dispatch), []);

  React.useEffect(() => {
    api.replace(createPageEditorState(nodeId));
  }, [api, nodeId]);

  return (
    <PageEditorContext.Provider value={state}>
      <PageEditorApiContext.Provider value={api}>{children}</PageEditorApiContext.Provider>
    </PageEditorContext.Provider>
  );
}

export function usePageEditorApi() {
  return React.useContext(PageEditorApiContext);
}
