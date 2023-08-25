import { NodeId } from '@mui/toolpad-core';
import { matchPath } from 'react-router-dom';
import { APP_PAGE_ROUTE, APP_CONNECTION_ROUTE, APP_CODE_COMPONENT_ROUTE } from '../routes';

export type PageView = { kind: 'query'; nodeId: NodeId } | { kind: 'pageParameters' };

export type PageViewTab = 'page' | 'component' | 'theme';

export type DomView =
  | {
      kind: 'page';
      nodeId?: NodeId;
      view?: PageView;
      selectedNodeId?: NodeId | null;
      hoveredNodeId?: NodeId | null;
      tab?: PageViewTab;
    }
  | { kind: 'connection'; nodeId: NodeId }
  | { kind: 'codeComponent'; nodeId: NodeId };

export function getPathnameFromView(view: DomView): string {
  switch (view.kind) {
    case 'page':
      return view.nodeId ? `/app/pages/${view.nodeId}` : '/app/pages';
    case 'connection':
      return `/app/connections/${view.nodeId}`;
    case 'codeComponent':
      return `/app/codeComponents/${view.nodeId}`;
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
      tab: 'page',
    };
  }

  const connectionsRouteMatch = matchPath(APP_CONNECTION_ROUTE, pathname);
  if (connectionsRouteMatch?.params.nodeId) {
    return { kind: 'connection', nodeId: connectionsRouteMatch.params.nodeId as NodeId };
  }

  const codeComponentRouteMatch = matchPath(APP_CODE_COMPONENT_ROUTE, pathname);
  if (codeComponentRouteMatch?.params.nodeId) {
    return { kind: 'codeComponent', nodeId: codeComponentRouteMatch.params.nodeId as NodeId };
  }

  return null;
}
