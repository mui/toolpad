import { useDomApi } from '../DomLoader';
import { hasFieldFocus } from '../../utils/fields';
import useShortcut from '../../utils/useShortcut';

export default function useUndoRedo() {
  const domApi = useDomApi();

  useShortcut({ key: 'z', metaKey: true, preventDefault: false }, () => {
    if (!hasFieldFocus()) {
      domApi.undo();
    }
  });
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: false }, () => {
    if (!hasFieldFocus()) {
      domApi.redo();
    }
  });
}
