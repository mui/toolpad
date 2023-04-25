import * as React from 'react';
import { useAppState, useAppStateApi } from '../AppState';
import useShortcut from '../../utils/useShortcut';
import { hasFieldFocus } from '../../utils/fields';

export default function useUndoRedo() {
  const { currentView } = useAppState();

  const appStateApi = useAppStateApi();

  const currentPageView = currentView.kind === 'page' ? currentView.view : null;

  const handleUndo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        appStateApi.undo();
      } else if (!hasFieldFocus()) {
        appStateApi.undo();
      }
    },
    [currentView.kind, currentPageView, appStateApi],
  );

  const handleRedo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        appStateApi.redo();
      } else if (!hasFieldFocus()) {
        appStateApi.redo();
      }
    },
    [currentView.kind, currentPageView, appStateApi],
  );

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, handleUndo);
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, handleRedo);
}
