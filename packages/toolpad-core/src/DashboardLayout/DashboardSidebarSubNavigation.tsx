'use client';
import * as React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import type {} from '@mui/material/themeCssVarsAugmentation';
import type { Navigation, NavigationPageItem } from '../AppProvider';
import {
  getItemPath,
  getItemTitle,
  hasSelectedNavigationChildren,
  isPageItem,
} from '../shared/navigation';
import { DashboardSidebarPageItemContext, NavigationContext } from '../shared/context';
import { getDrawerSxTransitionMixin } from './utils';
import { useActivePage } from '../useActivePage';
import {
  DashboardSidebarPageItem,
  DashboardSidebarPageItemContextProps,
} from './DashboardSidebarPageItem';
import { MINI_DRAWER_WIDTH } from './shared';

interface DashboardSidebarSubNavigationPageItemProps {
  id: string;
  item: NavigationPageItem;
  isExpanded: boolean;
  onClick: (itemId: string, item: NavigationPageItem) => void;
  depth: number;
  onLinkClick: () => void;
  isMini: boolean;
  isFullyExpanded: boolean;
  isFullyCollapsed: boolean;
  sidebarExpandedWidth: number | string;
  renderPageItem?: (item: NavigationPageItem, params: { mini: boolean }) => React.ReactNode;
}

/**
 * @ignore - internal component.
 */
function DashboardSidebarSubNavigationPageItem({
  id,
  item,
  isExpanded,
  onClick,
  depth,
  onLinkClick,
  isMini,
  isFullyExpanded,
  isFullyCollapsed,
  sidebarExpandedWidth,
  renderPageItem,
}: DashboardSidebarSubNavigationPageItemProps) {
  const navigationContext = React.useContext(NavigationContext);

  const activePage = useActivePage();

  const isActive = !!activePage && activePage.path === getItemPath(navigationContext, item);

  // Show as selected in mini sidebar if any of the children matches path, otherwise show as selected if item matches path
  const isSelected =
    activePage && item.children && isMini
      ? hasSelectedNavigationChildren(navigationContext, item, activePage.path)
      : isActive && !item.children;

  const pageItemContextProps: DashboardSidebarPageItemContextProps = React.useMemo(
    () => ({
      expanded: isExpanded,
      selected: isSelected,
      id,
      onClick,
      isMini,
      isSidebarFullyExpanded: isFullyExpanded,
      isSidebarFullyCollapsed: isFullyCollapsed,
      renderNestedNavigation: () => (
        <DashboardSidebarSubNavigation
          subNavigation={item.children ?? []}
          depth={depth + 1}
          onLinkClick={onLinkClick}
          isPopover={isMini}
          sidebarExpandedWidth={sidebarExpandedWidth}
          renderPageItem={renderPageItem}
        />
      ),
    }),
    [
      depth,
      id,
      isExpanded,
      isFullyCollapsed,
      isFullyExpanded,
      isMini,
      isSelected,
      item.children,
      onClick,
      onLinkClick,
      sidebarExpandedWidth,
    ],
  );

  return (
    <DashboardSidebarPageItemContext.Provider value={pageItemContextProps}>
      {renderPageItem ? (
        renderPageItem(item, { mini: isMini })
      ) : (
        <DashboardSidebarPageItem item={item} />
      )}
    </DashboardSidebarPageItemContext.Provider>
  );
}

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isPopover?: boolean;
  isFullyExpanded?: boolean;
  isFullyCollapsed?: boolean;
  hasDrawerTransitions?: boolean;
  sidebarExpandedWidth: number | string;
  renderPageItem?: (item: NavigationPageItem, params: { mini: boolean }) => React.ReactNode;
}

/**
 * @ignore - internal component.
 */
function DashboardSidebarSubNavigation({
  subNavigation,
  depth = 0,
  onLinkClick,
  isMini = false,
  isPopover = false,
  isFullyExpanded = true,
  isFullyCollapsed = false,
  hasDrawerTransitions = false,
  sidebarExpandedWidth,
  renderPageItem,
}: DashboardSidebarSubNavigationProps) {
  const navigationContext = React.useContext(NavigationContext);

  const activePage = useActivePage();

  const initialExpandedItemIds = React.useMemo(
    () =>
      subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            isPageItem(navigationItem) &&
            !!activePage &&
            hasSelectedNavigationChildren(navigationContext, navigationItem, activePage.path),
        )
        .map(({ originalIndex }) => `page-${depth}-${originalIndex}`),
    [activePage, depth, navigationContext, subNavigation],
  );

  const [expandedItemIds, setExpandedItemIds] = React.useState(initialExpandedItemIds);

  const handlePageItemClick = React.useCallback(
    (itemId: string, item: NavigationPageItem) => {
      if (item.children && !isMini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter((previousValueItemId) => previousValueItemId !== itemId)
            : [...previousValue, itemId],
        );
      } else if (!item.children) {
        onLinkClick();
      }
    },
    [isMini, onLinkClick],
  );

  return (
    <List
      sx={{
        padding: 0,
        mt: isPopover && depth === 1 ? 0.5 : 0,
        mb: depth === 0 && !isPopover ? 4 : 0.5,
        pl: (isPopover ? 1 : 2) * (isPopover ? depth - 1 : depth),
        minWidth: isPopover && depth === 1 ? 240 : 'auto',
        width: isMini ? MINI_DRAWER_WIDTH : 'auto',
      }}
    >
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          return (
            <ListSubheader
              key={`subheader-${depth}-${navigationItemIndex}`}
              sx={{
                fontSize: 12,
                fontWeight: '700',
                height: isMini ? 0 : 40,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'height')
                  : {}),
                px: 2,
                minWidth: sidebarExpandedWidth,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              {getItemTitle(navigationItem)}
            </ListSubheader>
          );
        }

        if (navigationItem.kind === 'divider') {
          const nextItem = subNavigation[navigationItemIndex + 1];

          return (
            <li key={`divider-${depth}-${navigationItemIndex}`}>
              <Divider
                sx={{
                  borderBottomWidth: 2,
                  mx: 1,
                  mt: 1,
                  mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
                  ...(hasDrawerTransitions
                    ? getDrawerSxTransitionMixin(isFullyExpanded, 'margin')
                    : {}),
                }}
              />
            </li>
          );
        }

        const pageItemId = `page-${depth}-${navigationItemIndex}`;

        return (
          <DashboardSidebarSubNavigationPageItem
            key={pageItemId}
            id={pageItemId}
            item={navigationItem}
            isExpanded={expandedItemIds.includes(pageItemId)}
            onClick={handlePageItemClick}
            depth={depth}
            onLinkClick={onLinkClick}
            isMini={isMini}
            isFullyExpanded={isFullyExpanded}
            isFullyCollapsed={isFullyCollapsed}
            sidebarExpandedWidth={sidebarExpandedWidth}
            renderPageItem={renderPageItem}
          />
        );
      })}
    </List>
  );
}

export { DashboardSidebarSubNavigation };
