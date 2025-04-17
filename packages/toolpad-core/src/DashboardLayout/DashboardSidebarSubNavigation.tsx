'use client';
import * as React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { NavigationContext } from '../shared/context';
import type { Navigation, NavigationPageItem } from '../AppProvider';
import {
  getItemPath,
  getItemTitle,
  hasSelectedNavigationChildren,
  isPageItem,
} from '../shared/navigation';
import { getDrawerSxTransitionMixin } from './utils';
import { useActivePage } from '../useActivePage';
import {
  DashboardSidebarPageItem,
  DashboardSidebarPageItemProps,
} from './DashboardSidebarPageItem';

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isPopover?: boolean;
  isFullyExpanded?: boolean;
  isFullyCollapsed?: boolean;
  hasDrawerTransitions?: boolean;
  renderPageItem?: (item: NavigationPageItem) => React.ReactNode;
}

export const DashboardSidebarPageItemContext =
  React.createContext<DashboardSidebarPageItemProps | null>(null);

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

  const renderNavigationPageItem = React.useCallback(
    (item: NavigationPageItem, itemIndex: number) => {
      const isActive = !!activePage && activePage.path === getItemPath(navigationContext, item);

      // Show as selected in mini sidebar if any of the children matches path, otherwise show as selected if item matches path
      const isSelected =
        activePage && item.children && isMini
          ? hasSelectedNavigationChildren(navigationContext, item, activePage.path)
          : isActive && !item.children;

      const pageItemId = `page-${depth}-${itemIndex}`;

      const pageItemDefaultProps = {
        id: pageItemId,
        item,
        onClick: handlePageItemClick,
        title: getItemTitle(item),
        href: getItemPath(navigationContext, item),
        expanded: expandedItemIds.includes(pageItemId),
        mini: isMini,
        selected: isSelected,
        isSidebarFullyExpanded: isFullyExpanded,
        isSidebarFullyCollapsed: isFullyCollapsed,
        renderNestedNavigation: () => (
          <DashboardSidebarSubNavigation
            subNavigation={item.children ?? []}
            depth={depth + 1}
            onLinkClick={onLinkClick}
            isPopover={isMini}
          />
        ),
      };

      return (
        <DashboardSidebarPageItemContext.Provider key={pageItemId} value={pageItemDefaultProps}>
          {renderPageItem ? (
            renderPageItem(item)
          ) : (
            <DashboardSidebarPageItem {...pageItemDefaultProps} />
          )}
        </DashboardSidebarPageItemContext.Provider>
      );
    },
    [
      activePage,
      depth,
      expandedItemIds,
      handlePageItemClick,
      isFullyCollapsed,
      isFullyExpanded,
      isMini,
      navigationContext,
      onLinkClick,
      renderPageItem,
    ],
  );

  return (
    <List
      sx={{
        padding: 0,
        mt: isPopover && depth === 1 ? 0.5 : 0,
        mb: depth === 0 && !isPopover ? 4 : 0.5,
        pl: (isPopover ? 1 : 2) * (isPopover ? depth - 1 : depth),
        minWidth: isPopover && depth === 1 ? 240 : 'auto',
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
            <Divider
              key={`divider-${depth}-${navigationItemIndex}`}
              component="li"
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
          );
        }

        return renderNavigationPageItem(navigationItem, navigationItemIndex);
      })}
    </List>
  );
}

export { DashboardSidebarSubNavigation };
