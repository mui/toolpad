import { PropDefinitions } from '@mui/studio-core';
import { getStudioComponent } from './studioComponents';
import { omit, update, updateOrCreate } from './utils/immutability';
import { generateUniqueId } from './utils/randomId';
import { createNode, getNode, setNodeName, setNodeProps } from './studioPage';
import {
  NodeId,
  SlotLocation,
  StudioComponentDefinition,
  StudioNode,
  StudioNodeProp,
  StudioNodeProps,
  StudioPage,
  StudioPageQuery,
} from './types';
import { ExactEntriesOf } from './utils/types';

function getDefaultPropValues<P = {}>(
  definition: StudioComponentDefinition<P>,
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
  readonly page: StudioPage;
  readonly selection: NodeId | null;
  readonly componentPanelTab: ComponentPanelTab;
  readonly newNode: StudioNode | null;
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
    }
  | {
      type: 'SET_QUERY';
      queryId: string;
      query: StudioPageQuery<any> | null;
    };

function removeNode(page: StudioPage, nodeId: NodeId): StudioPage {
  const node = getNode(page, nodeId);

  if (!node.parentId) {
    return page;
  }

  const parent = getNode(page, node.parentId);

  return update(page, {
    nodes: omit(
      update(page.nodes, {
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
    case 'SET_NODE_NAME':
      return update(state, {
        page: setNodeName(state.page, action.nodeId, action.name),
      });
    case 'SET_NODE_PROP': {
      const node = getNode(state.page, action.nodeId);
      return update(state, {
        page: setNodeProps(
          state.page,
          action.nodeId,
          update(node.props, {
            [action.prop]: action.value,
          }),
        ),
      });
    }
    case 'SET_NODE_PROPS': {
      return update(state, {
        page: setNodeProps(state.page, action.nodeId, action.props),
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

      // TODO: also clean up orphaned state and bindings
      return update(state, {
        selection: null,
        page: removeNode(state.page, state.selection),
      });
    }
    case 'ADD_COMPONENT_DRAG_START': {
      if (state.newNode) {
        return state;
      }
      const componentDef = getStudioComponent(action.component);
      const newNode = createNode(state.page, action.component, getDefaultPropValues(componentDef));
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
      let { newNode, page } = state;
      let indexOffset = 0;

      if (!newNode && state.selection) {
        newNode = getNode(page, state.selection);
        if (newNode.parentId === action.location?.nodeId) {
          const parent = getNode(page, newNode.parentId);
          // The following removal will reduce the children, so we adjust the index
          // if we're moving a node down within the same parent.
          const siblings = parent.children;
          const currentIndex = siblings.indexOf(newNode.id);
          if (action.location.index > currentIndex) {
            indexOffset = -1;
          }
        }
        page = removeNode(page, state.selection);
      }

      if (!action.location || !newNode) {
        return update(state, {
          newNode: null,
          highlightLayout: false,
          highlightedSlot: null,
        });
      }

      const { nodeId, index } = action.location;
      const node = getNode(page, nodeId);

      const sliceIndex = index + indexOffset;

      return update(state, {
        page: update(page, {
          nodes: update(page.nodes, {
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
      const srcNode = getNode(state.page, srcNodeId);
      const destNode = getNode(state.page, destNodeId);
      const destPropValue = destNode.props[destProp];
      let stateKey = destPropValue?.type === 'binding' ? destPropValue.state : null;

      let pageState = state.page.state;
      if (!stateKey) {
        stateKey = generateUniqueId(new Set(Object.keys(state.page.state)));
        pageState = update(pageState, {
          [stateKey]: { name: '', initialValue },
        });
      }

      return update(state, {
        page: update(state.page, {
          state: pageState,
          nodes: update(state.page.nodes, {
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

      const node = getNode(state.page, nodeId);

      // TODO: also clean up orphaned state and bindings
      return update(state, {
        page: update(state.page, {
          nodes: update(state.page.nodes, {
            [nodeId]: update(node, {
              props: omit(node.props, prop),
            }),
          }),
        }),
      });
    }
    case 'SET_QUERY': {
      return update(state, {
        page: update(state.page, {
          queries: update(state.page.queries, {
            [action.queryId]: action.query || undefined,
          }),
        }),
      });
    }
    default:
      throw new Error('Invariant');
  }
}

export function createEditorState(page: StudioPage): EditorState {
  return {
    page,
    selection: null,
    componentPanelTab: 'catalog',
    newNode: null,
    bindingEditor: null,
    highlightLayout: false,
    highlightedSlot: null,
  };
}
