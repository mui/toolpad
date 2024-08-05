import type { NavigationItem, NavigationPageItem, NavigationSubheaderItem } from '../AppProvider';

export const getItemKind = (item: NavigationItem) => item.kind ?? 'page';

export const isPageItem = (item: NavigationItem): item is NavigationPageItem =>
  getItemKind(item) === 'page';

export const getItemTitle = (item: NavigationPageItem | NavigationSubheaderItem) => {
  return isPageItem(item) ? (item.title ?? item.segment) : item.title;
};

export function hasSelectedNavigationChildren(
  navigationItem: NavigationItem,
  basePath: string,
  pathname: string,
): boolean {
  if (isPageItem(navigationItem) && navigationItem.children) {
    const navigationItemFullPath = `${basePath}${basePath && !navigationItem.segment ? '' : '/'}${navigationItem.segment ?? ''}`;

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

      const nestedNavigationItemFullPath = `${navigationItemFullPath}${navigationItemFullPath && !nestedNavigationItem.segment ? '' : '/'}${nestedNavigationItem.segment ?? ''}`;

      return nestedNavigationItemFullPath === pathname;
    });
  }

  return false;
}
