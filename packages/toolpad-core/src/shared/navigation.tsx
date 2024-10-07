import { pathToRegexp } from 'path-to-regexp';
import invariant from 'invariant';
import type {
  Navigation,
  NavigationItem,
  NavigationPageItem,
  NavigationSubheaderItem,
} from '../AppProvider';

export const getItemKind = (item: NavigationItem) => item.kind ?? 'page';

export const isPageItem = (item: NavigationItem): item is NavigationPageItem =>
  getItemKind(item) === 'page';

export const getItemTitle = (item: NavigationPageItem | NavigationSubheaderItem) => {
  return isPageItem(item) ? (item.title ?? item.segment ?? '') : item.title;
};

export function getPageItemFullPath(basePath: string, navigationItem: NavigationPageItem) {
  return `${basePath}${basePath && !navigationItem.segment ? '' : '/'}${navigationItem.segment ?? ''}`;
}

export function isPageItemSelected(
  navigationItem: NavigationPageItem,
  basePath: string,
  pathname: string,
) {
  return navigationItem.pattern
    ? pathToRegexp(`${basePath}/${navigationItem.pattern}`).test(pathname)
    : getPageItemFullPath(basePath, navigationItem) === pathname;
}

export function hasSelectedNavigationChildren(
  navigationItem: NavigationItem,
  basePath: string,
  pathname: string,
): boolean {
  if (isPageItem(navigationItem) && navigationItem.children) {
    const navigationItemFullPath = getPageItemFullPath(basePath, navigationItem);

    return navigationItem.children.some((nestedNavigationItem) => {
      if (!isPageItem(nestedNavigationItem)) {
        return false;
      }

      if (nestedNavigationItem.children) {
        return hasSelectedNavigationChildren(
          nestedNavigationItem,
          navigationItemFullPath,
          pathname,
        );
      }

      return isPageItemSelected(nestedNavigationItem, navigationItemFullPath, pathname);
    });
  }

  return false;
}

/**
 * Builds a map of navigation page items to their respective paths. This map is used to quickly
 * lookup the path of a navigation item. It will be cached for the lifetime of the navigation.
 */
function buildItemToPathMap(navigation: Navigation): Map<NavigationPageItem, string> {
  const map = new Map<NavigationPageItem, string>();

  const visit = (item: NavigationItem, base: string) => {
    if (isPageItem(item)) {
      const path = `${base}${item.segment ? `/${item.segment}` : ''}` || '/';
      map.set(item, path);
      if (item.children) {
        for (const child of item.children) {
          visit(child, path);
        }
      }
    }
  };

  for (const item of navigation) {
    visit(item, '');
  }

  return map;
}

const itemToPathMapCache = new WeakMap<Navigation, Map<NavigationPageItem, string>>();

/**
 * Gets the cached map of navigation page items to their respective paths.
 */
function getItemToPathMap(navigation: Navigation) {
  let map = itemToPathMapCache.get(navigation);
  if (!map) {
    map = buildItemToPathMap(navigation);
    itemToPathMapCache.set(navigation, map);
  }
  return map;
}

/**
 * Build a lookup map of paths to navigation items. This map is used to match paths against
 * to find the active page.
 */
function buildItemLookup(navigation: Navigation) {
  const map = new Map<string | RegExp, NavigationPageItem>();
  const visit = (item: NavigationItem) => {
    if (isPageItem(item)) {
      const path = getItemPath(navigation, item);
      if (map.has(path)) {
        console.warn(`Duplicate path in navigation: ${path}`);
      }
      map.set(path, item);
      if (item.pattern) {
        const basePath = item.segment ? path.slice(0, -item.segment.length) : path;
        map.set(pathToRegexp(basePath + item.pattern), item);
      }
      if (item.children) {
        for (const child of item.children) {
          visit(child);
        }
      }
    }
  };
  for (const item of navigation) {
    visit(item);
  }
  return map;
}
const itemLookupMapCache = new WeakMap<Navigation, Map<string | RegExp, NavigationPageItem>>();
function getItemLookup(navigation: Navigation) {
  let map = itemLookupMapCache.get(navigation);
  if (!map) {
    map = buildItemLookup(navigation);
    itemLookupMapCache.set(navigation, map);
  }
  return map;
}

/**
 * Matches a path against the navigation to find the active page. i.e. the page that should be
 * marked as selected in the navigation.
 */
export function matchPath(navigation: Navigation, path: string): NavigationPageItem | null {
  const lookup = getItemLookup(navigation);

  for (const [key, item] of lookup.entries()) {
    if (typeof key === 'string' && key === path) {
      return item;
    }
    if (key instanceof RegExp && key.test(path)) {
      return item;
    }
  }

  return null;
}

/**
 * Gets the path for a specific navigation page item.
 */
export function getItemPath(navigation: Navigation, item: NavigationPageItem): string {
  const map = getItemToPathMap(navigation);
  const path = map.get(item);
  invariant(path, `Item not found in navigation: ${item.title}`);
  return path;
}
