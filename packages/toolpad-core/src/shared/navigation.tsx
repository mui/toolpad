import type { NavigationItem, NavigationPageItem, NavigationSubheaderItem } from '../AppProvider';

export const getItemKind = (item: NavigationItem) => item.kind ?? 'page';

export const isPageItem = (item: NavigationItem): item is NavigationPageItem =>
  getItemKind(item) === 'page';

export const getItemTitle = (item: NavigationPageItem | NavigationSubheaderItem) => {
  return isPageItem(item) ? item.title ?? item.segment ?? '' : item.title;
};

export function getPageItemFullPath(basePath: string, navigationItem: NavigationPageItem) {
  return `${basePath}${basePath && !navigationItem.segment ? '' : '/'}${navigationItem.segment ?? ''}`;
}
