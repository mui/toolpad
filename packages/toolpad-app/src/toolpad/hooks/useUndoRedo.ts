import { useDomApi } from '../DomLoader';
import useShortcut from '../../utils/useShortcut';

export default function useUndoRedo() {
  const domApi = useDomApi();

  useShortcut({ key: 'z', metaKey: true, preventDefault: true }, () => {
    domApi.undo();
  });
  useShortcut({ key: 'z', metaKey: true, shiftKey: true, preventDefault: true }, () => {
    domApi.redo();
  });
}
