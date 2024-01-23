import { NodeId } from '@mui/toolpad-core';
import { matchPath } from 'react-router-dom';
import { QueryNode, FetchMode } from '@mui/toolpad-core/appDom';

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

const APP_PAGE_ROUTE = '/app/pages/:pageName';

export type PageView = { kind: 'query'; nodeId: NodeId };

export type PageViewTab = 'page' | 'component' | 'theme';

export type DomView = {
  kind: 'page';
  name?: string;
  view?: PageView;
  selectedNodeId?: NodeId | null;
  hoveredNodeId?: NodeId | null;
  pageViewTab?: PageViewTab;
  queryPanel?: QueryPanel;
  pageParametersDialogOpen?: boolean;
};

export function getPathnameFromView(view: DomView): string {
  switch (view.kind) {
    case 'page':
      return view.name ? `/app/pages/${view.name}` : '/app/pages';
    default:
      throw new Error(`Unknown view "${(view as DomView).kind}".`);
  }
}

export function getViewFromPathname(pathname: string): DomView | null {
  const pageRouteMatch = matchPath(APP_PAGE_ROUTE, pathname);
  if (pageRouteMatch?.params.pageName) {
    return {
      kind: 'page',
      name: pageRouteMatch.params.pageName,
      selectedNodeId: null,
      pageViewTab: 'page',
    };
  }

  return null;
}
