import * as React from 'react';
import * as studioDom from '../studioDom';
import { NodeId, StudioNodeProp, StudioNodeProps } from '../types';
import { update, omit } from '../utils/immutability';
import { generateUniqueId } from '../utils/randomId';

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

export function domReducer(dom: studioDom.StudioDom, action: DomAction): studioDom.StudioDom {
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

function createDomApi(dispatch: React.Dispatch<DomAction>) {
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

const DomStateContext = React.createContext<studioDom.StudioDom>(studioDom.createDom());

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export function useDom(): studioDom.StudioDom {
  return React.useContext(DomStateContext);
}

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

export interface DomContextProps {
  initialDom: studioDom.StudioDom;
  children?: React.ReactNode;
}

export default function DomProvider({ initialDom, children }: DomContextProps) {
  const [state, dispatch] = React.useReducer(domReducer, initialDom);
  const api = React.useMemo(() => createDomApi(dispatch), []);

  return (
    <DomStateContext.Provider value={state}>
      <DomApiContext.Provider value={api}>{children}</DomApiContext.Provider>
    </DomStateContext.Provider>
  );
}
