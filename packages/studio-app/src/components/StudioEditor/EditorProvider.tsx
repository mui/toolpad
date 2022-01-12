import * as React from 'react';
import {
  ApiEditorState,
  ComponentPanelTab,
  EditorAction,
  editorReducer,
  EditorState,
  PageEditorState,
} from '../../editorState';
import * as studioDom from '../../studioDom';
import { NodeId, SlotLocation, StudioNodeProps, ViewState } from '../../types';

const EditorStateContext = React.createContext<EditorState | null>(null);

function createApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({ type: 'SET_NODE_NAME', nodeId, name });
    },
    addNode(node: studioDom.StudioNode, parentId: NodeId, parentProp: string, parentIndex: string) {
      dispatch({
        type: 'ADD_NODE',
        node,
        parentId,
        parentProp,
        parentIndex,
      });
    },
    moveNode(nodeId: NodeId, parentId: NodeId, parentProp: string, parentIndex: string) {
      dispatch({
        type: 'MOVE_NODE',
        nodeId,
        parentId,
        parentProp,
        parentIndex,
      });
    },
    removeNode(nodeId: NodeId) {
      dispatch({
        type: 'REMOVE_NODE',
        nodeId,
      });
    },
    setNodeConstPropValue<P, K extends keyof P & string>(
      node: studioDom.StudioNode,
      prop: K,
      value: P[K],
    ) {
      dispatch({ type: 'SET_NODE_PROP', nodeId: node.id, prop, value: { type: 'const', value } });
    },
    setNodeProps<P>(nodeId: NodeId, props: StudioNodeProps<P>) {
      dispatch({ type: 'SET_NODE_PROPS', nodeId, props });
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
    addTheme() {
      dispatch({
        type: 'ADD_THEME',
      });
    },

    select(nodeId: NodeId | null) {
      dispatch({ type: 'SELECT_NODE', nodeId });
    },
    deselect() {
      dispatch({ type: 'DESELECT_NODE' });
    },
    setComponentPanelTab(tab: ComponentPanelTab) {
      dispatch({ type: 'SET_COMPONENT_PANEL_TAB', tab });
    },
    nodeDragStart(nodeId: NodeId) {
      dispatch({ type: 'NODE_DRAG_START', nodeId });
    },
    newNodeDragStart(newNode: studioDom.StudioNode) {
      dispatch({ type: 'NEW_NODE_DRAG_START', newNode });
    },
    nodeDragEnd() {
      dispatch({ type: 'NODE_DRAG_END' });
    },
    nodeDragOver(slot: SlotLocation | null) {
      dispatch({
        type: 'NODE_DRAG_OVER',
        slot,
      });
    },
    openBindingEditor(nodeId: NodeId, prop: string) {
      dispatch({ type: 'OPEN_BINDING_EDITOR', nodeId, prop });
    },
    closeBindingEditor() {
      dispatch({ type: 'CLOSE_BINDING_EDITOR' });
    },
    pageViewStateUpdate(viewState: ViewState) {
      dispatch({
        type: 'PAGE_VIEW_STATE_UPDATE',
        viewState,
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
