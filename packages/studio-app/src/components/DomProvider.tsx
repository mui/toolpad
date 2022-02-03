import * as React from 'react';
import * as studioDom from '../studioDom';
import { NodeId, StudioBindable } from '../types';
import { update } from '../utils/immutability';
import client from '../api';

export type DomAction =
  | {
      type: 'DOM_LOADING';
    }
  | {
      type: 'DOM_LOADED';
      dom: studioDom.StudioDom;
    }
  | {
      type: 'DOM_LOADING_ERROR';
      error: string;
    }
  | {
      type: 'DOM_SET_NODE_NAME';
      nodeId: NodeId;
      name: string;
    }
  | {
      type: 'DOM_SET_NODE_PROP';
      node: studioDom.StudioNode;
      prop: string;
      namespace: string;
      value: StudioBindable<unknown> | null;
    }
  | {
      type: 'SAVE_NODE';
      node: studioDom.StudioNode;
    }
  | {
      type: 'DOM_SET_NODE_ATTR';
      nodeId: NodeId;
      attr: string;
      value: unknown;
    }
  | {
      type: 'DOM_ADD_NODE';
      node: studioDom.StudioNode;
      parent: studioDom.StudioNode;
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

export function domReducer(state: DomState, action: DomAction): DomState {
  switch (action.type) {
    case 'DOM_LOADING': {
      return update(state, {
        loading: true,
        error: null,
      });
    }
    case 'DOM_LOADED': {
      return update(state, {
        loading: false,
        loaded: true,
        error: null,
        dom: action.dom,
      });
    }
    case 'DOM_LOADING_ERROR': {
      return update(state, {
        loading: false,
        error: action.error,
      });
    }
    case 'DOM_SET_NODE_NAME': {
      // TODO: Also update all bindings on the page that use this name
      const node = studioDom.getNode(state.dom, action.nodeId);
      return update(state, {
        dom: studioDom.setNodeName(state.dom, node, action.name),
      });
    }
    case 'DOM_SET_NODE_PROP': {
      return update(state, {
        dom: studioDom.setNodeNamespacedProp<any, any, any>(
          state.dom,
          action.node,
          'props',
          action.prop,
          action.value,
        ),
      });
    }
    case 'SAVE_NODE': {
      return update(state, {
        dom: studioDom.saveNode(state.dom, action.node),
      });
    }
    case 'DOM_SET_NODE_ATTR': {
      const node = studioDom.getNode(state.dom, action.nodeId);
      return update(state, {
        dom: studioDom.setNodeAttribute<any, any>(state.dom, node, action.attr, action.value),
      });
    }
    case 'DOM_ADD_NODE': {
      return update(state, {
        dom: studioDom.addNode<any, any>(
          state.dom,
          action.node,
          action.parent,
          action.parentProp,
          action.parentIndex,
        ),
      });
    }
    case 'DOM_MOVE_NODE': {
      return update(state, {
        dom: studioDom.moveNode(
          state.dom,
          action.nodeId,
          action.parentId,
          action.parentProp,
          action.parentIndex,
        ),
      });
    }
    case 'DOM_REMOVE_NODE': {
      return update(state, {
        dom: studioDom.removeNode(state.dom, action.nodeId),
      });
    }
    default:
      return state;
  }
}

function createDomApi(dispatch: React.Dispatch<DomAction>) {
  return {
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({ type: 'DOM_SET_NODE_NAME', nodeId, name });
    },
    addNode<Parent extends studioDom.StudioNode, Child extends studioDom.StudioNode>(
      node: Child,
      parent: Parent,
      parentProp: studioDom.ParentPropOf<Child, Parent>,
      parentIndex?: string,
    ) {
      dispatch({
        type: 'DOM_ADD_NODE',
        node,
        parent,
        parentProp,
        parentIndex,
      });
    },
    saveNode(node: studioDom.StudioNode) {
      dispatch({
        type: 'SAVE_NODE',
        node,
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
    setNodeNamespacedProp<
      Node extends studioDom.StudioNode,
      Namespace extends studioDom.PropNamespaces<Node>,
      Prop extends keyof Node[Namespace] & string,
    >(node: Node, namespace: Namespace, prop: Prop, value: Node[Namespace][Prop] | null) {
      dispatch({
        type: 'DOM_SET_NODE_PROP',
        namespace,
        node,
        prop,
        value: value as StudioBindable<unknown> | null,
      });
    },
    setNodeAttribute<N extends studioDom.StudioNode, K extends studioDom.Attributes<N>>(
      node: N,
      attr: K,
      value: N[K],
    ) {
      dispatch({
        type: 'DOM_SET_NODE_ATTR',
        nodeId: node.id,
        attr,
        value,
      });
    },
  };
}

interface DomState {
  dom: studioDom.StudioDom;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const DomStateContext = React.createContext<DomState>({
  loaded: false,
  loading: false,
  error: null,
  dom: studioDom.createDom(),
});

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export function useDomState(): DomState {
  return React.useContext(DomStateContext);
}

export function useDom(): studioDom.StudioDom {
  const { dom } = useDomState();
  return dom;
}

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

export interface DomContextProps {
  children?: React.ReactNode;
}

export default function DomProvider({ children }: DomContextProps) {
  const [state, dispatch] = React.useReducer(domReducer, {
    loading: false,
    loaded: false,
    error: null,
    dom: studioDom.createDom(),
  });
  const api = React.useMemo(() => createDomApi(dispatch), []);

  React.useEffect(() => {
    dispatch({ type: 'DOM_LOADING' });
    client.query
      .loadApp()
      .then((dom) => {
        dispatch({ type: 'DOM_LOADED', dom });
      })
      .catch((err) => {
        dispatch({ type: 'DOM_LOADING_ERROR', error: err.message });
      });
  }, []);

  return (
    <DomStateContext.Provider value={state}>
      <DomApiContext.Provider value={api}>{children}</DomApiContext.Provider>
    </DomStateContext.Provider>
  );
}
