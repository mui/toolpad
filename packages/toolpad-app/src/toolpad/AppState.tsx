import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { createProvidedContext } from '@mui/toolpad-utils/react';
import invariant from 'invariant';
import { debounce, DebouncedFunc } from 'lodash-es';
import { useLocation } from 'react-router-dom';
import { mapValues } from '@mui/toolpad-utils/collections';
import useDebouncedHandler from '@mui/toolpad-utils/hooks/useDebouncedHandler';
import useEventCallback from '@mui/utils/useEventCallback';
import * as appDom from '../appDom';
import { omit, update } from '../utils/immutability';
import client from '../api';
import useShortcut from '../utils/useShortcut';
import insecureHash from '../utils/insecureHash';
import { NodeHashes } from '../types';
import { hasFieldFocus } from '../utils/fields';
import { DomView, getViewFromPathname, PageViewTab } from '../utils/domView';
import { projectEvents } from '../projectEvents';
import config from '../config';

projectEvents.on('externalChange', () => client.invalidateQueries('loadDom', []));

export function getNodeHashes(dom: appDom.AppDom): NodeHashes {
  return mapValues(dom.nodes, (node) => insecureHash(JSON.stringify(omit(node, 'id'))));
}

export type DomAction = {
  type: 'UPDATE';
  updater?: (dom: appDom.AppDom) => appDom.AppDom;
  view?: DomView;
};

export type DomLoaderAction =
  | DomAction
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
      type: 'DOM_SERVER_UPDATE';
      dom: appDom.AppDom;
    };

export type AppStateAction =
  | DomLoaderAction
  | {
      type: 'UPDATE_HISTORY';
    }
  | {
      type: 'UNDO';
    }
  | {
      type: 'REDO';
    }
  | {
      type: 'SET_VIEW';
      view: DomView;
    }
  | {
      type: 'SET_TAB';
      tab: PageViewTab;
    }
  | {
      type: 'SELECT_NODE';
      nodeId: NodeId;
    }
  | {
      type: 'DESELECT_NODE';
    }
  | {
      type: 'HOVER_NODE';
      nodeId: NodeId;
    }
  | {
      type: 'BLUR_HOVER_NODE';
    }
  | {
      type: 'SET_HAS_UNSAVED_CHANGES';
      hasUnsavedChanges: boolean;
    };

export function domReducer(dom: appDom.AppDom, action: AppStateAction): appDom.AppDom {
  switch (action.type) {
    case 'UPDATE': {
      return action.updater ? action.updater(dom) : dom;
    }
    default:
      return dom;
  }
}

export interface AppState {
  dom: appDom.AppDom;
  base: string;
  savedDom: appDom.AppDom;
  savingDom: boolean;
  unsavedDomChanges: number;
  saveDomError: string | null;
  currentView: DomView;
  undoStack: UndoRedoStackEntry[];
  redoStack: UndoRedoStackEntry[];
  hasUnsavedChanges: boolean;
}

export interface UndoRedoStackEntry {
  dom: appDom.AppDom;
  view: DomView;
  timestamp: number;
}

const UNDO_HISTORY_LIMIT = 100;

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  if (state.dom) {
    const newDom = domReducer(state.dom, action);
    const hasUnsavedDomChanges = newDom !== state.dom;

    state = update(state, {
      dom: newDom,
      unsavedDomChanges: hasUnsavedDomChanges
        ? state.unsavedDomChanges + 1
        : state.unsavedDomChanges,
    });
  }

  switch (action.type) {
    case 'DOM_SAVING': {
      return update(state, {
        savingDom: true,
        saveDomError: null,
      });
    }
    case 'DOM_SAVED': {
      return update(state, {
        savedDom: action.savedDom,
        savingDom: false,
        saveDomError: null,
        unsavedDomChanges: 0,
      });
    }
    case 'DOM_SAVING_ERROR': {
      return update(state, {
        savingDom: false,
        saveDomError: action.error,
      });
    }
    case 'DOM_SERVER_UPDATE': {
      if (state.unsavedDomChanges > 0) {
        // Ignore this server update
        return state;
      }

      return update(state, { dom: action.dom, savedDom: action.dom });
    }
    case 'UPDATE_HISTORY': {
      const updatedUndoStack = [
        ...state.undoStack,
        {
          dom: state.dom,
          view: state.currentView,
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
    case 'UNDO': {
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
        currentView: previousStackEntry.view,
        undoStack,
        redoStack,
      });
    }
    case 'REDO': {
      const undoStack = [...state.undoStack];
      const redoStack = [...state.redoStack];

      const nextStackEntry = redoStack.pop();

      if (!nextStackEntry) {
        return state;
      }

      undoStack.push(nextStackEntry);

      return update(state, {
        dom: nextStackEntry.dom,
        currentView: nextStackEntry.view,
        undoStack,
        redoStack,
      });
    }
    case 'SELECT_NODE': {
      if (state.currentView.kind === 'page') {
        return update(state, {
          currentView: { ...state.currentView, selectedNodeId: action.nodeId, tab: 'component' },
        });
      }
      return state;
    }
    case 'DESELECT_NODE': {
      if (state.currentView.kind === 'page') {
        return update(state, {
          currentView: { ...state.currentView, selectedNodeId: null, tab: 'page' },
        });
      }
      return state;
    }
    case 'HOVER_NODE': {
      if (state.currentView.kind === 'page') {
        return update(state, {
          currentView: { ...state.currentView, hoveredNodeId: action.nodeId },
        });
      }
      return state;
    }
    case 'BLUR_HOVER_NODE': {
      if (state.currentView.kind === 'page') {
        return update(state, {
          currentView: { ...state.currentView, hoveredNodeId: null },
        });
      }
      return state;
    }
    case 'SET_VIEW':
    case 'UPDATE': {
      if (!action.view) {
        return state;
      }

      let newView = action.view;
      if (action.view.kind === 'page') {
        if (typeof action.view.selectedNodeId === 'undefined') {
          const isSameNode = action.view.nodeId === state.currentView.nodeId;

          newView = {
            ...action.view,
            selectedNodeId:
              state.currentView.kind === 'page' && isSameNode
                ? state.currentView.selectedNodeId
                : null,
          };
        }
        if (action.view.selectedNodeId && typeof action.view.tab === 'undefined') {
          newView = {
            ...action.view,
            tab: 'component',
          };
        }
      }

      return update(state, {
        currentView: newView,
      });
    }
    case 'SET_TAB': {
      if (state.currentView.kind === 'page') {
        return update(state, {
          currentView: { ...state.currentView, tab: action.tab },
        });
      }
      return state;
    }
    case 'SET_HAS_UNSAVED_CHANGES': {
      return update(state, {
        hasUnsavedChanges: action.hasUnsavedChanges,
      });
    }
    default:
      return state;
  }
}

function createDomApi(dispatch: React.Dispatch<AppStateAction>) {
  return {
    update(updater: (dom: appDom.AppDom) => appDom.AppDom) {
      dispatch({
        type: 'UPDATE',
        updater,
      });
    },
    setNodeName(nodeId: NodeId, name: string) {
      dispatch({
        type: 'UPDATE',
        updater(dom) {
          const node = appDom.getNode(dom, nodeId);
          return appDom.setNodeName(dom, node, name);
        },
      });
    },
    saveNode(node: appDom.AppDomNode) {
      dispatch({
        type: 'UPDATE',
        updater(dom) {
          return appDom.saveNode(dom, node);
        },
      });
    },
  };
}

function createAppStateApi(
  dispatch: React.Dispatch<AppStateAction>,
  scheduleTextInputHistoryUpdate?: DebouncedFunc<() => void>,
) {
  return {
    update(updater: (dom: appDom.AppDom) => appDom.AppDom, view?: DomView) {
      dispatch({
        type: 'UPDATE',
        updater,
        view,
      });
    },
    undo() {
      scheduleTextInputHistoryUpdate?.flush();

      dispatch({ type: 'UNDO' });
    },
    redo() {
      dispatch({ type: 'REDO' });
    },
    setView(view: DomView) {
      dispatch({
        type: 'SET_VIEW',
        view,
      });
    },
    setTab(tab: PageViewTab) {
      dispatch({
        type: 'SET_TAB',
        tab,
      });
    },
    selectNode(nodeId: NodeId) {
      dispatch({
        type: 'SELECT_NODE',
        nodeId,
      });
    },
    hoverNode(nodeId: NodeId) {
      dispatch({
        type: 'HOVER_NODE',
        nodeId,
      });
    },
    blurHoverNode() {
      dispatch({
        type: 'BLUR_HOVER_NODE',
      });
    },
    deselectNode() {
      dispatch({
        type: 'DESELECT_NODE',
      });
    },
    setHasUnsavedChanges(hasUnsavedChanges: boolean) {
      dispatch({
        type: 'SET_HAS_UNSAVED_CHANGES',
        hasUnsavedChanges,
      });
    },
  };
}

export const [useAppStateContext, AppStateProvider] = createProvidedContext<AppState>('AppState');

export function useAppState(): AppState {
  const appState = useAppStateContext();

  if (!appState.dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }

  return appState;
}

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

const AppStateApiContext = React.createContext<AppStateApi>(createAppStateApi(() => undefined));

export type AppStateApi = ReturnType<typeof createAppStateApi>;

export function useAppStateApi(): AppStateApi {
  return React.useContext(AppStateApiContext);
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

type AppStateActionType = AppStateAction['type'];

const UNDOABLE_ACTIONS = new Set<AppStateActionType>([
  'UPDATE',
  'SET_VIEW',
  'SET_TAB',
  'SELECT_NODE',
  'DESELECT_NODE',
]);

function isCancellableAction(action: AppStateAction): boolean {
  return Boolean(action.type === 'SET_VIEW' || (action.type === 'UPDATE' && action.view));
}

export interface DomContextProps {
  children?: React.ReactNode;
}

export default function AppProvider({ children }: DomContextProps) {
  const { data: dom } = client.useQuery('loadDom', [], { suspense: true });

  invariant(dom, 'Suspense should load the dom');

  const location = useLocation();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);
  const firstPage = pages.length > 0 ? pages[0] : null;

  const initialView = getViewFromPathname(location.pathname) || {
    kind: 'page',
    nodeId: firstPage?.id,
    selectedNodeId: null,
    tab: 'page',
  };

  const [state, dispatch] = React.useReducer(appStateReducer, {
    // DOM state
    dom,
    // base path of the running application
    base: config.base,
    // DOM loader state
    savingDom: false,
    unsavedDomChanges: 0,
    saveDomError: null,
    savedDom: dom,
    // App state
    currentView: initialView,
    undoStack: [
      {
        dom,
        view: initialView,
        timestamp: Date.now(),
      },
    ],
    redoStack: [],
    hasUnsavedChanges: false,
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
        dispatch({ type: 'UPDATE_HISTORY' });
      }, 500),
    [],
  );

  const dispatchWithHistory = useEventCallback((action: AppStateAction) => {
    if (state.hasUnsavedChanges && isCancellableAction(action)) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(
        'You have unsaved changes. Are you sure you want to navigate away? All changes will be discarded.',
      );

      if (!ok) {
        return;
      }
    }

    dispatch(action);

    if (UNDOABLE_ACTIONS.has(action.type)) {
      if (hasFieldFocus()) {
        scheduleTextInputHistoryUpdate();
      } else {
        dispatch({ type: 'UPDATE_HISTORY' });
      }
    }
  });

  const domApi = React.useMemo(() => createDomApi(dispatchWithHistory), [dispatchWithHistory]);
  const appStateApi = React.useMemo(
    () => createAppStateApi(dispatchWithHistory, scheduleTextInputHistoryUpdate),
    [dispatchWithHistory, scheduleTextInputHistoryUpdate],
  );

  const fingerprint = React.useRef<number | undefined>();

  const handleSave = React.useCallback(() => {
    if (!state.dom || state.savingDom || state.savedDom === state.dom) {
      return;
    }

    const domToSave = state.dom;
    dispatch({ type: 'DOM_SAVING' });
    const domDiff = appDom.createDiff(state.savedDom, domToSave);
    client.methods
      .applyDomDiff(domDiff)
      .then(({ fingerprint: newFingerPrint }) => {
        fingerprint.current = newFingerPrint;
        dispatch({ type: 'DOM_SAVED', savedDom: domToSave });
      })
      .catch((err) => {
        dispatch({ type: 'DOM_SAVING_ERROR', error: err.message });
      });
  }, [state]);

  const debouncedHandleSave = useDebouncedHandler(handleSave, 100);

  React.useEffect(() => {
    debouncedHandleSave();
  }, [state.dom, debouncedHandleSave]);

  React.useEffect(() => {
    logUnsavedChanges(state.unsavedDomChanges);

    if (state.unsavedDomChanges <= 0 && !state.hasUnsavedChanges) {
      return () => {};
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = `You have unsaved changes. Are you sure you want to navigate away?`;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state.hasUnsavedChanges, state.unsavedDomChanges]);

  useShortcut({ key: 's', metaKey: true }, handleSave);

  return (
    <AppStateProvider value={state}>
      <AppStateApiContext.Provider value={appStateApi}>
        <DomApiContext.Provider value={domApi}>{children}</DomApiContext.Provider>
      </AppStateApiContext.Provider>
    </AppStateProvider>
  );
}
