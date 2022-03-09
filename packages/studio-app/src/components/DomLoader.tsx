import * as React from 'react';
import * as studioDom from '../studioDom';
import { NodeId, StudioBindable, StudioBindables } from '../types';
import { update } from '../utils/immutability';
import client from '../api';
import useDebounced from '../utils/useDebounced';

export type DomAction =
  | {
      type: 'DOM_LOADING';
    }
  | {
      type: 'DOM_LOADED';
      dom: studioDom.StudioDom;
    }
  | {
      type: 'DOM_SAVING';
    }
  | {
      type: 'DOM_SAVED';
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
      type: 'DOM_SET_NODE_NAMESPACE';
      node: studioDom.StudioNode;
      namespace: string;
      value: StudioBindables<unknown> | null;
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

export function domReducer(dom: studioDom.StudioDom, action: DomAction): studioDom.StudioDom {
  switch (action.type) {
    case 'DOM_SET_NODE_NAME': {
      // TODO: Also update all bindings on the page that use this name
      const node = studioDom.getNode(dom, action.nodeId);
      return studioDom.setNodeName(dom, node, action.name);
    }
    case 'DOM_SET_NODE_PROP': {
      return studioDom.setNodeNamespacedProp<any, any, any>(
        dom,
        action.node,
        action.namespace,
        action.prop,
        action.value,
      );
    }
    case 'DOM_SET_NODE_NAMESPACE': {
      return studioDom.setNodeNamespace<any, any>(dom, action.node, action.namespace, action.value);
    }
    case 'DOM_ADD_NODE': {
      return studioDom.addNode<any, any>(
        dom,
        action.node,
        action.parent,
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
      return studioDom.removeNode(dom, action.nodeId);
    }
    default:
      return dom;
  }
}

export function domLoaderReducer(state: DomLoader, action: DomAction): DomLoader {
  if (state.dom) {
    const newDom = domReducer(state.dom, action);
    const hasUnsavedChanges = newDom !== state.dom;

    state = update(state, {
      dom: newDom,
      unsavedChanges: hasUnsavedChanges ? state.unsavedChanges + 1 : state.unsavedChanges,
    });
  }

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
        error: null,
        dom: action.dom,
        unsavedChanges: 0,
      });
    }
    case 'DOM_SAVING': {
      return update(state, {
        saving: true,
        error: null,
      });
    }
    case 'DOM_SAVED': {
      return update(state, {
        saving: false,
        error: null,
        unsavedChanges: 0,
      });
    }
    case 'DOM_LOADING_ERROR': {
      return update(state, {
        loading: false,
        saving: false,
        error: action.error,
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
      Prop extends keyof NonNullable<Node[Namespace]> & string,
    >(
      node: Node,
      namespace: Namespace,
      prop: Prop,
      value: NonNullable<Node[Namespace]>[Prop] | null,
    ) {
      dispatch({
        type: 'DOM_SET_NODE_PROP',
        namespace,
        node,
        prop,
        value: value as StudioBindable<unknown> | null,
      });
    },
    setNodeNamespace<
      Node extends studioDom.StudioNode,
      Namespace extends studioDom.PropNamespaces<Node>,
    >(node: Node, namespace: Namespace, value: Node[Namespace] | null) {
      dispatch({
        type: 'DOM_SET_NODE_NAMESPACE',
        namespace,
        node,
        value: value as StudioBindables<unknown> | null,
      });
    },
  };
}

interface DomLoader {
  dom: studioDom.StudioDom | null;
  saving: boolean;
  unsavedChanges: number;
  loading: boolean;
  error: string | null;
}

const DomLoaderContext = React.createContext<DomLoader>({
  saving: false,
  unsavedChanges: 0,
  loading: false,
  error: null,
  dom: null,
});

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export function useDomLoader(): DomLoader {
  return React.useContext(DomLoaderContext);
}

export function useDom(): studioDom.StudioDom {
  const { dom } = useDomLoader();
  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }
  return dom;
}

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

export interface DomContextProps {
  appId: string;
  children?: React.ReactNode;
}

export default function DomProvider({ appId, children }: DomContextProps) {
  console.log(appId);
  const [state, dispatch] = React.useReducer(domLoaderReducer, {
    loading: false,
    saving: false,
    unsavedChanges: 0,
    error: null,
    dom: null,
  });
  const api = React.useMemo(() => createDomApi(dispatch), []);

  React.useEffect(() => {
    let canceled = false;

    dispatch({ type: 'DOM_LOADING' });
    client.query
      .loadDom(appId)
      .then((dom) => {
        if (!canceled) {
          dispatch({ type: 'DOM_LOADED', dom });
        }
      })
      .catch((err) => {
        if (!canceled) {
          dispatch({ type: 'DOM_LOADING_ERROR', error: err.message });
        }
      });

    return () => {
      canceled = true;
    };
  }, [appId]);

  const debouncedDom = useDebounced(state.dom, 1000);

  React.useEffect(() => {
    if (!debouncedDom) {
      return;
    }

    dispatch({ type: 'DOM_SAVING' });

    client.mutation
      .saveDom(appId, debouncedDom)
      .then(() => {
        dispatch({ type: 'DOM_SAVED' });
      })
      .catch((err) => {
        dispatch({ type: 'DOM_LOADING_ERROR', error: err.message });
      });
  }, [appId, debouncedDom]);

  React.useEffect(() => {
    if (state.unsavedChanges <= 0) {
      return () => {};
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = `You have ${state.unsavedChanges} unsaved change(s), are you sure you want to navigate away?`;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state.unsavedChanges]);

  return (
    <DomLoaderContext.Provider value={state}>
      <DomApiContext.Provider value={api}>{children}</DomApiContext.Provider>
    </DomLoaderContext.Provider>
  );
}
