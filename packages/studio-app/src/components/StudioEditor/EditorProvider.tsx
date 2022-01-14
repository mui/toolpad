import * as React from 'react';
import * as studioDom from '../../studioDom';
import { NodeId, SlotLocation, ViewState } from '../../types';
import { update, updateOrCreate } from '../../utils/immutability';

export type ComponentPanelTab = 'catalog' | 'component' | 'theme';

export interface BindingEditorState {
  readonly nodeId: NodeId;
  readonly prop: string;
}

type EditorType = 'page' | 'api';

export interface BaseEditorState {
  readonly type: EditorType;
  readonly nodeId: NodeId;
}

export interface PageEditorState extends BaseEditorState {
  readonly type: 'page';
  readonly nodeId: NodeId;
  readonly selection: NodeId | null;
  readonly componentPanelTab: ComponentPanelTab;
  readonly newNode: studioDom.StudioNode | null;
  readonly bindingEditor: BindingEditorState | null;
  readonly highlightLayout: boolean;
  readonly highlightedSlot: SlotLocation | null;
  readonly viewState: ViewState;
}

type PageEditorStateInit = BaseEditorState & Partial<PageEditorState>;

export interface ApiEditorState extends BaseEditorState {
  readonly type: 'api';
  readonly nodeId: NodeId;
}

type ApiEditorStateInit = BaseEditorState & Partial<ApiEditorState>;

type FileEditorState = PageEditorState | ApiEditorState;

export interface EditorState {
  readonly editor: FileEditorState | null;
}

export type BaseAction = {
  type: 'OPEN_EDITOR';
  editor: PageEditorStateInit | ApiEditorStateInit;
};

export type PageEditorAction =
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
      newNode: studioDom.StudioNode;
    }
  | {
      type: 'PAGE_NODE_DRAG_OVER';
      slot: SlotLocation | null;
    }
  | {
      type: 'PAGE_NODE_DRAG_END';
    }
  | {
      type: 'PAGE_OPEN_BINDING_EDITOR';
      nodeId: NodeId;
      prop: string;
    }
  | {
      type: 'PAGE_CLOSE_BINDING_EDITOR';
    }
  | {
      type: 'PAGE_VIEW_STATE_UPDATE';
      viewState: ViewState;
    };

export type EditorAction = BaseAction | PageEditorAction;

export function createPageEditorState(init: PageEditorStateInit): PageEditorState {
  return {
    selection: null,
    componentPanelTab: 'catalog',
    newNode: null,
    bindingEditor: null,
    highlightLayout: false,
    highlightedSlot: null,
    viewState: {},
    ...init,
  };
}

export function createApiEditorState(init: ApiEditorStateInit): ApiEditorState {
  return {
    ...init,
  };
}

export function createEditorState(): EditorState {
  return {
    editor: null,
  };
}

export function pageEditorReducer(state: PageEditorState, action: EditorAction): PageEditorState {
  switch (action.type) {
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
        highlightedSlot: null,
      });
    case 'PAGE_NODE_DRAG_OVER': {
      return update(state, {
        highlightLayout: true,
        highlightedSlot: action.slot ? updateOrCreate(state.highlightedSlot, action.slot) : null,
      });
    }
    case 'PAGE_OPEN_BINDING_EDITOR': {
      return update(state, {
        bindingEditor: action,
      });
    }
    case 'PAGE_CLOSE_BINDING_EDITOR': {
      return update(state, {
        bindingEditor: null,
      });
    }
    case 'PAGE_VIEW_STATE_UPDATE': {
      const { viewState } = action;
      return update(state, {
        viewState,
      });
    }
    default:
      return state;
  }
}

export function baseEditorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'OPEN_EDITOR': {
      switch (action.editor.type) {
        case 'page':
          return update(state, {
            editor: createPageEditorState(action.editor),
          });
        case 'api':
          return update(state, {
            editor: createApiEditorState(action.editor),
          });
        default:
          throw new Error(
            `Invariant: unknown editor type "${(action.editor as BaseEditorState).type}"`,
          );
      }
    }
    default:
      return state;
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  state = baseEditorReducer(state, action);

  if (state.editor?.type === 'page') {
    state = update(state, {
      editor: pageEditorReducer(state.editor, action),
    });
  }

  return state;
}

function createPageEditorApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    select: (nodeId: NodeId | null) => dispatch({ type: 'SELECT_NODE', nodeId }),
    deselect: () => dispatch({ type: 'DESELECT_NODE' }),
    setComponentPanelTab(tab: ComponentPanelTab) {
      dispatch({ type: 'PAGE_SET_COMPONENT_PANEL_TAB', tab });
    },
    newNodeDragStart(newNode: studioDom.StudioNode) {
      dispatch({ type: 'PAGE_NEW_NODE_DRAG_START', newNode });
    },
    nodeDragEnd() {
      dispatch({ type: 'PAGE_NODE_DRAG_END' });
    },
    nodeDragOver(slot: SlotLocation | null) {
      dispatch({
        type: 'PAGE_NODE_DRAG_OVER',
        slot,
      });
    },
    openBindingEditor(nodeId: NodeId, prop: string) {
      dispatch({ type: 'PAGE_OPEN_BINDING_EDITOR', nodeId, prop });
    },
    closeBindingEditor() {
      dispatch({ type: 'PAGE_CLOSE_BINDING_EDITOR' });
    },
    pageViewStateUpdate(viewState: ViewState) {
      dispatch({
        type: 'PAGE_VIEW_STATE_UPDATE',
        viewState,
      });
    },
  };
}

const EditorStateContext = React.createContext<EditorState | null>(null);

function createApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    pageEditor: createPageEditorApi(dispatch),
    openPageEditor: (nodeId: NodeId, selection: NodeId | null) =>
      dispatch({
        type: 'OPEN_EDITOR',
        editor: {
          type: 'page',
          nodeId,
          ...(selection ? { selection, componentPanelTab: 'component' } : {}),
        },
      }),
    openApiEditor: (nodeId: NodeId) =>
      dispatch({ type: 'OPEN_EDITOR', editor: { type: 'api', nodeId } }),
    select: (nodeId: NodeId | null) => dispatch({ type: 'SELECT_NODE', nodeId }),
    deselect: () => dispatch({ type: 'DESELECT_NODE' }),
  };
}

const EditorApiContext = React.createContext<EditorApi>(createApi(() => undefined));

export type EditorApi = ReturnType<typeof createApi>;

export interface EditorContextProps {
  initialState: EditorState;
  children?: React.ReactNode;
}

export function useEditorState(): EditorState {
  const stateContext = React.useContext(EditorStateContext);
  if (!stateContext) {
    throw new Error(`No provider found for editor state`);
  }
  return stateContext;
}

export function useEditorApi(): EditorApi {
  return React.useContext(EditorApiContext);
}

export default function EditorProvider({ initialState, children }: EditorContextProps) {
  const [state, dispatch] = React.useReducer(editorReducer, initialState);
  const api = React.useMemo(() => createApi(dispatch), []);

  return (
    <EditorStateContext.Provider value={state}>
      <EditorApiContext.Provider value={api}>{children}</EditorApiContext.Provider>
    </EditorStateContext.Provider>
  );
}
