import { PropDefinitions, ComponentDefinition } from '@mui/studio-core';
import { getStudioComponent } from './studioComponents';
import { omit, update, updateOrCreate } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import { NodeId, SlotLocation, StudioNodeProp, StudioNodeProps } from './types';
import { ExactEntriesOf } from './utils/types';
import * as studioDom from './studioDom';

function getDefaultPropValues<P = {}>(
  definition: ComponentDefinition<P>,
): Partial<StudioNodeProps<P>> {
  const result: Partial<StudioNodeProps<P>> = {};
  const entries = Object.entries(definition.props) as ExactEntriesOf<PropDefinitions<P>>;
  entries.forEach(([name, prop]) => {
    if (prop) {
      result[name] = {
        type: 'const',
        value: prop.defaultValue,
      };
    }
  });

  return result;
}

export type ComponentPanelTab = 'catalog' | 'component';

export interface BindingEditorState {
  readonly nodeId: NodeId;
  readonly prop: string;
}

export interface EditorState {
  readonly dom: studioDom.StudioDom;
  readonly pageNodeId: NodeId;
  readonly selection: NodeId | null;
  readonly componentPanelTab: ComponentPanelTab;
  readonly newNode: studioDom.StudioNode | null;
  readonly bindingEditor: BindingEditorState | null;
  readonly highlightLayout: boolean;
  readonly highlightedSlot: SlotLocation | null;
}

export type EditorAction =
  | {
      type: 'NOOP';
    }
  | {
      type: 'SELECT_NODE';
      nodeId: NodeId | null;
    }
  | {
      type: 'SET_NODE_NAME';
      nodeId: NodeId;
      name: string;
    }
  | {
      type: 'SET_NODE_PROP';
      nodeId: NodeId;
      prop: string;
      value: StudioNodeProp<unknown>;
    }
  | {
      type: 'SET_NODE_PROPS';
      nodeId: NodeId;
      props: StudioNodeProps;
    }
  | {
      type: 'SET_COMPONENT_PANEL_TAB';
      tab: ComponentPanelTab;
    }
  | {
      type: 'ADD_COMPONENT_DRAG_START';
      component: string;
    }
  | {
      type: 'NODE_DRAG_START';
      nodeId: NodeId;
    }
  | {
      type: 'ADD_COMPONENT_DRAG_END';
    }
  | {
      type: 'ADD_COMPONENT_DRAG_OVER';
      slot: SlotLocation | null;
    }
  | {
      type: 'ADD_COMPONENT_DROP';
      location: SlotLocation | null;
    }
  | {
      type: 'SELECTION_REMOVE';
    }
  | {
      type: 'OPEN_BINDING_EDITOR';
      nodeId: NodeId;
      prop: string;
    }
  | {
      type: 'CLOSE_BINDING_EDITOR';
    }
  | {
      type: 'ADD_BINDING';
      srcNodeId: NodeId;
      srcProp: string;
      destNodeId: NodeId;
      destProp: string;
      initialValue: string;
    }
  | {
      type: 'REMOVE_BINDING';
      nodeId: NodeId;
      prop: string;
    };

function removeNode(
  dom: studioDom.StudioDom,
  node: studioDom.StudioElementNode,
): studioDom.StudioDom {
  const parent = studioDom.getParent(dom, node);

  if (!parent) {
    throw new Error(`Invariant: Node: "${node.id}" has no parent`);
  }

  return update(dom, {
    nodes: omit(
      update(dom.nodes, {
        [parent.id]: update(parent, {
          children: parent.children.filter((slot) => slot !== node.id),
        }),
      }),
      node.id,
    ),
  });
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'NOOP':
      return state;
    case 'SELECT_NODE':
      return update(state, {
        selection: action.nodeId || null,
        componentPanelTab: 'component',
      });
    case 'SET_NODE_NAME': {
      const node = studioDom.getNode(state.dom, action.nodeId);
      return update(state, {
        dom: studioDom.setNodeName(state.dom, node, action.name),
      });
    }
    case 'SET_NODE_PROP': {
      const node = studioDom.getNode(state.dom, action.nodeId);
      studioDom.assertIsElement(node);
      return update(state, {
        dom: studioDom.setNodeProps(
          state.dom,
          node,
          update(node.props, {
            [action.prop]: action.value,
          }),
        ),
      });
    }
    case 'SET_NODE_PROPS': {
      const node = studioDom.getNode(state.dom, action.nodeId);
      studioDom.assertIsElement(node);
      return update(state, {
        dom: studioDom.setNodeProps(state.dom, node, action.props),
      });
    }
    case 'SET_COMPONENT_PANEL_TAB':
      return update(state, {
        componentPanelTab: action.tab,
      });
    case 'NODE_DRAG_START': {
      return update(state, {
        selection: action.nodeId,
      });
    }
    case 'SELECTION_REMOVE': {
      if (!state.selection || state.newNode) {
        return state;
      }

      const node = studioDom.getNode(state.dom, state.selection);
      studioDom.assertIsElement(node);

      // TODO: also clean up orphaned state and bindings
      return update(state, {
        selection: null,
        dom: removeNode(state.dom, node),
      });
    }
    case 'ADD_COMPONENT_DRAG_START': {
      if (state.newNode) {
        return state;
      }
      const componentDef = getStudioComponent(action.component);
      const newNode = studioDom.createElement(
        state.dom,
        action.component,
        getDefaultPropValues(componentDef),
      );
      return update(state, {
        selection: null,
        newNode,
      });
    }
    case 'ADD_COMPONENT_DRAG_END':
      return update(state, {
        newNode: null,
        highlightLayout: false,
        highlightedSlot: null,
      });
    case 'ADD_COMPONENT_DRAG_OVER': {
      return update(state, {
        highlightLayout: true,
        highlightedSlot: action.slot ? updateOrCreate(state.highlightedSlot, action.slot) : null,
      });
    }
    case 'ADD_COMPONENT_DROP': {
      let { newNode, dom } = state;
      let indexOffset = 0;

      if (!newNode && state.selection) {
        const selection = studioDom.getNode(dom, state.selection);
        studioDom.assertIsElement(selection);
        newNode = selection;
        if (newNode && newNode.parentId === action.location?.nodeId) {
          const parent = studioDom.getNode(dom, newNode.parentId);
          if (!studioDom.isPage(parent) && !studioDom.isElement(parent)) {
            throw new Error(`Invariant: Inavlid node type in drop parent "${parent.type}"`);
          }

          // The following removal will reduce the children, so we adjust the index
          // if we're moving a node down within the same parent.
          const siblings = parent.children;
          const currentIndex = siblings.indexOf(newNode.id);
          if (action.location.index > currentIndex) {
            indexOffset = -1;
          }
        }
        dom = removeNode(dom, selection);
      }

      if (!action.location || !newNode) {
        return update(state, {
          newNode: null,
          highlightLayout: false,
          highlightedSlot: null,
        });
      }

      const { nodeId, index } = action.location;
      const node = studioDom.getNode(dom, nodeId);
      if (!studioDom.isPage(node) && !studioDom.isElement(node)) {
        throw new Error(`Invariant: Inavlid node type in drop parent "${node.type}"`);
      }

      const sliceIndex = index + indexOffset;

      return update(state, {
        dom: update(dom, {
          nodes: update(dom.nodes, {
            [node.id]: update(node, {
              children: [
                ...node.children.slice(0, sliceIndex),
                newNode.id,
                ...node.children.slice(sliceIndex),
              ],
            }),
            [newNode.id]: update(newNode, {
              parentId: nodeId,
            }),
          }),
        }),
        newNode: null,
        highlightLayout: false,
        highlightedSlot: null,
      });
    }
    case 'OPEN_BINDING_EDITOR': {
      return update(state, {
        bindingEditor: action,
      });
    }
    case 'CLOSE_BINDING_EDITOR': {
      return update(state, {
        bindingEditor: null,
      });
    }
    case 'ADD_BINDING': {
      const { srcNodeId, srcProp, destNodeId, destProp, initialValue } = action;
      const srcNode = studioDom.getNode(state.dom, srcNodeId);
      studioDom.assertIsElement(srcNode);
      const destNode = studioDom.getNode(state.dom, destNodeId);
      studioDom.assertIsElement(destNode);
      const destPropValue = destNode.props[destProp];
      let stateKey = destPropValue?.type === 'binding' ? destPropValue.state : null;

      const page = studioDom.getNode(state.dom, state.pageNodeId);
      studioDom.assertIsPage(page);

      let pageState = page.state;
      if (!stateKey) {
        stateKey = generateUniqueId(new Set(Object.keys(page.state)));
        pageState = update(pageState, {
          [stateKey]: { name: '', initialValue },
        });
      }

      return update(state, {
        dom: update(state.dom, {
          nodes: update(state.dom.nodes, {
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
        }),
      });
    }
    case 'REMOVE_BINDING': {
      const { nodeId, prop } = action;

      const node = studioDom.getNode(state.dom, nodeId);
      studioDom.assertIsElement(node);

      // TODO: also clean up orphaned state and bindings
      return update(state, {
        dom: update(state.dom, {
          nodes: update(state.dom.nodes, {
            [nodeId]: update(node, {
              props: omit(node.props, prop),
            }),
          }),
        }),
      });
    }
    default:
      throw new Error('Invariant');
  }
}

export function createEditorState(dom: studioDom.StudioDom, pageNodeId: NodeId): EditorState {
  return {
    dom,
    pageNodeId,
    selection: null,
    componentPanelTab: 'catalog',
    newNode: null,
    bindingEditor: null,
    highlightLayout: false,
    highlightedSlot: null,
  };
}
