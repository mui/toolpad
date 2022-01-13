import { omit, update, updateOrCreate } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import { NodeId, SlotLocation, StudioNodeProp, StudioNodeProps, ViewState } from './types';
import * as studioDom from './studioDom';

export type ComponentPanelTab = 'catalog' | 'component' | 'theme';

export interface BindingEditorState {
  readonly nodeId: NodeId;
  readonly prop: string;
}

export interface PageEditorState {
  readonly nodeId: NodeId;
  readonly componentPanelTab: ComponentPanelTab;
  readonly newNode: studioDom.StudioNode | null;
  readonly bindingEditor: BindingEditorState | null;
  readonly highlightLayout: boolean;
  readonly highlightedSlot: SlotLocation | null;
  readonly viewState: ViewState;
}

export interface ApiEditorState {
  readonly nodeId: NodeId;
}

export interface BaseEditorState {
  readonly editorType: 'page' | 'api';
  readonly dom: studioDom.StudioDom;
  readonly selection: NodeId | null;
}

export interface BaseEditorWithPageState extends BaseEditorState {
  readonly editorType: 'page';
  readonly pageEditor: PageEditorState;
}

export interface BaseEditorWithApiState extends BaseEditorState {
  readonly editorType: 'api';
  readonly apiEditor: ApiEditorState;
}

export type EditorState = BaseEditorWithPageState | BaseEditorWithApiState;

export type BaseAction =
  | {
      type: 'SELECT_NODE';
      nodeId: NodeId | null;
    }
  | {
      type: 'DESELECT_NODE';
    };

export type DomAction =
  | {
      type: 'DOM_SET_NODE_NAME';
      nodeId: NodeId;
      name: string;
    }
  | {
      type: 'DOM_SET_NODE_PROP';
      nodeId: NodeId;
      prop: string;
      value: StudioNodeProp<unknown>;
    }
  | {
      type: 'DOM_ADD_BINDING';
      srcNodeId: NodeId;
      srcProp: string;
      destNodeId: NodeId;
      destProp: string;
      initialValue: string;
    }
  | {
      type: 'DOM_REMOVE_BINDING';
      nodeId: NodeId;
      prop: string;
    }
  | {
      type: 'DOM_ADD_NODE';
      node: studioDom.StudioNode;
      parentId: NodeId;
      parentProp: string;
      parentIndex?: string;
    }
  | {
      type: 'DOM_MOVE_NODE';
      nodeId: NodeId;
      parentId: NodeId;
      parentProp: string;
      parentIndex: string;
    }
  | {
      type: 'DOM_REMOVE_NODE';
      nodeId: NodeId;
    };

export type PageEditorAction =
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

export type EditorAction = BaseAction | DomAction | PageEditorAction;

export function createDomApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({ type: 'DOM_SET_NODE_NAME', nodeId, name });
    },
    addNode(
      node: studioDom.StudioNode,
      parentId: NodeId,
      parentProp: string,
      parentIndex?: string,
    ) {
      dispatch({
        type: 'DOM_ADD_NODE',
        node,
        parentId,
        parentProp,
        parentIndex,
      });
    },
    moveNode(nodeId: NodeId, parentId: NodeId, parentProp: string, parentIndex: string) {
      dispatch({
        type: 'DOM_MOVE_NODE',
        nodeId,
        parentId,
        parentProp,
        parentIndex,
      });
    },
    removeNode(nodeId: NodeId) {
      dispatch({
        type: 'DOM_REMOVE_NODE',
        nodeId,
      });
    },
    setNodeConstPropValue<P, K extends keyof P & string = keyof P & string>(
      node: studioDom.StudioNode,
      prop: K,
      value: P[K],
    ) {
      dispatch({
        type: 'DOM_SET_NODE_PROP',
        nodeId: node.id,
        prop,
        value: { type: 'const', value },
      });
    },
    addBinding(
      srcNodeId: NodeId,
      srcProp: string,
      destNodeId: NodeId,
      destProp: string,
      initialValue: any,
    ) {
      dispatch({
        type: 'DOM_ADD_BINDING',
        srcNodeId,
        srcProp,
        destNodeId,
        destProp,
        initialValue,
      });
    },
    removeBinding(nodeId: NodeId, prop: string) {
      dispatch({
        type: 'DOM_REMOVE_BINDING',
        nodeId,
        prop,
      });
    },
  };
}

export function createEditorApi(dispatch: React.Dispatch<EditorAction>) {
  return {
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

export function createApi(dispatch: React.Dispatch<EditorAction>) {
  return {
    dom: createDomApi(dispatch),
    pageEditor: createEditorApi(dispatch),
    select: (nodeId: NodeId | null) => dispatch({ type: 'SELECT_NODE', nodeId }),
    deselect: () => dispatch({ type: 'DESELECT_NODE' }),
  };
}

export function createPageEditorState(nodeId: NodeId): PageEditorState {
  return {
    nodeId,
    componentPanelTab: 'catalog',
    newNode: null,
    bindingEditor: null,
    highlightLayout: false,
    highlightedSlot: null,
    viewState: {},
  };
}

export function createEditorState(dom: studioDom.StudioDom): EditorState {
  const pageNode = studioDom.getPages(dom, studioDom.getApp(dom))[0];
  return {
    dom,
    selection: null,
    editorType: 'page',
    pageEditor: createPageEditorState(pageNode.id),
  };
}

export function domReducer(dom: studioDom.StudioDom, action: EditorAction): studioDom.StudioDom {
  switch (action.type) {
    case 'DOM_SET_NODE_NAME': {
      const node = studioDom.getNode(dom, action.nodeId);
      return studioDom.setNodeName(dom, node, action.name);
    }
    case 'DOM_SET_NODE_PROP': {
      const node = studioDom.getNode(dom, action.nodeId);
      return studioDom.setNodeProp<any, any>(dom, node, action.prop, action.value);
    }
    case 'DOM_ADD_NODE': {
      return studioDom.addNode(
        dom,
        action.node,
        action.parentId,
        action.parentProp,
        action.parentIndex,
      );
    }
    case 'DOM_MOVE_NODE': {
      return studioDom.moveNode(
        dom,
        action.nodeId,
        action.parentId,
        action.parentProp,
        action.parentIndex,
      );
    }
    case 'DOM_REMOVE_NODE': {
      // TODO: also clean up orphaned state and bindings
      return studioDom.removeNode(dom, action.nodeId);
    }
    case 'DOM_ADD_BINDING': {
      const { srcNodeId, srcProp, destNodeId, destProp, initialValue } = action;
      const srcNode = studioDom.getNode(dom, srcNodeId);
      studioDom.assertIsElement<Record<string, unknown>>(srcNode);
      const destNode = studioDom.getNode(dom, destNodeId);
      studioDom.assertIsElement(destNode);
      const destPropValue = (destNode.props as StudioNodeProps<Record<string, unknown>>)[destProp];
      let stateKey = destPropValue?.type === 'binding' ? destPropValue.state : null;

      const page = studioDom.getElementPage(dom, srcNode);
      if (!page) {
        return dom;
      }

      let pageState = page.state;
      if (!stateKey) {
        stateKey = generateUniqueId(new Set(Object.keys(page.state)));
        pageState = update(pageState, {
          [stateKey]: { name: '', initialValue },
        });
      }

      return update(dom, {
        nodes: update(dom.nodes, {
          [page.id]: update(page, {
            state: pageState,
          }),
          [srcNodeId]: update(srcNode, {
            props: update(srcNode.props, {
              [srcProp]: { type: 'binding', state: stateKey },
            }),
          }),
          [destNodeId]: update(destNode, {
            props: update(destNode.props, {
              [destProp]: { type: 'binding', state: stateKey },
            }),
          }),
        }),
      });
    }
    case 'DOM_REMOVE_BINDING': {
      const { nodeId, prop } = action;

      const node = studioDom.getNode(dom, nodeId);
      studioDom.assertIsElement(node);

      // TODO: also clean up orphaned state and bindings
      return update(dom, {
        nodes: update(dom.nodes, {
          [nodeId]: update(node, {
            props: omit(node.props, prop),
          }),
        }),
      });
    }
    default:
      return dom;
  }
}

export function pageEditorReducer(
  state: PageEditorState,
  action: EditorAction,
  globalState: EditorState,
): PageEditorState {
  switch (action.type) {
    case 'SELECT_NODE': {
      if (action.nodeId) {
        const node = studioDom.getNode(globalState.dom, action.nodeId);
        if (studioDom.isElement(node)) {
          return update(state, {
            componentPanelTab: 'component',
          });
        }
      }
      return state;
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

export function baseReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_NODE': {
      if (action.nodeId) {
        let node = studioDom.getNode(state.dom, action.nodeId);
        if (studioDom.isElement(node)) {
          const page = studioDom.getElementPage(state.dom, node);
          if (page) {
            if (state.editorType === 'page' && page.id === state.pageEditor.nodeId) {
              return update(state, {
                selection: action.nodeId,
              });
            }
            node = page;
          }
        }
        if (studioDom.isPage(node)) {
          if (state.editorType === 'page' && node.id === state.pageEditor.nodeId) {
            return state;
          }
          return update(state, {
            selection: null,
            pageEditor: createPageEditorState(node.id),
          });
        }
      }
      return update(state, {
        selection: action.nodeId,
      });
    }
    case 'DESELECT_NODE': {
      return update(state, {
        selection: null,
      });
    }
    default:
      return state;
  }
}

export function storeReducer(state: EditorState, action: EditorAction): EditorState {
  state = baseReducer(state, action);

  state = update(state, {
    dom: domReducer(state.dom, action),
  });

  if (state.editorType === 'page') {
    state = update(state, {
      pageEditor: pageEditorReducer(state.pageEditor, action, state),
    });
  }

  return state;
}
