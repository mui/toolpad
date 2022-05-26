import { LiveBindings } from '@mui/toolpad-core';
import * as React from 'react';
import * as appDom from '../../../appDom';
import { NodeId, PageViewState } from '../../../types';
import { update } from '../../../utils/immutability';

export type ComponentPanelTab = 'component' | 'theme';

export interface PageEditorState {
  readonly appId: string;
  readonly type: 'page';
  readonly nodeId: NodeId;
  readonly selection: NodeId | null;
  readonly componentPanelTab: ComponentPanelTab;
  readonly newNode: appDom.ElementNode | null;
  readonly highlightLayout: boolean;
  readonly highlightedNodeId: NodeId | null;
  readonly viewState: PageViewState;
  readonly pageState: Record<string, unknown>;
  readonly bindings: LiveBindings;
}

export type PageEditorAction =
  | {
      type: 'REPLACE';
      state: PageEditorState;
    }
  | {
      type: 'SELECT_NODE';
      nodeId: NodeId | null;
    }
  | {
      type: 'DESELECT_NODE';
    }
  | {
      type: 'PAGE_SET_COMPONENT_PANEL_TAB';
      tab: ComponentPanelTab;
    }
  | {
      type: 'PAGE_NEW_NODE_DRAG_START';
      newNode: appDom.ElementNode;
    }
  | {
      type: 'PAGE_NODE_DRAG_OVER';
      nodeId: NodeId | null;
    }
  | {
      type: 'PAGE_NODE_DRAG_END';
    }
  | {
      type: 'PAGE_STATE_UPDATE';
      pageState: Record<string, unknown>;
    }
  | {
      type: 'PAGE_VIEW_STATE_UPDATE';
      viewState: PageViewState;
    }
  | {
      type: 'PAGE_BINDINGS_UPDATE';
      bindings: LiveBindings;
    };

export function createPageEditorState(appId: string, nodeId: NodeId): PageEditorState {
  return {
    appId,
    type: 'page',
    nodeId,
    selection: null,
    componentPanelTab: 'component',
    newNode: null,
    highlightLayout: false,
    highlightedNodeId: null,
    viewState: { nodes: {} },
    pageState: {},
    bindings: {},
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
    case 'SELECT_NODE': {
      return update(state, {
        selection: action.nodeId,
        componentPanelTab: 'component',
      });
    }
    case 'DESELECT_NODE': {
      return update(state, {
        selection: null,
      });
    }
    case 'PAGE_SET_COMPONENT_PANEL_TAB':
      return update(state, {
        componentPanelTab: action.tab,
      });
    case 'PAGE_NEW_NODE_DRAG_START': {
      if (state.newNode) {
        return state;
      }
      return update(state, {
        newNode: action.newNode,
      });
    }
    case 'PAGE_NODE_DRAG_END':
      return update(state, {
        newNode: null,
        highlightLayout: false,
        highlightedNodeId: null,
      });
    case 'PAGE_NODE_DRAG_OVER': {
      return update(state, {
        highlightLayout: true,
        highlightedNodeId: action.nodeId,
      });
    }
    case 'PAGE_VIEW_STATE_UPDATE': {
      const { viewState } = action;
      return update(state, {
        viewState,
      });
    }
    case 'PAGE_STATE_UPDATE': {
      const { pageState } = action;
      return update(state, {
        pageState,
      });
    }
    case 'PAGE_BINDINGS_UPDATE': {
      const { bindings } = action;
      return update(state, {
        bindings,
      });
    }
    default:
      return state;
  }
}

function createPageEditorApi(dispatch: React.Dispatch<PageEditorAction>) {
  return {
    replace: (state: PageEditorState) => dispatch({ type: 'REPLACE', state }),
    select: (nodeId: NodeId | null) => dispatch({ type: 'SELECT_NODE', nodeId }),
    deselect: () => dispatch({ type: 'DESELECT_NODE' }),
    setComponentPanelTab(tab: ComponentPanelTab) {
      dispatch({ type: 'PAGE_SET_COMPONENT_PANEL_TAB', tab });
    },
    newNodeDragStart(newNode: appDom.ElementNode) {
      dispatch({ type: 'PAGE_NEW_NODE_DRAG_START', newNode });
    },
    nodeDragEnd() {
      dispatch({ type: 'PAGE_NODE_DRAG_END' });
    },
    nodeDragOver(nodeId: NodeId | null) {
      dispatch({
        type: 'PAGE_NODE_DRAG_OVER',
        nodeId,
      });
    },
    pageViewStateUpdate(viewState: PageViewState) {
      dispatch({
        type: 'PAGE_VIEW_STATE_UPDATE',
        viewState,
      });
    },
    pageStateUpdate(pageState: Record<string, unknown>) {
      dispatch({
        type: 'PAGE_STATE_UPDATE',
        pageState,
      });
    },
    pageBindingsUpdate(bindings: LiveBindings) {
      dispatch({
        type: 'PAGE_BINDINGS_UPDATE',
        bindings,
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
  appId: string;
  children?: React.ReactNode;
  nodeId: NodeId;
}

export type PageEditorApi = ReturnType<typeof createPageEditorApi>;

const PageEditorApiContext = React.createContext<PageEditorApi>(
  createPageEditorApi(() => undefined),
);

export function PageEditorProvider({ appId, children, nodeId }: PageEditorProviderProps) {
  const initialState = createPageEditorState(appId, nodeId);
  const [state, dispatch] = React.useReducer(pageEditorReducer, initialState);
  const api = React.useMemo(() => createPageEditorApi(dispatch), []);

  React.useEffect(() => {
    api.replace(createPageEditorState(appId, nodeId));
  }, [appId, api, nodeId]);

  return (
    <PageEditorContext.Provider value={state}>
      <PageEditorApiContext.Provider value={api}>{children}</PageEditorApiContext.Provider>
    </PageEditorContext.Provider>
  );
}

export function usePageEditorApi() {
  return React.useContext(PageEditorApiContext);
}
