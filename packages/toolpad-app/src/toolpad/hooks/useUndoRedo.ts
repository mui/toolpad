import * as React from 'react';
import { useDom, useDomApi } from '../DomLoader';
import useShortcut from '../../utils/useShortcut';
import { hasFieldFocus } from '../../utils/fields';

export default function useUndoRedo() {
  const domApi = useDomApi();
  const { currentView } = useDom();

  const handleUndo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page') {
        event.preventDefault();
        domApi.undo();
      } else if (!hasFieldFocus()) {
        domApi.undo();
      }
    },
    [currentView.kind, domApi],
  );

  const handleRedo = React.useCallback(
    (event: KeyboardEvent) => {
      if (currentView.kind === 'page') {
        event.preventDefault();
        domApi.redo();
      } else if (!hasFieldFocus()) {
        domApi.redo();
      }
    },
    [currentView.kind, domApi],
  );

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, handleUndo);
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, handleRedo);
}
