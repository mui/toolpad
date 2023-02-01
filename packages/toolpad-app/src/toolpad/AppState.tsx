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

export function getNodeHashes(dom: appDom.AppDom): NodeHashes {
  return mapValues(dom.nodes, (node) => insecureHash(JSON.stringify(node)));
}

export type ComponentPanelTab = 'component' | 'theme';

export type DomAction = {
  type: 'UPDATE';
  updater?: (dom: appDom.AppDom) => appDom.AppDom;
  selectedNodeId?: NodeId | null;
  view?: DomView;
};

export type DomLoaderAction =
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

export type EditorStateAction =
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
      type: 'SET_HAS_UNSAVED_CHANGES';
      hasUnsavedChanges: boolean;
    };

type AppStateAction = DomAction | DomLoaderAction | EditorStateAction;

export function domReducer(dom: appDom.AppDom, action: AppStateAction): appDom.AppDom {
  switch (action.type) {
    case 'UPDATE': {
      return action.updater ? action.updater(dom) : dom;
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

export interface AppState extends DomLoader {
  selectedNodeId: NodeId | null;
  currentView: DomView;
  currentTab: ComponentPanelTab;
  undoStack: UndoRedoStackEntry[];
  redoStack: UndoRedoStackEntry[];
  hasUnsavedChanges: boolean;
}

export type EditorState = Pick<
  AppState,
  'dom' | 'selectedNodeId' | 'currentView' | 'currentTab' | 'hasUnsavedChanges'
>;

interface UndoRedoStackEntry
  extends Omit<EditorState, 'currentView' | 'currentTab' | 'hasUnsavedChanges'> {
  view: DomView;
  tab: ComponentPanelTab;
  timestamp: number;
}

const UNDO_HISTORY_LIMIT = 100;

export function appStateReducer(state: AppState, action: AppStateAction): AppState {
  const domLoaderState = domLoaderReducer(state, action);

  state = { ...state, ...domLoaderState };

  switch (action.type) {
    case 'UPDATE_HISTORY': {
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
        selectedNodeId: previousStackEntry.selectedNodeId,
        currentView: previousStackEntry.view,
        currentTab: previousStackEntry.tab,
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
    case 'UPDATE': {
      const { selectedNodeId, view } = action;

      return update(state, {
        ...(typeof selectedNodeId !== 'undefined'
          ? { selectedNodeId, currentTab: 'component' }
          : {}),
        ...(view ? { currentView: view } : {}),
      });
    }
    case 'SET_VIEW': {
      return update(state, {
        currentView: action.view,
      });
    }
    case 'SET_TAB': {
      return update(state, {
        currentTab: action.tab,
      });
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

function createAppStateApi(dispatch: React.Dispatch<AppStateAction>) {
  return {
    update(
      updater: (dom: appDom.AppDom) => appDom.AppDom,
      extraUpdates: {
        view?: DomView;
        selectedNodeId?: NodeId | null;
      } = {},
    ) {
      dispatch({
        type: 'UPDATE',
        updater,
        ...extraUpdates,
      });
    },
  };
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

function createEditorApi(
  dispatch: React.Dispatch<AppStateAction>,
  scheduleTextInputHistoryUpdate?: DebouncedFunc<() => void>,
) {
  return {
    update(view?: DomView, selectedNodeId?: NodeId | null) {
      dispatch({
        type: 'UPDATE',
        view,
        selectedNodeId,
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
    setTab(tab: ComponentPanelTab) {
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

const [useAppStateContext, AppStateProvider] = createProvidedContext<AppState>('AppState');

export function useDom(): Pick<AppState, 'dom'> {
  const { dom } = useAppStateContext();

  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }

  return { dom };
}

export function useDomLoader(): DomLoader {
  const { dom, savedDom, savingDom, unsavedDomChanges, saveDomError } = useAppStateContext();

  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }

  return { dom, savedDom, savingDom, unsavedDomChanges, saveDomError };
}

export function useEditorState(): EditorState {
  const { dom, selectedNodeId, currentView, currentTab, hasUnsavedChanges } = useAppStateContext();

  if (!dom) {
    throw new Error("Trying to access the DOM before it's loaded");
  }

  return { dom, selectedNodeId, currentView, currentTab, hasUnsavedChanges };
}

const AppStateApiContext = React.createContext<AppStateApi>(createAppStateApi(() => undefined));

export type AppStateApi = ReturnType<typeof createAppStateApi>;

export function useAppStateApi(): AppStateApi {
  return React.useContext(AppStateApiContext);
}

const DomApiContext = React.createContext<DomApi>(createDomApi(() => undefined));

export type DomApi = ReturnType<typeof createDomApi>;

export function useDomApi(): DomApi {
  return React.useContext(DomApiContext);
}

const EditorStateApiContext = React.createContext<EditorStateApi>(createEditorApi(() => undefined));

export type EditorStateApi = ReturnType<typeof createEditorApi>;

export function useEditorStateApi(): EditorStateApi {
  return React.useContext(EditorStateApiContext);
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
  appId: string;
  children?: React.ReactNode;
}

export default function AppProvider({ appId, children }: DomContextProps) {
  const { data: dom } = client.useQuery('loadDom', [appId], { suspense: true });

  invariant(dom, 'Suspense should load the dom');

  const location = useLocation();

  const app = appDom.getApp(dom);
  const { pages = [] } = appDom.getChildNodes(dom, app);
  const firstPage = pages.length > 0 ? pages[0] : null;

  const initialView = getViewFromPathname(location.pathname) || {
    kind: 'page',
    nodeId: firstPage?.id,
  };

  const [state, dispatch] = React.useReducer(appStateReducer, {
    // DOM state
    dom,
    // DOM loader state
    savingDom: false,
    unsavedDomChanges: 0,
    saveDomError: null,
    savedDom: dom,
    // Editor state
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
        dispatch({ type: 'UPDATE_HISTORY' });
      }, 500),
    [],
  );

  const dispatchWithHistory = useEvent((action: AppStateAction) => {
    if (state.hasUnsavedChanges && isCancellableAction(action)) {
      // eslint-disable-next-line no-alert
      const ok = window.confirm(
        'You have unsaved changes. Are you sure you want to navigate away?\nAll changes will be discarded.',
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

  const appStateApi = React.useMemo(
    () => createAppStateApi(dispatchWithHistory),
    [dispatchWithHistory],
  );
  const domApi = React.useMemo(() => createDomApi(dispatchWithHistory), [dispatchWithHistory]);
  const editorApi = React.useMemo(
    () => createEditorApi(dispatchWithHistory, scheduleTextInputHistoryUpdate),
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
        <DomApiContext.Provider value={domApi}>
          <EditorStateApiContext.Provider value={editorApi}>
            {children}
          </EditorStateApiContext.Provider>
        </DomApiContext.Provider>
      </AppStateApiContext.Provider>
    </AppStateProvider>
  );
}
