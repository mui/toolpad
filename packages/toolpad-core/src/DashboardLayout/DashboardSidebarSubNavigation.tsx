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
import { DashboardSidebarPageItem } from './DashboardSidebarPageItem';

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isPopover?: boolean;
  isFullyExpanded?: boolean;
  isFullyCollapsed?: boolean;
  hasDrawerTransitions?: boolean;
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
}: DashboardSidebarSubNavigationProps) {
  const navigationContext = React.useContext(NavigationContext);

  const activePage = useActivePage();

  const initialExpandedSidebarItemIds = React.useMemo(
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
        .map(({ originalIndex }) => `${depth}-${originalIndex}`),
    [activePage, depth, navigationContext, subNavigation],
  );

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(
    initialExpandedSidebarItemIds,
  );

  const handlePageItemClick = React.useCallback(
    (itemId: string, item: NavigationPageItem) => {
      if (item.children && !isMini) {
        setExpandedSidebarItemIds((previousValue) =>
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

        const isActive =
          !!activePage && activePage.path === getItemPath(navigationContext, navigationItem);

        // Show as selected in mini sidebar if any of the children matches path, otherwise show as selected if item matches path
        const isSelected =
          activePage && navigationItem.children && isMini
            ? hasSelectedNavigationChildren(navigationContext, navigationItem, activePage.path)
            : isActive && !navigationItem.children;

        const navigationItemId = `${depth}-${navigationItemIndex}`;

        const navigationItemDefaultProps = {
          id: navigationItemId,
          item: navigationItem,
          onClick: handlePageItemClick,
          title: getItemTitle(navigationItem),
          href: getItemPath(navigationContext, navigationItem),
          expanded: expandedSidebarItemIds.includes(navigationItemId),
          mini: isMini,
          selected: isSelected,
          isSidebarFullyExpanded: isFullyExpanded,
          isSidebarFullyCollapsed: isFullyCollapsed,
          renderNestedNavigation: () => (
            <DashboardSidebarSubNavigation
              subNavigation={navigationItem.children ?? []}
              depth={depth + 1}
              onLinkClick={onLinkClick}
              isPopover={isMini}
            />
          ),
        };

        return navigationItem.renderItem ? (
          navigationItem.renderItem(navigationItemDefaultProps)
        ) : (
          <DashboardSidebarPageItem key={navigationItemId} {...navigationItemDefaultProps} />
        );
      })}
    </List>
  );
}

export { DashboardSidebarSubNavigation };
