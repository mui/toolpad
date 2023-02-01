import * as React from 'react';
import { useEditorState, useEditorStateApi } from '../AppState';
import useShortcut from '../../utils/useShortcut';
import { hasFieldFocus } from '../../utils/fields';

export default function useUndoRedo() {
  const { currentView } = useEditorState();

  const editorStateApi = useEditorStateApi();

  const currentPageView = currentView.kind === 'page' ? currentView.view : null;

  const handleUndo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        editorStateApi.undo();
      } else if (!hasFieldFocus()) {
        editorStateApi.undo();
      }
    },
    [currentView.kind, currentPageView, editorStateApi],
  );

  const handleRedo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page' && !currentPageView) {
        event.preventDefault();
        editorStateApi.redo();
      } else if (!hasFieldFocus()) {
        editorStateApi.redo();
      }
    },
    [currentView.kind, currentPageView, editorStateApi],
  );

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, handleUndo);
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, handleRedo);
}
