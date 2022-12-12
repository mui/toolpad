import * as React from 'react';
import { useDomApi } from '../DomLoader';

interface UseUndoRedoPayload {
  handleUndoRedoKeyDown: (event: KeyboardEvent) => void;
}

export default function useUndoRedo(): UseUndoRedoPayload {
  const domApi = useDomApi();

  const handleUndoRedoKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      const isZ = event.key.toLowerCase() === 'z';

      const undoShortcut = isZ && (event.metaKey || event.ctrlKey);
      const redoShortcut = undoShortcut && event.shiftKey;

      if (redoShortcut) {
        domApi.redo();
      } else if (undoShortcut) {
        domApi.undo();
      }
    },
    [domApi],
  );

  return {
    handleUndoRedoKeyDown,
  };
}
