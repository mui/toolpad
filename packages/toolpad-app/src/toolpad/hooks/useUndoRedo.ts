import * as React from 'react';
import { useDom, useDomApi } from '../DomLoader';
import useShortcut from '../../utils/useShortcut';
import { hasFieldFocus } from '../../utils/fields';

export default function useUndoRedo() {
  const domApi = useDomApi();
  const { currentView } = useDom();

  const currentPageView = currentView.kind === 'page' ? currentView.view : null;

  const handleUndo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        domApi.undo();
      } else if (!hasFieldFocus()) {
        domApi.undo();
      }
    },
    [currentView.kind, currentPageView, domApi],
  );

  const handleRedo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        domApi.redo();
      } else if (!hasFieldFocus()) {
        domApi.redo();
      }
    },
    [currentView.kind, currentPageView, domApi],
  );

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, handleUndo);
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, handleRedo);
}
