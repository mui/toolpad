'use client';
import * as React from 'react';
import { NavigationContext, RouterContext } from '../shared/context';
import { getItemPath, getItemTitle, matchPath } from '../shared/navigation';
import type { Breadcrumb } from '../PageContainer';

export interface ActivePage {
  title: string;
  path: string;
  breadcrumbs: Breadcrumb[];
}

export function useActivePage(): ActivePage | null {
  const navigationContext = React.useContext(NavigationContext);
  const routerContext = React.useContext(RouterContext);
  const pathname = routerContext?.pathname ?? '/';
  const activeItem = matchPath(navigationContext, pathname);

  const rootItem = matchPath(navigationContext, '/');

  return React.useMemo(() => {
    if (!activeItem) {
      return null;
    }

    const breadcrumbs: Breadcrumb[] = [];

    if (rootItem) {
      breadcrumbs.push({
        title: getItemTitle(rootItem),
        path: '/',
      });
    }

    const segments = pathname.split('/').filter(Boolean);
    let prefix = '';
    for (const segment of segments) {
      const path = `${prefix}/${segment}`;
      prefix = path;
      const item = matchPath(navigationContext, path);
      if (!item) {
        continue;
      }
      const itemPath = getItemPath(navigationContext, item);
      const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastCrumb?.path !== itemPath) {
        breadcrumbs.push({
          title: getItemTitle(item),
          path: itemPath,
        });
      }
    }

    return {
      title: getItemTitle(activeItem),
      path: getItemPath(navigationContext, activeItem),
      breadcrumbs,
    };
  }, [activeItem, rootItem, pathname, navigationContext]);
}
