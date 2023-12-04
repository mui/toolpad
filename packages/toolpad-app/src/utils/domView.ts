import { NodeId } from '@mui/toolpad-core';
import { matchPath } from 'react-router-dom';

const APP_PAGE_ROUTE = '/app/pages/:pageName';

export type PageView = { kind: 'query'; nodeId: NodeId } | { kind: 'pageParameters' };

export type PageViewTab = 'page' | 'component' | 'theme';

export type DomView = {
  kind: 'page';
  name?: string;
  view?: PageView;
  selectedNodeId?: NodeId | null;
  hoveredNodeId?: NodeId | null;
  tab?: PageViewTab;
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
      tab: 'page',
    };
  }

  return null;
}
