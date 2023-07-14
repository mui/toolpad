import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { DomView } from '../../../utils/domView';
import { AppStateApi } from '../../AppState';
import deleteOrphanedLayoutNodes from './deleteOrphanedLayoutNodes';
import normalizePageRowColumnSizes from './normalizePageRowColumnSizes';

export default function deleteNode(
  nodeId: NodeId,
  pageNode: appDom.PageNode | null,
  currentView: DomView,
  appStateApi: AppStateApi,
  dom: appDom.AppDom,
) {
  appStateApi.update(
    (draft) => {
      const toRemove = appDom.getNode(draft, nodeId);

      if (appDom.isElement(toRemove)) {
        draft = appDom.removeMaybeNode(draft, toRemove.id);
        draft = deleteOrphanedLayoutNodes(dom, draft, toRemove);
      }

      return normalizePageRowColumnSizes(draft, pageNode);
    },
    {
      ...(currentView as Extract<DomView, { kind: 'page' }>),
      selectedNodeId: null,
    },
  );
}
