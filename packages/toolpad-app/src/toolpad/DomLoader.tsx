import * as React from 'react';
import { NodeId, BindableAttrValues } from '@mui/toolpad-core';
import invariant from 'invariant';
import { debounce, DebouncedFunc } from 'lodash-es';
import * as appDom from '../appDom';
import { update } from '../utils/immutability';
import client from '../api';
import useShortcut from '../utils/useShortcut';
import useDebouncedHandler from '../utils/useDebouncedHandler';
import { createProvidedContext } from '../utils/react';
import { mapValues } from '../utils/collections';
import insecureHash from '../utils/insecureHash';
import useEvent from '../utils/useEvent';
import { NodeHashes } from '../types';
import { hasFieldFocus } from '../utils/fields';

export type DomView =
  | { kind: 'page'; nodeId?: NodeId }
  | { kind: 'query'; nodeId: NodeId }
  | { kind: 'pageModule'; nodeId: NodeId }
  | { kind: 'pageParameters'; nodeId: NodeId }
  | { kind: 'connection'; nodeId: NodeId }
  | { kind: 'codeComponent'; nodeId: NodeId };

export type ComponentPanelTab = 'component' | 'theme';

export type DomAction =
  | {
      type: 'DOM_UPDATE_HISTORY';
    }
  | {
      type: 'DOM_UNDO';
    }
  | {
      type: 'DOM_REDO';
    }
  | {
      type: 'DOM_SAVING';
    }
  | {
      type: 'DOM_SAVED';
      savedDom: appDom.AppDom;
    }
  | {
      type: 'DOM_SAVING_ERROR';
      error: string;
    }
  | {
      type: 'DOM_SET_NODE_NAME';
      nodeId: NodeId;
      name: string;
    }
  | {
      type: 'DOM_SET_NODE_NAMESPACE';
      node: appDom.AppDomNode;
      namespace: string;
      value: BindableAttrValues | null;
    }
  | {
      type: 'DOM_UPDATE';
      updatedDom: appDom.AppDom;
      selectedNodeId?: NodeId | null;
      view?: DomView;
    }
  | {
      type: 'DOM_SET_VIEW';
      view: DomView;
    }
  | {
      type: 'DOM_SET_TAB';
      tab: ComponentPanelTab;
    }
  | {
      type: 'DOM_SAVE_NODE';
      node: appDom.AppDomNode;
    }
  | {
      type: 'SELECT_NODE';
      nodeId: NodeId;
    }
  | {
      type: 'DESELECT_NODE';
    };

export function domReducer(dom: appDom.AppDom, action: DomAction): appDom.AppDom {
  switch (action.type) {
    case 'DOM_SET_NODE_NAME': {
      // TODO: Also update all bindings on the page that use this name
      const node = appDom.getNode(dom, action.nodeId);
      return appDom.setNodeName(dom, node, action.name);
    }
    case 'DOM_SET_NODE_NAMESPACE': {
      return appDom.setNodeNamespace<any, any>(dom, action.node, action.namespace, action.value);
    }
    case 'DOM_UPDATE': {
      return action.updatedDom;
    }
    case 'DOM_SAVE_NODE': {
      return appDom.saveNode(dom, action.node);
    }
    default:
      return dom;
  }
}

const UNDO_HISTORY_LIMIT = 100;

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
    case 'DOM_UPDATE_HISTORY': {
      const updatedUndoStack = [
        ...state.undoStack,
        {
          dom: state.dom,
          selectedNodeId: state.selectedNodeId,
          view: state.currentView,
          tab: state.currentTab,
          timestamp: Date.now(),
        },
      ];

      if (updatedUndoStack.length > UNDO_HISTORY_LIMIT) {
        updatedUndoStack.shift();
      }

      return update(state, {
        undoStack: updatedUndoStack,
        redoStack: [],
      });
    }
    case 'DOM_UNDO': {
      const undoStack = [...state.undoStack];
      const redoStack = [...state.redoStack];

      if (undoStack.length < 2) {
        return state;
      }

      const currentState = undoStack.pop();

      const previousStackEntry = undoStack[undoStack.length - 1];

      if (!previousStackEntry || !currentState) {
        return state;
      }

      redoStack.push(currentState);

      return update(state, {
        dom: previousStackEntry.dom,
        selectedNodeId: previousStackEntry.selectedNodeId,
        currentView: previousStackEntry.view,
        currentTab: previousStackEntry.tab,
        undoStack,
        redoStack,
      });
    }
    case 'DOM_REDO': {
      const undoStack = [...state.undoStack];
      const redoStack = [...state.redoStack];

      const nextStackEntry = redoStack.pop();

      if (!nextStackEntry) {
        return state;
      }

      undoStack.push(nextStackEntry);

      return update(state, {
        dom: nextStackEntry.dom,
        selectedNodeId: nextStackEntry.selectedNodeId,
        currentView: nextStackEntry.view,
        currentTab: nextStackEntry.tab,
        undoStack,
        redoStack,
      });
    }
    case 'DOM_SAVING': {
      return update(state, {
        saving: true,
        saveError: null,
      });
    }
    case 'DOM_SAVED': {
      return update(state, {
        savedDom: action.savedDom,
        saving: false,
        saveError: null,
        unsavedChanges: 0,
      });
    }
    case 'DOM_SAVING_ERROR': {
      return update(state, {
        saving: false,
        saveError: action.error,
      });
    }
    case 'SELECT_NODE': {
      return update(state, {
        selectedNodeId: action.nodeId,
        currentTab: 'component',
      });
    }
    case 'DESELECT_NODE': {
      return update(state, {
        selectedNodeId: null,
        currentTab: 'component',
      });
    }
    case 'DOM_UPDATE': {
      return update(state, {
        ...(typeof action.selectedNodeId !== 'undefined'
          ? { selectedNodeId: action.selectedNodeId, currentTab: 'component' }
          : {}),
        ...(action.view ? { currentView: action.view } : {}),
      });
    }
    case 'DOM_SET_VIEW': {
      return update(state, {
        currentView: action.view,
      });
    }
    case 'DOM_SET_TAB': {
      return update(state, {
        currentTab: action.tab,
      });
    }
    default:
      return state;
  }
}

function createDomApi(
  dispatch: React.Dispatch<DomAction>,
  scheduleTextInputHistoryUpdate?: DebouncedFunc<() => void>,
) {
  return {
    undo() {
      scheduleTextInputHistoryUpdate?.flush();

      dispatch({ type: 'DOM_UNDO' });
    },
    redo() {
      dispatch({ type: 'DOM_REDO' });
    },
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({ type: 'DOM_SET_NODE_NAME', nodeId, name });
    },
    update(dom: appDom.AppDom, view?: DomView, selectedNodeId?: NodeId | null) {
      dispatch({
        type: 'DOM_UPDATE',
        updatedDom: dom,
        selectedNodeId,
        view,
      });
    },
    setView(view: DomView) {
      dispatch({
        type: 'DOM_SET_VIEW',
        view,
      });
    },
    setTab(tab: ComponentPanelTab) {
      dispatch({
        type: 'DOM_SET_TAB',
        tab,
      });
    },
    saveNode(node: appDom.AppDomNode) {
      dispatch({
        type: 'DOM_SAVE_NODE',
        node,
      });
    },
    setNodeNamespace<Node extends appDom.AppDomNode, Namespace extends appDom.PropNamespaces<Node>>(
      node: Node,
      namespace: Namespace,
      value: Node[Namespace] | null,
    ) {
      dispatch({
        type: 'DOM_SET_NODE_NAMESPACE',
        namespace,
        node,
        value: value as BindableAttrValues | null,
      });
    },
    selectNode(nodeId: NodeId) {
      dispatch({
        type: 'SELECT_NODE',
        nodeId,
      });
    },
    deselectNode() {
      dispatch({
        type: 'DESELECT_NODE',
      });
    },
  };
}

export interface DomLoader {
  dom: appDom.AppDom;
  savedDom: appDom.AppDom;
  saving: boolean;
  unsavedChanges: number;
  saveError: string | null;
  selectedNodeId: NodeId | null;
  currentView: DomView;
  currentTab: ComponentPanelTab;
  undoStack: UndoRedoStackEntry[];
  redoStack: UndoRedoStackEntry[];
}

export function getNodeHashes(dom: appDom.AppDom): NodeHashes {
  return mapValues(dom.nodes, (node) => insecureHash(JSON.stringify(node)));
}

const [useDomLoader, DomLoaderProvider] = createProvidedContext<DomLoader>('DomLoader');

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export { useDomLoader };

export interface DomState {
  dom: appDom.AppDom;
  selectedNodeId: NodeId | null;
  currentView: DomView;
  currentTab: ComponentPanelTab;
}

interface UndoRedoStackEntry extends Omit<DomState, 'currentView' | 'currentTab'> {
  view: DomView;
  tab: ComponentPanelTab;
  timestamp: number;
}

export function useDom(): DomState {
  const { dom, selectedNodeId, currentView, currentTab } = useDomLoader();
  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }
  return { dom, selectedNodeId, currentView, currentTab };
}

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

let previousUnsavedChanges = 0;
function logUnsavedChanges(unsavedChanges: number) {
  const hasUnsavedChanges = unsavedChanges >= 1;

  if (!hasUnsavedChanges && previousUnsavedChanges > 0) {
    // eslint-disable-next-line no-console
    console.log(`${previousUnsavedChanges} changes saved.`);
  }

  previousUnsavedChanges = unsavedChanges;
}

export interface DomContextProps {
  appId: string;
  children?: React.ReactNode;
}

const SKIP_UNDO_ACTIONS = new Set([
  'DOM_UPDATE_HISTORY',
  'DOM_UNDO',
  'DOM_REDO',
  'DOM_SAVED',
  'DOM_SAVING',
  'DOM_SAVING_ERROR',
]);

export default function DomProvider({ appId, children }: DomContextProps) {
  const { data: dom } = client.useQuery('loadDom', [appId], { suspense: true });

  invariant(dom, `Suspense should load the dom`);

  const [state, dispatch] = React.useReducer(domLoaderReducer, {
    saving: false,
    unsavedChanges: 0,
    saveError: null,
    savedDom: dom,
    dom,
    selectedNodeId: null,
    currentView: { kind: 'page' },
    currentTab: 'component',
    undoStack: [
      {
        dom,
        selectedNodeId: null,
        view: { kind: 'page' },
        tab: 'component',
        timestamp: Date.now(),
      },
    ],
    redoStack: [],
  });

  const scheduleTextInputHistoryUpdate = React.useMemo(
    () =>
      debounce(() => {
        dispatch({ type: 'DOM_UPDATE_HISTORY' });
      }, 500),
    [],
  );

  const scheduleHistoryUpdate = React.useMemo(
    () => () => {
      if (!hasFieldFocus()) {
        dispatch({ type: 'DOM_UPDATE_HISTORY' });
      } else {
        scheduleTextInputHistoryUpdate();
      }
    },
    [scheduleTextInputHistoryUpdate],
  );

  const dispatchWithHistory = useEvent((action: DomAction) => {
    dispatch(action);

    if (!SKIP_UNDO_ACTIONS.has(action.type)) {
      scheduleHistoryUpdate();
    }
  });

  const api = React.useMemo(
    () => createDomApi(dispatchWithHistory, scheduleTextInputHistoryUpdate),
    [dispatchWithHistory, scheduleTextInputHistoryUpdate],
  );

  const handleSave = React.useCallback(() => {
    if (!state.dom || state.saving || state.savedDom === state.dom) {
      return;
    }

    const domToSave = state.dom;
    dispatch({ type: 'DOM_SAVING' });
    client.mutation
      .saveDom(appId, domToSave)
      .then(() => {
        dispatch({ type: 'DOM_SAVED', savedDom: domToSave });
      })
      .catch((err) => {
        dispatch({ type: 'DOM_SAVING_ERROR', error: err.message });
      });
  }, [appId, state]);

  const debouncedHandleSave = useDebouncedHandler(handleSave, 1000);

  React.useEffect(() => {
    debouncedHandleSave();
  }, [state.dom, debouncedHandleSave]);

  React.useEffect(() => {
    logUnsavedChanges(state.unsavedChanges);

    if (state.unsavedChanges <= 0) {
      return () => {};
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = `You have unsaved changes. Are you sure you want to navigate away?`;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state.unsavedChanges]);

  useShortcut({ key: 's', metaKey: true }, handleSave);

  return (
    <DomLoaderProvider value={state}>
      <DomApiContext.Provider value={api}>{children}</DomApiContext.Provider>
    </DomLoaderProvider>
  );
}
