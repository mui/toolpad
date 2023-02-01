import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '@mui/toolpad-core/utils/react';
import invariant from 'invariant';
import { debounce, DebouncedFunc } from 'lodash-es';
import { useLocation } from 'react-router-dom';
import * as appDom from '../appDom';
import { update } from '../utils/immutability';
import client from '../api';
import useShortcut from '../utils/useShortcut';
import useDebouncedHandler from '../utils/useDebouncedHandler';
import { mapValues } from '../utils/collections';
import insecureHash from '../utils/insecureHash';
import useEvent from '../utils/useEvent';
import { NodeHashes } from '../types';
import { hasFieldFocus } from '../utils/fields';
import { DomView, getViewFromPathname } from '../utils/domView';
import config from '../config';

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
      type: 'DOM_UPDATE';
      updater: (dom: appDom.AppDom) => appDom.AppDom;
      selectedNodeId?: NodeId | null;
      view?: DomView;
    }
  | {
      type: 'DOM_SERVER_UPDATE';
      dom: appDom.AppDom;
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
      type: 'SELECT_NODE';
      nodeId: NodeId;
    }
  | {
      type: 'DESELECT_NODE';
    };

export function domReducer(dom: appDom.AppDom, action: DomAction): appDom.AppDom {
  switch (action.type) {
    case 'DOM_UPDATE': {
      return action.updater(dom);
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
      });
    }
    case 'DOM_UPDATE': {
      const { selectedNodeId, view } = action;

      return update(state, {
        ...(typeof selectedNodeId !== 'undefined'
          ? { selectedNodeId, currentTab: 'component' }
          : {}),
        ...(view ? { currentView: view } : {}),
      });
    }
    case 'DOM_SERVER_UPDATE': {
      if (state.unsavedChanges > 0) {
        // Ignore this server update
        return state;
      }

      return update(state, { dom: action.dom });
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
      dispatch({
        type: 'DOM_UPDATE',
        updater(dom) {
          const node = appDom.getNode(dom, nodeId);
          return appDom.setNodeName(dom, node, name);
        },
      });
    },
    update(
      updater: (dom: appDom.AppDom) => appDom.AppDom,
      extraUpdates: {
        view?: DomView;
        selectedNodeId?: NodeId | null;
      } = {},
    ) {
      dispatch({
        type: 'DOM_UPDATE',
        updater,
        ...extraUpdates,
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
        type: 'DOM_UPDATE',
        updater(dom) {
          return appDom.saveNode(dom, node);
        },
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

type DomActionType = DomAction['type'];

const UNDOABLE_ACTIONS = new Set<DomActionType>([
  'DOM_UPDATE',
  'DOM_SET_VIEW',
  'DOM_SET_TAB',
  'SELECT_NODE',
  'DESELECT_NODE',
]);

export default function DomProvider({ appId, children }: DomContextProps) {
  const { data: dom } = client.useQuery('loadDom', [appId], { suspense: true });

  invariant(dom, `Suspense should load the dom`);

  const location = useLocation();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);
  const firstPage = pages.length > 0 ? pages[0] : null;

  const initialView = getViewFromPathname(location.pathname) || {
    kind: 'page',
    nodeId: firstPage?.id,
  };

  const [state, dispatch] = React.useReducer(domLoaderReducer, {
    saving: false,
    unsavedChanges: 0,
    saveError: null,
    savedDom: dom,
    dom,
    selectedNodeId: null,
    currentView: initialView,
    currentTab: 'component',
    undoStack: [
      {
        dom,
        selectedNodeId: null,
        view: initialView,
        tab: 'component',
        timestamp: Date.now(),
      },
    ],
    redoStack: [],
  });

  React.useEffect(() => {
    dispatch({
      type: 'DOM_SERVER_UPDATE',
      dom,
    });
  }, [dom]);

  const scheduleTextInputHistoryUpdate = React.useMemo(
    () =>
      debounce(() => {
        dispatch({ type: 'DOM_UPDATE_HISTORY' });
      }, 500),
    [],
  );

  const dispatchWithHistory = useEvent((action: DomAction) => {
    dispatch(action);

    if (UNDOABLE_ACTIONS.has(action.type)) {
      if (hasFieldFocus()) {
        scheduleTextInputHistoryUpdate();
      } else {
        dispatch({ type: 'DOM_UPDATE_HISTORY' });
      }
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

  // Quick and dirty polling for dom updates
  const fingerprint = React.useRef<number | undefined>();
  React.useEffect(() => {
    if (!config.localMode) {
      return () => {};
    }

    let active = true;

    (async () => {
      while (active) {
        try {
          const currentFingerprint = fingerprint.current;
          // eslint-disable-next-line no-await-in-loop
          const newFingerPrint = await client.query.getDomFingerprint();
          if (currentFingerprint && currentFingerprint !== newFingerPrint) {
            client.invalidateQueries('loadDom', [appId]);
          }
          fingerprint.current = newFingerPrint;
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
        } catch (err) {
          console.error(err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [appId]);

  return (
    <DomLoaderProvider value={state}>
      <DomApiContext.Provider value={api}>{children}</DomApiContext.Provider>
    </DomLoaderProvider>
  );
}
