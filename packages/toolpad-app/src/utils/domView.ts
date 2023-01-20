import { NodeId } from '@mui/toolpad-core';
import { matchPath } from 'react-router-dom';
import { APP_PAGE_ROUTE, APP_CONNECTION_ROUTE, APP_CODE_COMPONENT_ROUTE } from '../routes';

export type PageView =
  | { kind: 'query'; nodeId: NodeId }
  | { kind: 'pageModule' }
  | { kind: 'pageParameters' };

export type DomView =
  | { kind: 'page'; nodeId?: NodeId; view?: PageView }
  | { kind: 'connection'; nodeId: NodeId }
  | { kind: 'codeComponent'; nodeId: NodeId };

export function getPathnameFromView(appId: string, view: DomView): string | null {
  switch (view.kind) {
    case 'page':
      return `/app/${appId}/pages/${view.nodeId}`;
    case 'connection':
      return `/app/${appId}/connections/${view.nodeId}`;
    case 'codeComponent':
      return `/app/${appId}/codeComponents/${view.nodeId}`;
    default:
      return null;
  }
}

export function getViewFromPathname(pathname: string): DomView | null {
  const pageRouteMatch = matchPath(APP_PAGE_ROUTE, pathname);
  if (pageRouteMatch?.params.nodeId) {
    return { kind: 'page', nodeId: pageRouteMatch.params.nodeId as NodeId };
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
