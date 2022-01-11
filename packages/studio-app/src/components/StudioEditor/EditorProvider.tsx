import * as React from 'react';
import {
  ApiEditorState,
  ComponentPanelTab,
  EditorAction,
  editorReducer,
  EditorState,
  PageEditorState,
  ThemeEditorState,
} from '../../editorState';
import { StudioNodeBase } from '../../studioDom';
import { NodeId, SlotLocation, StudioNodeProps, ViewState } from '../../types';

const EditorStateContext = React.createContext<EditorState | null>(null);

function createApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    select(nodeId: NodeId | null) {
      dispatch({ type: 'SELECT_NODE', nodeId });
    },
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({ type: 'SET_NODE_NAME', nodeId, name });
    },
    setNodeConstPropValue<P, K extends keyof P & string>(
      node: StudioNodeBase<P>,
      prop: K,
      value: P[K],
    ) {
      dispatch({ type: 'SET_NODE_PROP', nodeId: node.id, prop, value: { type: 'const', value } });
    },
    setNodeProps(nodeId: NodeId, props: StudioNodeProps) {
      dispatch({ type: 'SET_NODE_PROPS', nodeId, props });
    },
    setComponentPanelTab(tab: ComponentPanelTab) {
      dispatch({ type: 'SET_COMPONENT_PANEL_TAB', tab });
    },
    addComponentDragStart(component: string) {
      dispatch({ type: 'ADD_COMPONENT_DRAG_START', component });
    },
    nodeDragStart(nodeId: NodeId) {
      dispatch({ type: 'NODE_DRAG_START', nodeId });
    },
    selectionRemove() {
      dispatch({ type: 'SELECTION_REMOVE' });
    },
    addComponentDragEnd() {
      dispatch({ type: 'ADD_COMPONENT_DRAG_END' });
    },
    addComponentDragOver(slot: SlotLocation | null) {
      dispatch({
        type: 'ADD_COMPONENT_DRAG_OVER',
        slot,
      });
    },
    addComponentDrop(location: SlotLocation | null) {
      dispatch({ type: 'ADD_COMPONENT_DROP', location });
    },
    openBindingEditor(nodeId: NodeId, prop: string) {
      dispatch({ type: 'OPEN_BINDING_EDITOR', nodeId, prop });
    },
    closeBindingEditor() {
      dispatch({ type: 'CLOSE_BINDING_EDITOR' });
    },
    addBinding(
      srcNodeId: NodeId,
      srcProp: string,
      destNodeId: NodeId,
      destProp: string,
      initialValue: any,
    ) {
      dispatch({
        type: 'ADD_BINDING',
        srcNodeId,
        srcProp,
        destNodeId,
        destProp,
        initialValue,
      });
    },
    removeBinding(nodeId: NodeId, prop: string) {
      dispatch({
        type: 'REMOVE_BINDING',
        nodeId,
        prop,
      });
    },
    pageViewStateUpdate(viewState: ViewState) {
      dispatch({
        type: 'PAGE_VIEW_STATE_UPDATE',
        viewState,
      });
    },
    addTheme() {
      dispatch({
        type: 'ADD_THEME',
      });
    },
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

export function usePageEditorState(): PageEditorState {
  const state = useEditorState();
  if (state.editorType !== 'page') {
    throw new Error(`PageEditorState state requested out of context`);
  }
  return state;
}

export function useThemeEditorState(): ThemeEditorState {
  const state = useEditorState();
  if (state.editorType !== 'theme') {
    throw new Error(`ThemeEditorState state requested out of context`);
  }
  return state;
}

export function useApiEditorState(): ApiEditorState {
  const state = useEditorState();
  if (state.editorType !== 'api') {
    throw new Error(`ApiEditorState state requested out of context`);
  }
  return state;
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
