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
import { ConfirmDialog } from '../components/SystemDialogs';

export type ComponentPanelTab = 'component' | 'theme';

export type DomAction = {
  type: 'DOM_UPDATE';
  updater: (dom: appDom.AppDom) => appDom.AppDom;
  selectedNodeId?: NodeId | null;
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
    };

export type AppStateAction =
  | DomLoaderAction
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
    }
  | {
      type: 'DOM_SET_HAS_UNSAVED_CHANGES';
      hasUnsavedChanges: boolean;
    };

export function domReducer(dom: appDom.AppDom, action: AppStateAction): appDom.AppDom {
  switch (action.type) {
    case 'DOM_UPDATE': {
      return action.updater(dom);
    }
    default:
      return dom;
  }
}

export interface DomLoader {
  dom: appDom.AppDom;
  savedDom: appDom.AppDom;
  savingDom: boolean;
  unsavedDomChanges: number;
  saveDomError: string | null;
}

export interface AppState extends DomLoader {
  selectedNodeId: NodeId | null;
  currentView: DomView;
  currentTab: ComponentPanelTab;
  undoStack: UndoRedoStackEntry[];
  redoStack: UndoRedoStackEntry[];
  hasUnsavedChanges: boolean;
}

export type PublicAppState = Pick<
  AppState,
  'dom' | 'selectedNodeId' | 'currentView' | 'currentTab' | 'hasUnsavedChanges'
>;

interface UndoRedoStackEntry
  extends Omit<PublicAppState, 'currentView' | 'currentTab' | 'hasUnsavedChanges'> {
  view: DomView;
  tab: ComponentPanelTab;
  timestamp: number;
}

export function domLoaderReducer(state: DomLoader, action: AppStateAction): DomLoader {
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
    default:
      return state;
  }
}

const UNDO_HISTORY_LIMIT = 100;

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  const domLoaderState = domLoaderReducer(state, action);

  state = { ...state, ...domLoaderState };

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
    case 'DOM_SET_HAS_UNSAVED_CHANGES': {
      return update(state, {
        hasUnsavedChanges: action.hasUnsavedChanges,
      });
    }
    default:
      return state;
  }
}

function createAppStateApi(
  dispatch: React.Dispatch<AppStateAction>,
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
    setHasUnsavedChanges(hasUnsavedChanges: boolean) {
      dispatch({
        type: 'DOM_SET_HAS_UNSAVED_CHANGES',
        hasUnsavedChanges,
      });
    },
  };
}

export function getNodeHashes(dom: appDom.AppDom): NodeHashes {
  return mapValues(dom.nodes, (node) => insecureHash(JSON.stringify(node)));
}

const [useAppStateContext, AppStateProvider] = createProvidedContext<AppState>('AppState');

export type AppStateApi = ReturnType<typeof createAppStateApi>;

const AppStateApiContext = React.createContext<AppStateApi>(createAppStateApi(() => undefined));

export { useAppStateContext };

export function useAppState(): PublicAppState {
  const { dom, selectedNodeId, currentView, currentTab, hasUnsavedChanges } = useAppStateContext();

  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }
  return { dom, selectedNodeId, currentView, currentTab, hasUnsavedChanges };
}

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

export interface DomContextProps {
  appId: string;
  children?: React.ReactNode;
}

type AppStateActionType = AppStateAction['type'];

const UNDOABLE_ACTIONS = new Set<AppStateActionType>([
  'DOM_UPDATE',
  'DOM_SET_VIEW',
  'DOM_SET_TAB',
  'SELECT_NODE',
  'DESELECT_NODE',
]);

function isCancellableAction(action: AppStateAction): boolean {
  return Boolean(action.type === 'DOM_SET_VIEW' || (action.type === 'DOM_UPDATE' && action.view));
}

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

  const [state, dispatch] = React.useReducer(appStateReducer, {
    savingDom: false,
    unsavedDomChanges: 0,
    saveDomError: null,
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
    hasUnsavedChanges: false,
  });

  const scheduleTextInputHistoryUpdate = React.useMemo(
    () =>
      debounce(() => {
        dispatch({ type: 'DOM_UPDATE_HISTORY' });
      }, 500),
    [],
  );

  const [isUnsavedChangesDialogVisible, setIsUnsavedChangesDialogVisible] = React.useState(false);
  const [unsavedChangesBlockedAction, setUnsavedChangesBlockedAction] =
    React.useState<AppStateAction | null>(null);

  const dispatchWithHistory = useEvent((action: AppStateAction, hasUnsavedChangesCheck = true) => {
    if (hasUnsavedChangesCheck && state.hasUnsavedChanges && isCancellableAction(action)) {
      setUnsavedChangesBlockedAction(action);
      setIsUnsavedChangesDialogVisible(true);
      return;
    }

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
    () => createAppStateApi(dispatchWithHistory, scheduleTextInputHistoryUpdate),
    [dispatchWithHistory, scheduleTextInputHistoryUpdate],
  );

  const handleSave = React.useCallback(() => {
    if (!state.dom || state.savingDom || state.savedDom === state.dom) {
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
    logUnsavedChanges(state.unsavedDomChanges);

    if (state.unsavedDomChanges <= 0) {
      return () => {};
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = `You have unsaved changes. Are you sure you want to navigate away?`;
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state.unsavedDomChanges]);

  useShortcut({ key: 's', metaKey: true }, handleSave);

  const handleUpdateBlockDialogClose = React.useCallback(
    (hasConfirmed: boolean) => {
      if (hasConfirmed && unsavedChangesBlockedAction) {
        dispatchWithHistory(unsavedChangesBlockedAction, false);
        setUnsavedChangesBlockedAction(null);
      }
      setIsUnsavedChangesDialogVisible(false);
    },
    [dispatchWithHistory, unsavedChangesBlockedAction],
  );

  return (
    <React.Fragment>
      <AppStateProvider value={state}>
        <AppStateApiContext.Provider value={api}>{children}</AppStateApiContext.Provider>
      </AppStateProvider>
      <ConfirmDialog
        title="Discard unsaved changes?"
        open={isUnsavedChangesDialogVisible}
        onClose={handleUpdateBlockDialogClose}
        okButton="OK"
      >
        You have unsaved changes. Are you sure you want to navigate away?
        <br />
        All changes will be discarded.
      </ConfirmDialog>
    </React.Fragment>
  );
}
