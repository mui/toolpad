import { NodeId } from '@mui/toolpad-core';
import { matchPath } from 'react-router-dom';
import { APP_PAGE_ROUTE } from '../routes';
import { QueryNode, FetchMode } from '../appDom';

export type QueryMeta = {
  name?: string;
  id?: NodeId;
  dataSource?: string;
  mode?: FetchMode;
};

export type QueryEditorTabType = 'config' | 'settings';

export type QueryEditorToolsTabType = 'preview' | 'devTools';

export type QueryTab = {
  meta: QueryMeta;
  saved?: QueryNode;
  draft?: QueryNode;
  tabType?: QueryEditorTabType;
  toolsTabType: QueryEditorToolsTabType;
  isPreviewLoading: boolean;
  previewHandler?: () => void;
};

export type QueryPanel = {
  queryTabs?: QueryTab[];
  currentTabIndex?: number;
};

export type PageView = { kind: 'query'; nodeId: NodeId } | { kind: 'pageParameters' };

export type PageViewTab = 'page' | 'component' | 'theme';

export type DomView = {
  kind: 'page';
  nodeId?: NodeId;
  view?: PageView;
  selectedNodeId?: NodeId | null;
  hoveredNodeId?: NodeId | null;
  pageViewTab?: PageViewTab;
  queryPanel?: QueryPanel;
};

export function getPathnameFromView(view: DomView): string {
  switch (view.kind) {
    case 'page':
      return view.nodeId ? `/app/pages/${view.nodeId}` : '/app/pages';
    default:
      throw new Error(`Unknown view "${(view as DomView).kind}".`);
  }
}

export function getViewFromPathname(pathname: string): DomView | null {
  const pageRouteMatch = matchPath(APP_PAGE_ROUTE, pathname);

  if (pageRouteMatch?.params.nodeId) {
    return {
      kind: 'page',
      nodeId: pageRouteMatch.params.nodeId as NodeId,
      selectedNodeId: null,
      pageViewTab: 'page',
    };
  }

  return null;
}
